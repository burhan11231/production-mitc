'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
} from 'firebase/auth'
import { deleteDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AccountSettings() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  /* ---------------- PASSWORD ---------------- */
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const hasPassword = user?.providers.includes('password')
  const hasGoogle = user?.providers.includes('google.com')

  /* ---------------- DELETE ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  /* ================= PASSWORD ================= */

  const updateUserPassword = async () => {
    if (!hasPassword) {
      await sendReset()
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)

      const cred = EmailAuthProvider.credential(
        user!.email,
        currentPassword
      )

      await reauthenticateWithCredential(auth.currentUser!, cred)
      await updatePassword(auth.currentUser!, newPassword)

      toast.success('Password updated successfully')
      setPasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      toast.error(e.message || 'Password update failed')
    } finally {
      setLoading(false)
    }
  }

  const sendReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user!.email)
      toast.success('Password reset email sent')
    } catch {
      toast.error('Failed to send reset email')
    }
  }

  /* ================= DELETE ================= */

  const startDeleteCountdown = () => {
    if (!deleteConfirm) {
      toast.error('Please confirm before deleting your account')
      return
    }
    setCountdown(5)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      permanentlyDeleteAccount()
      return
    }

    const t = setTimeout(() => {
      setCountdown(c => (c === null ? null : c - 1))
    }, 1000)

    return () => clearTimeout(t)
  }, [countdown])

  const cancelDelete = () => {
    setCountdown(null)
  }

  const permanentlyDeleteAccount = async () => {
    try {
      setLoading(true)

      if (hasGoogle) {
        await reauthenticateWithPopup(
          auth.currentUser!,
          new GoogleAuthProvider()
        )
      } else if (hasPassword) {
        const pwd = prompt('Enter your password to confirm deletion')
        if (!pwd) {
          setLoading(false)
          setCountdown(null)
          return
        }
        const cred = EmailAuthProvider.credential(user!.email, pwd)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }

      await deleteDoc(doc(db, 'users', user!.uid))
      await deleteUser(auth.currentUser!)

      await logout()
      router.replace('/')
    } catch (e: any) {
      toast.error(e.message || 'Account deletion failed')
    } finally {
      setLoading(false)
      setCountdown(null)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* PASSWORD */}
      <section className="space-y-3">
        <button
          onClick={() => setPasswordOpen(v => !v)}
          className="w-full flex justify-between px-4 py-3 rounded-lg border"
        >
          <span className="font-semibold">Update password</span>
          <span className="text-sm">{passwordOpen ? 'Hide' : 'Edit'}</span>
        </button>

        {passwordOpen && (
          <div className="space-y-3 pt-3">
            {hasPassword && (
              <>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={updateUserPassword}
                disabled={loading}
                className="flex-1 h-11 rounded-full bg-gray-900 text-white font-bold"
              >
                {hasPassword ? 'Update password' : 'Send password setup email'}
              </button>

              <button
                onClick={sendReset}
                className="flex-1 h-11 rounded-full border font-semibold"
              >
                Send reset link
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DELETE */}
      <section className="border-t pt-6 space-y-3">
        <button
          onClick={() => setDeleteOpen(v => !v)}
          className="w-full flex justify-between px-4 py-3 rounded-lg border border-red-200 text-red-700"
        >
          <span className="font-semibold">Delete account permanently</span>
          <span className="text-sm">{deleteOpen ? 'Hide' : 'Open'}</span>
        </button>

        {deleteOpen && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4 text-sm">
            <p className="font-semibold text-red-800">
              This action is irreversible.
            </p>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.checked)}
              />
              <span>I understand and agree</span>
            </label>

            {countdown !== null ? (
              <div className="text-center space-y-3">
                <p className="font-semibold text-red-700">
                  Deleting account in {countdown}s
                </p>
                <button
                  onClick={cancelDelete}
                  className="h-10 px-6 rounded-full border"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={startDeleteCountdown}
                  className="flex-1 h-11 rounded-full bg-red-600 text-white font-bold"
                >
                  Delete account
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}