'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  confirmPasswordReset,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

export default function PasswordResetPage() {
  const router = useRouter()
  const params = useSearchParams()
  const oobCode = params.get('oobCode')
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* 🔒 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const validate = () => {
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

  /* ================= EMAIL LINK RESET ================= */
  const resetViaEmailLink = async () => {
    if (!oobCode) return
    if (!validate()) return

    try {
      setLoading(true)
      await confirmPasswordReset(auth, oobCode, newPassword)
      toast.success('Password reset successful. Please log in.')
      router.push('/login')
    } catch {
      toast.error('Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOGGED-IN RESET ================= */
  const resetWithCurrentPassword = async () => {
    if (!user) return
    if (!validate()) return

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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">

          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {oobCode
                ? 'Set a new password for your account'
                : 'Change your password securely'}
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {!oobCode && (
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input-field"
              />
            )}

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
              disabled={loading}
              onClick={oobCode ? resetViaEmailLink : resetWithCurrentPassword}
              className="w-full h-11 rounded-lg bg-gray-900 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>

          {/* FOOTER */}
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