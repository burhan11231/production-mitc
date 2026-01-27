'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { Laptop } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

const MAX_ATTEMPTS = 5
const LOCK_TIME_MS = 5 * 60 * 1000

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  // 🔐 Deactivated account state
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const [showDeactivated, setShowDeactivated] = useState(false)

  const currentYear = new Date().getFullYear()

  const keyFail = `login_fail_${email}`
  const keyLock = `login_lock_${email}`
  const isLocked = Boolean(lockedUntil && Date.now() < lockedUntil)

  useEffect(() => {
    if (!email) return
    const lock = localStorage.getItem(keyLock)
    if (lock) setLockedUntil(Number(lock))
  }, [email])

  const recordFailure = () => {
    const count = Number(localStorage.getItem(keyFail) || 0) + 1
    localStorage.setItem(keyFail, String(count))
    if (count >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCK_TIME_MS
      localStorage.setItem(keyLock, String(until))
      setLockedUntil(until)
      toast.error('Too many failed attempts. Locked for 5 minutes.')
    }
  }

  const clearFailures = () => {
    localStorage.removeItem(keyFail)
    localStorage.removeItem(keyLock)
    setLockedUntil(null)
  }

  /* ================= EMAIL LOGIN ================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return toast.error('Account temporarily locked')

    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await postAuthCheck(cred.user)
    } catch (e: any) {
      recordFailure()

      if (e.code === 'auth/user-not-found') {
        toast.error('User does not exist. Please create an account.')
      } else if (e.code === 'auth/wrong-password') {
        toast.error('Incorrect password')
      } else {
        toast.error('Login failed')
      }
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  /* ================= GOOGLE LOGIN ================= */

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      await postAuthCheck(user)
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        toast('Google login cancelled')
      } else {
        toast.error('Google login failed')
      }
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  /* ================= POST AUTH CHECK ================= */

  const postAuthCheck = async (user: User) => {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      await signOut(auth)
      toast.error('User does not exist. Please create an account.')
      return
    }

    if (snap.data().isDisabled === true) {
      setPendingUser(user)
      setShowDeactivated(true)
      return
    }

    clearFailures()
    router.push('/')
  }

  /* ================= ACTIVATE ACCOUNT ================= */

const activateAccount = async () => {
  if (!pendingUser) return

  try {
    setLoading(true)

    const token = await pendingUser.getIdToken()
    if (!token) throw new Error('Unauthorized')

    const res = await fetch('/api/account/activate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('Activation failed')

    toast.success('Account activated successfully')
    clearFailures()

    // force clean login
    await signOut(auth)
    router.replace('/login')
  } catch (e: any) {
    toast.error(e.message || 'Failed to activate account')
    await signOut(auth)
  } finally {
    setShowDeactivated(false)
    setPendingUser(null)
    setLoading(false)
  }
}

const cancelActivation = async () => {
  setShowDeactivated(false)
  setPendingUser(null)
  await signOut(auth)
}

  /* ================= UI ================= */

  return (
    <div className="relative flex bg-sky-50/60 min-h-[calc(100vh-64px)]">

      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <Laptop size={260} strokeWidth={1} className="text-sky-700 opacity-90" />
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 px-6 py-6 sm:py-10">
        <div className="max-w-md mx-auto">

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-600 mb-8">Use your registered credentials</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLocked}
              className="input-field"
            />

            <button
              disabled={loading || isLocked}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-8 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border rounded-lg font-semibold flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="mt-8 text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* 🔐 DEACTIVATED MODAL */}
      {showDeactivated && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Account deactivated
            </h3>
            <p className="text-sm text-gray-600">
              Your account is currently deactivated.  
              Would you like to activate it now?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelActivation}
                className="flex-1 h-10 rounded-full border font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={activateAccount}
                className="flex-1 h-10 rounded-full bg-blue-600 text-white font-semibold"
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div
        className="absolute left-0 right-0 text-center text-xs text-gray-400"
        style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        © MITC {currentYear}
      </div>
    </div>
  )
}