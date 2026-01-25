'use client'

import { useEffect, useMemo, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { db } from '@/lib/firebase'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

interface ReviewFormProps {
  existingReview?: {
    rating: number
    comment: string
  } | null
  onSuccess: () => void
  onCancel: () => void
}

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

    // ✅ REQUIRED GUARD (fixes Netlify build)
    if (!user) {
      toast.error('You must be logged in to submit a review')
      return
    }

    if (!hasChanges) {
      toast.error('No changes made')
      return
    }

    try {
      setSaving(true)

      const ref = doc(db, 'reviews', user.uid)

      if (existingReview) {
        await updateDoc(ref, {
          rating,
          comment,
          status: 'pending',
          updatedAt: serverTimestamp(),
        })

        toast.success('Review updated and sent for approval')
      } else {
        await setDoc(ref, {
          userId: user.uid,
          userName: user.name || 'User',
          rating,
          comment,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            aria-label={`Rate ${s} stars`}
          >
            <FaStar
              size={30}
              className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}
            />
          </button>
        ))}
      </div>

      {/* COMMENT */}
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border"
        placeholder="Share your experience"
      />

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-12 rounded-full bg-gray-900 text-white font-bold disabled:opacity-50"
        >
          {saving
            ? 'Submitting…'
            : existingReview
            ? 'Update review'
            : 'Submit review'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 h-12 rounded-full border-2 border-gray-300 font-bold disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}