'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { Laptop } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

interface SignupForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  /* ================= EMAIL SIGNUP ================= */

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )

      const user = cred.user

      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        await signOut(auth)
        const data = snap.data()

        if (data.isDisabled) {
          toast.error(
            'Account already exists and is deactivated. Please login to activate.'
          )
        } else {
          toast.error('User already registered. Please login.')
        }
        return
      }

      await updateProfile(user, {
        displayName: form.name,
      })

      await setDoc(ref, {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: 'user',
        photoURL: '',
        isDisabled: false,
        createdAt: serverTimestamp(),
      })

      toast.success('Account created successfully')
      router.push('/profile')
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        toast.error('User already registered. Please login.')
      } else if (e.code === 'auth/invalid-email') {
        toast.error('Invalid email address')
      } else if (e.code === 'auth/weak-password') {
        toast.error('Password is too weak')
      } else {
        toast.error('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  /* ================= GOOGLE SIGNUP ================= */

  const handleGoogleSignup = async () => {
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)

      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        await signOut(auth)

        if (snap.data().isDisabled) {
          toast.error(
            'Account already exists and is deactivated. Please login to activate.'
          )
        } else {
          toast.error('User already registered. Please login.')
        }
        return
      }

      await setDoc(ref, {
        uid: user.uid,
        name: user.displayName || 'Google User',
        email: user.email,
        phone: '',
        role: 'user',
        photoURL: user.photoURL || '',
        isDisabled: false,
        createdAt: serverTimestamp(),
      })

      toast.success('Account created successfully')
      router.push('/profile')
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        toast('Google signup cancelled')
      } else if (e.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups.')
      } else {
        toast.error('Google signup failed')
      }
    } finally {
      setLoading(false)
    }
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

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-600 mb-8">
            Join MITC community
          </p>

          <form onSubmit={handleSignup} className="space-y-4">

            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={onChange}
              required
              className="input-field"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
              className="input-field"
            />

            <input
              name="phone"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={onChange}
              className="input-field"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
              className="input-field"
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={onChange}
              required
              className="input-field"
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <div className="my-8 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 border rounded-lg font-semibold flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          {/* ✅ LEGAL CONSENT */}
          <p className="mt-8 text-xs text-gray-500 leading-relaxed">
            By creating the account, you indicate that you have read,
            understood, and agree to our{' '}
            <Link href="/terms" className="text-blue-600 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 font-medium">
              Privacy Policy
            </Link>.
          </p>

          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}