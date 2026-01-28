'use client'

import { useState, useEffect } from 'react'
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

  /* 🔒 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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
        toast.error('User already registered. Please login.')
        return
      }

      await updateProfile(user, { displayName: form.name })

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
      toast.error('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ================= GOOGLE SIGNUP ================= */

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())

      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        await signOut(auth)
        toast.error('User already registered. Please login.')
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
    } catch {
      toast.error('Google signup failed')
    } finally {
      setLoading(false)
    }
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
              Welcome to Mateen IT Corp
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create your account to connect with MITC
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignup} className="space-y-4">
            <input name="name" placeholder="Full name" required onChange={onChange} className="input-field" />
            <input name="email" type="email" placeholder="Email" required onChange={onChange} className="input-field" />
            <input name="phone" placeholder="Phone (optional)" onChange={onChange} className="input-field" />
            <input name="password" type="password" placeholder="Password" required onChange={onChange} className="input-field" />
            <input name="confirmPassword" type="password" placeholder="Confirm password" required onChange={onChange} className="input-field" />

            <button disabled={loading} className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold">
              {loading ? 'Creating…' : 'Create account'}
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
            onClick={handleGoogleSignup}
            className="w-full h-11 border rounded-lg font-semibold flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          {/* LEGAL */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            By creating the account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600">Terms</Link> and{' '}
            <Link href="/privacy" className="text-blue-600">Privacy Policy</Link>.
          </p>

          <p className="mt-4 text-sm text-gray-600 text-center">
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