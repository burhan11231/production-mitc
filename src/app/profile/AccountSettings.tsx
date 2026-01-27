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
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
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
  const hasGoogle = user?.providers.includes('google.com')

  /* ================= ACCOUNT ACTIONS ================= */
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [countdown, setCountdown] = useState<number | null>(null)

  /* ================= PASSWORD LOGIC ================= */

  const updateUserPassword = async () => {
    if (hasPassword) {
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
      } catch (e: any) {
        toast.error(e.message || 'Password update failed')
      } finally {
        setLoading(false)
      }
    } else {
      await sendResetLink()
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
      toast.error('Please confirm to deactivate')
      return
    }

    try {
      setLoading(true)
      await updateDoc(doc(db, 'users', user!.uid), {
        isDisabled: true,
        updatedAt: serverTimestamp(),
      })
      toast.success('Account deactivated')
      await logout()
      router.replace('/login')
    } catch {
      toast.error('Failed to deactivate account')
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

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      permanentlyDeleteAccount()
      return
    }

    const t = setTimeout(() => setCountdown(c => (c! - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const permanentlyDeleteAccount = async () => {
    try {
      setLoading(true)

      /* --- REAUTH --- */
      if (hasGoogle) {
        await reauthenticateWithPopup(auth.currentUser!, new GoogleAuthProvider())
      } else if (hasPassword) {
        const pwd = prompt('Enter your password to confirm deletion')
        if (!pwd) throw new Error('Password required')
        const cred = EmailAuthProvider.credential(user!.email, pwd)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }

      /* --- DELETE REVIEWS --- */
      const reviewsSnap = await getDocs(
        query(collection(db, 'reviews'), where('userId', '==', user!.uid))
      )

      await Promise.all(reviewsSnap.docs.map(d => deleteDoc(d.ref)))

      /* --- DELETE USER DOC --- */
      await deleteDoc(doc(db, 'users', user!.uid))

      /* --- DELETE AUTH --- */
      await deleteUser(auth.currentUser!)

      toast.success('Account and data deleted')
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

      {/* PASSWORD PANEL */}
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
            {hasPassword && (
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
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={updateUserPassword}
                disabled={loading}
                className="flex-1 h-10 bg-gray-900 text-white rounded-full font-semibold"
              >
                {hasPassword ? 'Update password' : 'Send reset link'}
              </button>

              <button
                onClick={sendResetLink}
                className="flex-1 h-10 border rounded-full font-semibold"
              >
                Send reset link
              </button>
            </div>
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
            <div className="border-b">
              <button
                onClick={() => setDeactivateOpen(v => !v)}
                className="w-full px-4 py-3 text-left font-semibold"
              >
                Deactivate account
              </button>

              {deactivateOpen && (
                <div className="p-4 space-y-3 text-sm">
                  <p>
                    Your account will be disabled. No data is deleted.
                    You can recover anytime by signing in again.
                  </p>

                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={confirmDeactivate}
                      onChange={e => setConfirmDeactivate(e.target.checked)}
                    />
                    I understand
                  </label>

                  <button
                    onClick={deactivateAccount}
                    className="h-10 px-6 rounded-full bg-yellow-600 text-white font-semibold"
                  >
                    Deactivate account
                  </button>
                </div>
              )}
            </div>

            {/* DELETE */}
            <div>
              <button
                onClick={() => setDeleteOpen(v => !v)}
                className="w-full px-4 py-3 text-left font-semibold text-red-700"
              >
                Delete account & data
              </button>

              {deleteOpen && (
                <div className="p-4 space-y-4 text-sm">
                  <p className="font-semibold">
                    This will permanently delete:
                  </p>
                  <ul className="list-disc ml-5">
                    <li>Your account</li>
                    <li>Your profile</li>
                    <li>Your reviews</li>
                  </ul>

                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={e => setConfirmDelete(e.target.checked)}
                    />
                    I understand this cannot be undone
                  </label>

                  {countdown !== null ? (
                    <p className="font-semibold text-center">
                      Deleting in {countdown}s…
                    </p>
                  ) : (
                    <button
                      onClick={startDeleteCountdown}
                      className="h-10 px-6 rounded-full bg-red-600 text-white font-bold"
                    >
                      Delete permanently
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}