'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AccountSettings() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  /* ================= PASSWORD ================= */
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const hasPassword = user?.providers.includes('password')

  /* ================= ACCOUNT ACTIONS ================= */
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [countdown, setCountdown] = useState<number | null>(null)

  /* ================= PASSWORD LOGIC ================= */

  const updateUserPassword = async () => {
    if (!hasPassword) {
      await sendResetLink()
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
      const cred = EmailAuthProvider.credential(user!.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await updatePassword(auth.currentUser!, newPassword)

      toast.success('Password updated')
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

  const sendResetLink = async () => {
    try {
      await sendPasswordResetEmail(auth, user!.email)
      toast.success('Password reset link sent')
    } catch {
      toast.error('Failed to send reset link')
    }
  }

  /* ================= DEACTIVATE ================= */

  const deactivateAccount = async () => {
  if (!confirmDeactivate) {
    toast.error('Please confirm before deactivating')
    return
  }

  try {
    setLoading(true)

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Unauthorized')

    const res = await fetch('/api/account/deactivate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('Deactivate failed')

    toast.success('Account deactivated')
    await logout()
    router.replace('/login')
  } catch (e: any) {
    toast.error(e.message || 'Failed to deactivate account')
  } finally {
    setLoading(false)
  }
}

  /* ================= DELETE ================= */

  const startDeleteCountdown = () => {
    if (!confirmDelete) {
      toast.error('Please confirm before deleting')
      return
    }
    setCountdown(5)
  }

  const cancelDelete = () => {
    setCountdown(null)
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

  const permanentlyDeleteAccount = async () => {
    try {
      setLoading(true)

      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Unauthorized')

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Delete failed')

      toast.success('Account and all data deleted')
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
    <div className="space-y-6">

      {/* PASSWORD */}
      <section className="border rounded-xl overflow-hidden">
        <button
          onClick={() => setPasswordOpen(v => !v)}
          className="w-full px-4 py-3 flex justify-between font-semibold"
        >
          Update password
          <span>{passwordOpen ? 'Hide' : 'Open'}</span>
        </button>

        {passwordOpen && (
          <div className="p-4 space-y-3 border-t bg-gray-50">
            {hasPassword ? (
              <>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={updateUserPassword}
                    disabled={loading}
                    className="flex-1 h-10 bg-gray-900 text-white rounded-full font-semibold"
                  >
                    Update password
                  </button>
                  <button
                    onClick={sendResetLink}
                    className="flex-1 h-10 border rounded-full font-semibold"
                  >
                    Send reset link
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={sendResetLink}
                className="w-full h-10 bg-gray-900 text-white rounded-full font-semibold"
              >
                Send reset link
              </button>
            )}
          </div>
        )}
      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="border rounded-xl overflow-hidden">
        <button
          onClick={() => setActionsOpen(v => !v)}
          className="w-full px-4 py-3 flex justify-between font-semibold text-red-700"
        >
          Account actions
          <span>{actionsOpen ? 'Hide' : 'Open'}</span>
        </button>

        {actionsOpen && (
          <div className="border-t bg-red-50">

            {/* DEACTIVATE */}
            <div className="border-b p-4 space-y-3 text-sm">
              <p>
                Deactivate account (Restored when you log in)
              </p>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={confirmDeactivate}
                  onChange={e => setConfirmDeactivate(e.target.checked)}
                />
                I understand
              </label>

              <div className="flex gap-3">
                <button
                  onClick={deactivateAccount}
                  className="h-10 px-6 rounded-full bg-yellow-600 text-white font-semibold"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => setConfirmDeactivate(false)}
                  className="h-10 px-6 rounded-full border"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* DELETE */}
            <div className="p-4 space-y-4 text-sm">
              <p className="font-semibold">
                Permanently delete account and all data.
              </p>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={e => setConfirmDelete(e.target.checked)}
                />
                I understand this cannot be undone
              </label>

              {countdown !== null ? (
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-red-700">
                    Deleting in {countdown}s…
                  </p>
                  <button
                    onClick={cancelDelete}
                    className="h-9 px-4 rounded-full border"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={startDeleteCountdown}
                  className="h-10 px-6 rounded-full bg-red-600 text-white font-bold"
                >
                  Delete permanently
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}