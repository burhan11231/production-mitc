'use client'

import { useAuth } from '@/lib/auth-context'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { compressImage, validateImageFile } from '@/lib/image-utils'
import AccountSettings from './AccountSettings'

import {
  PencilSquareIcon,
  Cog6ToothIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const NAME_UPDATE_COOLDOWN_DAYS = 14

export default function ProfileSection() {
  const { user } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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

  /* ---------------- NAME COOLDOWN ---------------- */

  const lastNameUpdatedAt = user!.lastNameUpdatedAt
    ? new Date(user!.lastNameUpdatedAt.seconds * 1000)
    : null

  const canUpdateName = !lastNameUpdatedAt
    ? true
    : Date.now() - lastNameUpdatedAt.getTime() >
      NAME_UPDATE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

  /* ---------------- UNSAVED CHANGES GUARD ---------------- */

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges || !isEditing) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges, isEditing])

  const confirmDiscard = () => {
    if (!hasChanges) return true
    return confirm('You have unsaved changes. Discard them?')
  }

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
    if (!hasChanges) {
      toast.error('No changes to save')
      return
    }

    if (saving || isImageProcessing) return

    setSaving(true)
    try {
      const updatePayload: any = {
        phone,
        photoURL,
        updatedAt: serverTimestamp(),
      }

      if (name !== original.name && canUpdateName) {
        updatePayload.name = name
        updatePayload.lastNameUpdatedAt = serverTimestamp()
      }

      await updateDoc(doc(db, 'users', user!.uid), updatePayload)

      // Non-blocking auth update
      updateProfile(auth.currentUser!, {
        displayName: name,
        photoURL,
      }).catch(() => {})

      toast.success('Profile updated')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (!confirmDiscard()) return
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
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {photoURL ? (
              <Image src={photoURL} alt="" fill className="object-cover" unoptimized />
            ) : (
              user!.email?.[0]
            )}

            {isEditing && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                <CameraIcon className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <p className="text-sm text-gray-600 truncate">{user!.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!confirmDiscard()) return
              setShowSettings(v => !v)
              setIsEditing(false)
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>

          {!isEditing && !showSettings && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="border-b p-6">
          <AccountSettings />
        </div>
      )}

      {!showSettings && (
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Full name
            </label>
            <input
              disabled={!isEditing || !canUpdateName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
            />
            {!canUpdateName && (
              <p className="text-xs text-red-500 mt-1">
                Name can be updated once every 14 days
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Phone
            </label>
            <input
              disabled={!isEditing}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={cancelEdit}
                className="flex-1 h-12 rounded-full border-2 border-gray-300 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={!hasChanges || saving || isImageProcessing}
                className="flex-1 h-12 rounded-full bg-gray-900 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}