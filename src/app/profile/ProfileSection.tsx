'use client'

import { useAuth } from '@/lib/auth-context'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProfileSection() {
  const { user } = useAuth()

  const [name, setName] = useState(user!.name)
  const [phone, setPhone] = useState(user!.phone || '')
  const [saving, setSaving] = useState(false)

  const hasChanges = useMemo(
    () => name !== user!.name || phone !== user!.phone,
    [name, phone, user]
  )

  const saveProfile = async () => {
    if (!hasChanges) return
    setSaving(true)

    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name,
        phone,
        updatedAt: serverTimestamp(),
      })

      await updateProfile(auth.currentUser!, {
        displayName: name,
      })

      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6">Profile</h2>

      <div className="space-y-6">
        <input
          className="w-full text-2xl font-bold bg-transparent outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button
          onClick={saveProfile}
          disabled={!hasChanges || saving}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}