'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
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

  /* ---------------- DELETE ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const hasPassword = user?.providers.includes('password')
  const hasGoogle = user?.providers.includes('google.com')

  /* ================= PASSWORD ================= */

  const updateUserPassword = async () => {
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

  const permanentlyDeleteAccount = async () => {
    if (!deleteConfirm) {
      toast.error('Please confirm before deleting your account')
      return
    }

    try {
      setLoading(true)

      // Re-authentication
      if (hasGoogle) {
        await reauthenticateWithPopup(
          auth.currentUser!,
          new GoogleAuthProvider()
        )
      } else {
        const pwd = prompt('Enter your password to confirm deletion')
        if (!pwd) {
          setLoading(false)
          return
        }

        const cred = EmailAuthProvider.credential(user!.email, pwd)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }

      // Delete Firestore user document
      await deleteDoc(doc(db, 'users', user!.uid))

      // Delete Firebase Auth user
      await deleteUser(auth.currentUser!)

      // Logout & redirect
      await logout()
      toast.success('Account permanently deleted')
      router.replace('/')
    } catch (e: any) {
      toast.error(e.message || 'Account deletion failed')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-10">
      {/* PASSWORD */}
      {hasPassword && (
        <section className="space-y-3">
          <button
            onClick={() => setPasswordOpen(v => !v)}
            className="w-full text-left font-semibold text-gray-800"
          >
            Update password
          </button>

          {passwordOpen && (
            <div className="space-y-3 pt-3">
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

              <div className="flex gap-3">
                <button
                  onClick={updateUserPassword}
                  disabled={loading}
                  className="flex-1 h-11 rounded-full bg-gray-900 text-white font-bold"
                >
                  Update password
                </button>

                <button
                  onClick={sendReset}
                  className="flex-1 h-11 rounded-full border font-semibold"
                >
                  Forgot password
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* DELETE */}
      <section className="border-t pt-8 space-y-4">
        <button
          onClick={() => setDeleteOpen(v => !v)}
          className="w-full text-left font-semibold text-red-700"
        >
          Delete account permanently
        </button>

        {deleteOpen && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4 text-sm">
            <p className="text-red-800 font-semibold">
              This action is irreversible.
            </p>

            <p className="text-red-700">
              Deleting your account will permanently remove all your data and
              access.
            </p>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.checked)}
              />
              <span>I understand and agree</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 h-11 rounded-full bg-gray-200 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={permanentlyDeleteAccount}
                disabled={loading}
                className="flex-1 h-11 rounded-full bg-red-600 text-white font-bold disabled:opacity-50"
              >
                Delete account
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}