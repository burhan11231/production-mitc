'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
} from 'firebase/auth'
import { deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

import {
  ShieldCheckIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  LinkIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function AccountSettings() {
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const hasPassword = user?.providers.includes('password')
  const hasGoogle = user?.providers.includes('google.com')

  /* ----------------------------------
     DERIVED
  ---------------------------------- */

  const passwordStrength = useMemo(() => {
    if (newPassword.length < 6) return 'Weak'
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return 'Medium'
    return 'Strong'
  }, [newPassword])

  /* ----------------------------------
     PROVIDERS
  ---------------------------------- */

  const connectGoogle = async () => {
    try {
      setLoading(true)
      await linkWithPopup(auth.currentUser!, new GoogleAuthProvider())
      toast.success('Google account connected')
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect Google')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------
     PASSWORD
  ---------------------------------- */

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await updatePassword(auth.currentUser!, newPassword)
      toast.success('Password updated')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        toast.error('Please re-login to change password')
      } else {
        toast.error(e.message || 'Password update failed')
      }
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

  /* ----------------------------------
     SECURITY
  ---------------------------------- */

  const signOutAll = async () => {
    try {
      setLoading(true)
      await fetch('/api/auth/revoke', { method: 'POST' }) // Admin SDK
      await logout()
    } catch {
      toast.error('Failed to sign out all sessions')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------
     DEACTIVATE
  ---------------------------------- */

  const deactivateAccount = async () => {
    try {
      setLoading(true)
      await updateDoc(doc(db, 'users', user!.uid), {
        isDisabled: true,
        updatedAt: serverTimestamp(),
      })
      await logout()
    } catch {
      toast.error('Failed to deactivate account')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------
     DELETE
  ---------------------------------- */

  const deleteAccount = async () => {
    if (!confirm('This will permanently delete your account. Continue?')) return

    try {
      setLoading(true)

      // Re-auth
      if (hasGoogle) {
        await reauthenticateWithPopup(auth.currentUser!, new GoogleAuthProvider())
      } else {
        const password = prompt('Enter your password to confirm deletion')
        if (!password) return
        const cred = EmailAuthProvider.credential(user!.email, password)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }

      await deleteDoc(doc(db, 'users', user!.uid))
      await deleteUser(auth.currentUser!)

      toast.success('Account deleted')
    } catch (e: any) {
      toast.error(e.message || 'Account deletion failed')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------
     UI
  ---------------------------------- */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-8">

      {/* ACCOUNT OVERVIEW */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <ShieldCheckIcon className="w-5 h-5" />
          Account overview
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4" />
            {user!.email}
          </p>
          <p className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Providers: {user!.providers.join(', ')}
          </p>
          <p className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Last login: {new Date(auth.currentUser!.metadata.lastSignInTime!).toLocaleString()}
          </p>
        </div>
      </section>

      {/* PASSWORD */}
      {hasPassword && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <KeyIcon className="w-5 h-5" />
            Password
          </div>

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <p className="text-xs text-gray-500">
            Strength: <span className="font-semibold">{passwordStrength}</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handlePasswordChange}
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
        </section>
      )}

      {/* CONNECTED ACCOUNTS */}
      {!hasGoogle && (
        <button
          onClick={connectGoogle}
          className="w-full border py-2 rounded-lg font-semibold"
        >
          Connect Google
        </button>
      )}

      {/* SECURITY */}
      <section className="space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sign out
        </button>

        <button
          onClick={signOutAll}
          className="w-full border py-2 rounded-lg"
        >
          Sign out all devices
        </button>
      </section>

      {/* DANGER */}
      <section className="border-t pt-6 space-y-3">
        <button
          onClick={deactivateAccount}
          className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg"
        >
          Deactivate account
        </button>

        <button
          onClick={deleteAccount}
          className="w-full bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-5 h-5" />
          Delete account permanently
        </button>
      </section>
    </div>
  )
}