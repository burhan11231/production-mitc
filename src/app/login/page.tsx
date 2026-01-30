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
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'

const MAX_ATTEMPTS = 5
const LOCK_TIME_MS = 5 * 60 * 1000

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  // 🔐 Deactivated account flow (same modal)
  const [pendingUser, setPendingUser] = useState<User | null>(null)

  /* 🔒 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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

  /* ================= LOGIN ================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return toast.error('Account temporarily locked')

    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await postAuthCheck(cred.user)
    } catch (e: any) {
      recordFailure()
      toast.error(
        e.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : 'Login failed'
      )
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      await postAuthCheck(user)
    } catch {
      toast.error('Google login failed')
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  const postAuthCheck = async (user: User) => {
    const snap = await getDoc(doc(db, 'users', user.uid))

    if (!snap.exists()) {
      await signOut(auth)
      toast.error('Account does not exist')
      return
    }

    if (snap.data().isDisabled === true) {
      setPendingUser(user)
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
      const res = await fetch('/api/account/activate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error()

      toast.success(
        'Account activated. Please sign in again for security reasons.'
      )

      await signOut(auth)
      setPendingUser(null)
    } catch {
      toast.error('Failed to activate account')
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  const cancelActivation = async () => {
    setPendingUser(null)
    await signOut(auth)
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">

      {/* MODAL WRAPPER */}
      <div className="min-h-full flex justify-center px-4 py-10">

        {/* MODAL */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">

          {/* HEADER */}      
          <div className="text-center mb-6">      
            <h1 className="text-2xl font-bold text-gray-900">      
              {pendingUser ? 'Restore account access' : 'Welcome back'}      
            </h1>      
            <p className="text-sm text-gray-600 mt-1">      
              {pendingUser      
                ? 'Your account access is paused. Activate it and log in again.'      
                : 'Log in to your MITC account'}      
            </p>      
          </div>

          {/* 🔐 ACTIVATION FLOW (same modal) */}
          {pendingUser ? (
            <div className="space-y-4">
              <button
                onClick={activateAccount}
                disabled={loading}
                className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
              >
                {loading ? 'Activating…' : 'Activate account'}
              </button>

              <button
                onClick={cancelActivation}
                className="w-full h-11 rounded-lg border font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>


              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* GOOGLE */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 border rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition"
              >
                <FcGoogle size={22} />
                Continue with Google
              </button>

<p className="mt-6 text-center text-sm">
  <Link
    href="/password-reset"
    className="text-blue-600 font-semibold hover:underline"
  >
    Forgot password?
  </Link>
</p>


              {/* SIGNUP LINK */}
              <p className="mt-6 text-sm text-gray-600 text-center">
                Don’t have an account?{' '}
                <Link href="/signup" className="font-semibold text-blue-600">
                  Create one
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}