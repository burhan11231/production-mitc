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
import { deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function AccountSettings() {
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(false)

  /* ---------------- PASSWORD ---------------- */
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* ---------------- SESSIONS ---------------- */
  const [sessionsOpen, setSessionsOpen] = useState(false)

  /* ---------------- DELETE ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const hasPassword = user?.providers.includes('password')
  const hasGoogle = user?.providers.includes('google.com')

  /* ================= PROVIDERS ================= */

  const connectGoogle = async () => {
    try {
      setLoading(true)
      await linkWithPopup(auth.currentUser!, new GoogleAuthProvider())
      toast.success('Google account connected')
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect Google')
    } finally {
      setLoading(false)
    }
  }

  /* ================= PASSWORD ================= */

  const updateUserPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
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

  /* ================= SESSIONS ================= */

  const signOutThisDevice = async () => {
    await logout()
  }

  /* ================= DELETE ================= */

  const permanentlyDeleteAccount = async () => {
    if (!deleteConfirm) {
      toast.error('Please confirm the agreement first')
      return
    }

    try {
      setLoading(true)

      if (hasGoogle) {
        await reauthenticateWithPopup(
          auth.currentUser!,
          new GoogleAuthProvider()
        )
      } else {
        const pwd = prompt('Enter your password to confirm')
        if (!pwd) return
        const cred = EmailAuthProvider.credential(user!.email, pwd)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }

      await deleteDoc(doc(db, 'users', user!.uid))
      await deleteUser(auth.currentUser!)

      toast.success('Account permanently deleted')
    } catch (e: any) {
      toast.error(e.message || 'Account deletion failed')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-8">

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
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  onClick={updateUserPassword}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                >
                  Update password
                </button>
                <button
                  onClick={sendReset}
                  className="flex-1 bg-gray-100 py-2 rounded-lg"
                >
                  Forgot password
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* CONNECT GOOGLE */}
      {!hasGoogle && (
        <button
          onClick={connectGoogle}
          disabled={loading}
          className="w-full border py-2 rounded-lg font-semibold"
        >
          Connect Google account
        </button>
      )}

      {/* SESSIONS */}
      <section className="space-y-3">
        <button
          onClick={() => setSessionsOpen(v => !v)}
          className="w-full text-left font-semibold text-gray-800"
        >
          Sessions & devices
        </button>

        {sessionsOpen && (
          <div className="space-y-3 pt-3 text-sm text-gray-600">
            <p>
              Current device:
              <br />
              <span className="font-medium text-gray-800">
                {navigator.userAgent}
              </span>
            </p>

            <button
              onClick={signOutThisDevice}
              className="w-full border py-2 rounded-lg"
            >
              Sign out this device
            </button>
          </div>
        )}
      </section>

      {/* DELETE */}
      <section className="border-t pt-6 space-y-4">
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
              Deleting your account will permanently remove:
              <br />• Your profile
              <br />• Authentication access
              <br />• All personal data
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
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={permanentlyDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
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