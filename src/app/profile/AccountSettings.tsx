'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  GoogleAuthProvider,
  linkWithPopup,
  unlink,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
} from 'firebase/auth'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

import {
  ShieldCheckIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  LinkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function AccountSettings() {
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(false)
  const hasGoogle = user?.providers.includes('google.com')
  const isPasswordUser = user?.providers.includes('password')

  /* ---------------- PROVIDERS ---------------- */

  const connectGoogle = async () => {
    try {
      await linkWithPopup(auth.currentUser!, new GoogleAuthProvider())
      toast.success('Google account connected')
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect Google')
    }
  }

  const disconnectGoogle = async () => {
    try {
      await unlink(auth.currentUser!, 'google.com')
      toast.success('Google account disconnected')
    } catch {
      toast.error('Cannot disconnect Google (needs another login method)')
    }
  }

  /* ---------------- PASSWORD ---------------- */

  const resetPassword = async () => {
    if (!user?.email) return
    try {
      await sendPasswordResetEmail(auth, user.email)
      toast.success('Password reset email sent')
    } catch {
      toast.error('Failed to send reset email')
    }
  }

  /* ---------------- SECURITY ---------------- */

  const signOutAll = () => {
    toast('Sign out all devices requires admin access', { icon: '🔒' })
  }

  /* ---------------- ACCOUNT STATE ---------------- */

  const deactivateAccount = async () => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isDisabled: true,
      })
      await logout()
      toast.success('Account deactivated')
    } catch {
      toast.error('Failed to deactivate account')
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    const confirm = window.confirm(
      'This will permanently delete your account. This cannot be undone.'
    )
    if (!confirm) return

    setLoading(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(auth.currentUser!)
      toast.success('Account deleted')
    } catch {
      toast.error('Re-authentication required')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-8">
      {/* ACCOUNT OVERVIEW */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <ShieldCheckIcon className="w-5 h-5" />
          Account
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>Email: {user?.email}</p>
          <p>
            Providers:{' '}
            {user?.providers.includes('google.com') && 'Google '}
            {user?.providers.includes('password') && 'Email '}
          </p>
        </div>
      </section>

      {/* PASSWORD */}
      {isPasswordUser && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <KeyIcon className="w-5 h-5" />
            Password
          </div>

          <button
            onClick={resetPassword}
            className="w-full border rounded-lg py-2 hover:bg-gray-50 text-sm"
          >
            Send password reset email
          </button>
        </section>
      )}

      {/* CONNECTED ACCOUNTS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <LinkIcon className="w-5 h-5" />
          Connected accounts
        </div>

        {hasGoogle ? (
          <button
            onClick={disconnectGoogle}
            className="w-full border rounded-lg py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Disconnect Google
          </button>
        ) : (
          <button
            onClick={connectGoogle}
            className="w-full border rounded-lg py-2 text-sm hover:bg-gray-50"
          >
            Connect Google
          </button>
        )}
      </section>

      {/* SECURITY */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sessions
        </div>

        <button
          onClick={logout}
          className="w-full border rounded-lg py-2 text-sm hover:bg-gray-50"
        >
          Sign out from this device
        </button>

        <button
          onClick={signOutAll}
          className="w-full border rounded-lg py-2 text-sm text-gray-400 cursor-not-allowed"
        >
          Sign out from all devices (coming soon)
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="pt-6 border-t space-y-4">
        <div className="flex items-center gap-2 font-semibold text-red-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          Danger zone
        </div>

        <button
          onClick={deactivateAccount}
          className="w-full border border-red-200 rounded-lg py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Deactivate account
        </button>

        <button
          onClick={deleteAccount}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <TrashIcon className="w-4 h-4" />
          Delete account permanently
        </button>
      </section>
    </div>
  )
}