'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import ProfileSection from './ProfileSection'
import ReviewSection from './ReviewSection'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileSection />
        <ReviewSection />
{/* ---------- PROFILE CAPABILITIES ---------- */}
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
  <h2 className="text-xl font-bold text-gray-900">
    What can you do here?
  </h2>

  <p className="text-sm text-gray-600 mt-2">
    Your profile is the control center for your account, personal information,
    and feedback.
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2">
    {/* PROFILE */}
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
        1
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Manage your profile
        </p>
        <p className="text-sm text-gray-600">
          Update your name, phone number, and profile photo. Changes are saved
          securely and reflected across your account.
        </p>
      </div>
    </div>

    {/* ACCOUNT SETTINGS */}
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
        2
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Control account security
        </p>
        <p className="text-sm text-gray-600">
          Change your password, manage authentication methods, or permanently
          delete your account if needed.
        </p>
      </div>
    </div>

    {/* REVIEWS */}
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
        3
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Manage your review
        </p>
        <p className="text-sm text-gray-600">
          Write, edit, or delete your review. Pending reviews are moderated
          before being publicly visible.
        </p>
      </div>
    </div>

    {/* TRANSPARENCY */}
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
        4
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Stay in control
        </p>
        <p className="text-sm text-gray-600">
          You always control your data. Any critical changes require confirmation
          for safety and transparency.
        </p>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  )
}