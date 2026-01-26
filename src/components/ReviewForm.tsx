'use client'

import { useEffect, useMemo, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { db } from '@/lib/firebase'
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

/* ---------------- TYPES ---------------- */

interface ReviewFormProps {
  existingReview?: {
    rating: number
    comment: string
  } | null
  onSuccess: () => void
  onCancel: () => void
}

/* ---------------- COMPONENT ---------------- */

export default function ReviewForm({
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  /* ---------------- INIT (EDIT MODE) ---------------- */

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.comment)
    }
  }, [existingReview])

  /* ---------------- CHANGE DETECTION ---------------- */

  const hasChanges = useMemo(() => {
    if (!existingReview) return true
    return (
      rating !== existingReview.rating ||
      comment.trim() !== existingReview.comment.trim()
    )
  }, [existingReview, rating, comment])

  /* ---------------- SUBMIT ---------------- */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in to submit a review')
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a valid rating')
      return
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long')
      return
    }

    if (existingReview && !hasChanges) {
      toast.error('No changes were made')
      return
    }

    try {
      setSaving(true)

      // 🔒 reviewId === user.uid (your enforced design)
      const ref = doc(db, 'reviews', user.uid)

      /* ---------------- BASE PAYLOAD ---------------- */
      const payload = {
        userId: user.uid,
        rating,
        comment,
        status: 'pending',
        updatedAt: serverTimestamp(),

        // 🔑 Reset moderation metadata on user edit
        publishedAt: null,
        moderatedAt: null,
        moderatedBy: null,
      }

      if (existingReview) {
        /* ---------- UPDATE EXISTING REVIEW ---------- */
        await updateDoc(ref, payload)
        toast.success('Review updated and sent for approval')
      } else {
        /* ---------- CREATE NEW REVIEW ---------- */
        await setDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
        })
        toast.success('Review submitted for approval')
      }

      onSuccess()
    } catch (err) {
      console.error('[REVIEW_SUBMIT_ERROR]', err)
      toast.error('Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* RATING */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Rating
        </label>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              aria-label={`Rate ${s} stars`}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                size={30}
                className={
                  s <= rating ? 'text-yellow-400' : 'text-gray-200'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* COMMENT */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Feedback
        </label>

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience in detail…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />

        <p className="text-xs text-gray-400 mt-1">
          {comment.length} / 500 characters
        </p>
      </div>

      {/* ACTIONS */}
      <div className="pt-4 border-t grid grid-cols-2 gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-12 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center disabled:opacity-50"
        >
          {saving
            ? 'Submitting…'
            : existingReview
            ? 'Update'
            : 'Submit'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-12 rounded-full border-2 border-gray-300 text-gray-700 font-bold flex items-center justify-center disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}