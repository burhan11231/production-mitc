'use client'

import { useAuth } from '@/lib/auth-context'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { compressImage, validateImageFile } from '@/lib/image-utils'

export default function ProfileSection() {
  const { user } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isImageProcessing, setIsImageProcessing] = useState(false)

  const [name, setName] = useState(user!.name)
  const [phone, setPhone] = useState(user!.phone || '')
  const [photoURL, setPhotoURL] = useState(user!.photoURL || '')

  /* ---------------- ORIGINAL SNAPSHOT ---------------- */

  const original = useMemo(
    () => ({
      name: user!.name,
      phone: user!.phone || '',
      photoURL: user!.photoURL || '',
    }),
    [user]
  )

  const hasChanges = useMemo(
    () =>
      name !== original.name ||
      phone !== original.phone ||
      photoURL !== original.photoURL,
    [name, phone, photoURL, original]
  )

  /* ---------------- IMAGE ---------------- */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error!)
      return
    }

    try {
      setIsImageProcessing(true)
      toast.loading('Optimizing image…')

      const compressed = await compressImage(file, 700)
      setPhotoURL(compressed)

      toast.success('Image ready')
    } catch {
      toast.error('Image processing failed')
    } finally {
      toast.dismiss()
      setIsImageProcessing(false)
      e.target.value = ''
    }
  }

  /* ---------------- SAVE ---------------- */

  const saveProfile = async () => {
    if (!hasChanges || saving || isImageProcessing) return

    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name,
        phone,
        photoURL,
        updatedAt: serverTimestamp(),
      })

      await updateProfile(auth.currentUser!, {
        displayName: name,
        photoURL,
      })

      toast.success('Profile updated')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setName(original.name)
    setPhone(original.phone)
    setPhotoURL(original.photoURL)
    setIsEditing(false)
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>

        <div className="flex items-center gap-2">
          {/* Settings placeholder */}
          <button
            title="Settings (coming soon)"
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
          >
            ⚙️
          </button>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
              title="Edit profile"
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6">
        {/* AVATAR */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {photoURL ? (
              <Image
                src={photoURL}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              name?.[0]
            )}

            {isEditing && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm cursor-pointer">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{user!.email}</p>
          </div>
        </div>

        {/* FIELDS */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full name
            </label>
            <input
              disabled={!isEditing}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              disabled={!isEditing}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Add phone number"
              className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>
        </div>

        {/* ACTIONS */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={cancelEdit}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={!hasChanges || saving || isImageProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}