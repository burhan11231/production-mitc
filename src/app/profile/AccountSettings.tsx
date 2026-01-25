'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

import {
  ShieldCheckIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  LinkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function AccountSettings() {
  const { user, logout } = useAuth()

  const [isDeleting, setIsDeleting] = useState(false)
  const [keepReviews, setKeepReviews] = useState(true)

  if (!user) return null

  const authUser = auth.currentUser!
  const providers = user.providers

  /* ---------------- PROVIDERS ---------------- */

  const connectGoogle = async () => {
    try {
      await linkWithPopup(authUser, new GoogleAuthProvider())
      toast.success('Google account connected')
      location.reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect Google')
    }
  }

  /* ---------------- PASSWORD ---------------- */

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email)
      toast.success('Password reset email sent')
    } catch {
      toast.error('Failed to send reset email')
    }
  }

  /* ---------------- DEACTIVATE ---------------- */

  const deactivateAccount = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isDisabled: true,
      })
      toast.success('Account deactivated')
      await logout()
    } catch {
      toast.error('Failed to deactivate account')
    }
  }

  /* ---------------- DELETE ---------------- */

  const deleteAccount = async () => {
    if (isDeleting) return
    setIsDeleting(true)

    try {
      // Re-auth (Google or Email)
      if (providers.includes('google.com')) {
        await reauthenticateWithPopup(authUser, new GoogleAuthProvider())
      } else {
        await reauthenticateWithPopup(
          authUser,
          new EmailAuthProvider()
        )
      }

      if (!keepReviews) {
        // future: cascade delete user content
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          name: 'Deleted User',
          photoURL: '',
        })
      }

      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(authUser)

      toast.success('Account permanently deleted')
      location.href = '/'
    } catch (e: any) {
      toast.error(e.message || 'Account deletion failed')
    } finally {
      setIsDeleting(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-8">
      {/* OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <ShieldCheckIcon className="w-5 h-5" />
          {user.email}
          {authUser.emailVerified ? (
            <span className="text-green-600 text-xs font-semibold">
              Verified
            </span>
          ) : (
            <span className="text-amber-600 text-xs font-semibold">
              Unverified
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created: {new Date(authUser.metadata.creationTime!).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          Last login: {new Date(authUser.metadata.lastSignInTime!).toLocaleDateString()}
        </div>

        <div className="flex gap-2 flex-wrap pt-2">
          {providers.map(p => (
            <span
              key={p}
              className="px-2 py-1 rounded-md bg-gray-100 text-xs"
            >
              {p.replace('.com', '')}
            </span>
          ))}
        </div>
      </div>

      {/* SECURITY */}
      <div className="space-y-3">
        {providers.includes('password') && (
          <button
            onClick={resetPassword}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <KeyIcon className="w-4 h-4" />
            Reset password
          </button>
        )}

        {!providers.includes('google.com') && (
          <button
            onClick={connectGoogle}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <LinkIcon className="w-4 h-4" />
            Connect Google account
          </button>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* DANGER ZONE */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
          <ExclamationTriangleIcon className="w-5 h-5" />
          Danger zone
        </div>

        <button
          onClick={deactivateAccount}
          className="text-sm text-red-600 hover:underline"
        >
          Deactivate account
        </button>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={keepReviews}
              onChange={e => setKeepReviews(e.target.checked)}
            />
            Keep my reviews (anonymized)
          </label>

          <button
            onClick={deleteAccount}
            disabled={isDeleting}
            className="flex items-center gap-2 text-sm text-red-700 font-semibold hover:underline"
          >
            <TrashIcon className="w-4 h-4" />
            Permanently delete account
          </button>
        </div>
      </div>
    </div>
  )
}