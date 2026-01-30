'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

type Mode = 'email' | 'manual' | 'email-link'

export default function PasswordResetClient() {
  const router = useRouter()
  const params = useSearchParams()
  const oobCode = params.get('oobCode')
  const { user } = useAuth()

  const [mode, setMode] = useState<Mode>('email')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* 🔒 Lock scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (oobCode) setMode('email-link')
  }, [oobCode])

  const validateNewPassword = () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

  /* ================= SEND RESET LINK ================= */
  const sendResetLink = async () => {
    if (!email) return toast.error('Enter your email')

    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/password-reset`,
      })
      toast.success('Reset link sent. Check your email.')
    } catch (e: any) {
      toast.error(
        e.code === 'auth/user-not-found'
          ? 'Email not found'
          : 'Invalid email'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ================= EMAIL LINK RESET ================= */
  const resetViaEmailLink = async () => {
    if (!oobCode || !validateNewPassword()) return

    try {
      setLoading(true)
      await confirmPasswordReset(auth, oobCode, newPassword)
      toast.success('Password updated. Please sign in.')
      router.push('/login')
    } catch {
      toast.error('Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  /* ================= MANUAL RESET ================= */
  const resetWithCurrentPassword = async () => {
    if (!user) return toast.error('You must be logged in')
    if (!validateNewPassword()) return

    try {
      setLoading(true)
      const cred = EmailAuthProvider.credential(
        user.email,
        currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await updatePassword(auth.currentUser!, newPassword)
      toast.success('Password updated successfully')
      router.push('/profile')
    } catch {
      toast.error('Current password is incorrect')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="min-h-full flex justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Securely update your account password
            </p>
          </div>

          {/* ================= EMAIL STEP ================= */}
          {mode === 'email' && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
              />

              <button
                onClick={() => setMode('manual')}
                className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold"
              >
                Continue with password
              </button>

              <button
                onClick={sendResetLink}
                disabled={loading}
                className="w-full h-11 rounded-lg border font-semibold"
              >
                Send reset link
              </button>
            </div>
          )}

          {/* ================= MANUAL RESET ================= */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
              />

              <button
                onClick={resetWithCurrentPassword}
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold"
              >
                Update password
              </button>
            </div>
          )}

          {/* ================= EMAIL LINK RESET ================= */}
          {mode === 'email-link' && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
              />

              <button
                onClick={resetViaEmailLink}
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold"
              >
                Update password
              </button>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-600 text-center">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-blue-600">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}