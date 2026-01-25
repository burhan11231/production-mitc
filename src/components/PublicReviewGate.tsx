'use client'

import { FaStar } from 'react-icons/fa'
import { useAuth } from '@/lib/auth-context'

interface PublicReviewGateProps {
  myReview: {
    rating: number
    comment: string
    status: 'pending' | 'published'
  } | null
  onEdit: () => void
  onDelete: () => void
}

export default function PublicReviewGate({
  myReview,
  onEdit,
  onDelete,
}: PublicReviewGateProps) {
  const { user } = useAuth()

  /* ================= NOT LOGGED IN ================= */

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center space-y-4">
        <p className="font-semibold text-gray-800">
          Want to share your experience?
        </p>

        <a
          href="/login"
          className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-gray-900 text-white font-bold"
        >
          Login to write a review
        </a>
      </div>
    )
  }

  /* ================= USER HAS NO REVIEW ================= */

  if (!myReview) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center space-y-4">
        <p className="font-semibold text-gray-800">
          Share your experience with others
        </p>

        <button
          onClick={onEdit}
          className="h-12 px-6 rounded-full bg-gray-900 text-white font-bold"
        >
          Write a review
        </button>
      </div>
    )
  }

  /* ================= USER HAS REVIEW ================= */

  const isPending = myReview.status === 'pending'

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete your review?')) return
    onDelete()
  }

  return (
    <div className="bg-white p-6 rounded-2xl border space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <p className="font-bold text-gray-900">Your Review</p>

        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            isPending
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isPending ? 'Pending approval' : 'Published'}
        </span>
      </div>

      {/* STARS */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <FaStar
            key={i}
            className={
              i <= myReview.rating
                ? 'text-yellow-400'
                : 'text-gray-200'
            }
          />
        ))}
      </div>

      {/* COMMENT */}
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {myReview.comment}
      </p>

      {/* ACTIONS */}
      <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
        <button
          onClick={onEdit}
          disabled={isPending}
          className={`flex-1 h-12 rounded-full font-bold ${
            isPending
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white'
          }`}
        >
          Edit review
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 h-12 rounded-full border-2 border-red-300 text-red-600 font-bold"
        >
          Delete review
        </button>
      </div>

      {/* INFO */}
      {isPending && (
        <p className="text-xs text-gray-500">
          Your review is under moderation. Editing will be enabled after approval.
        </p>
      )}
    </div>
  )
}