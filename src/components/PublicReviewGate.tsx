'use client'

import { FaStar } from 'react-icons/fa'

/* ---------------- TYPES ---------------- */

interface FirestoreTimestamp {
  seconds: number
  nanoseconds?: number
}

interface PublicReviewGateProps {
  myReview: {
    rating: number
    comment: string
    status: 'pending' | 'published'
    publishedAt?: FirestoreTimestamp | null
    moderatedAt?: FirestoreTimestamp | null
    createdAt?: FirestoreTimestamp | null
  } | null
  onEdit: () => void
  onDelete: () => void
}

/* ---------------- HELPERS ---------------- */

const formatDate = (ts?: FirestoreTimestamp | null) => {
  if (!ts || typeof ts.seconds !== 'number') return null

  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ---------------- COMPONENT ---------------- */

export default function PublicReviewGate({
  myReview,
  onEdit,
  onDelete,
}: PublicReviewGateProps) {
  /* ================= NO REVIEW ================= */

  if (!myReview) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center space-y-4">
        <p className="font-semibold text-gray-800">
          Share your experience with others
        </p>

        <button
          onClick={onEdit}
          className="h-12 px-6 rounded-full bg-gray-900 text-white font-bold inline-flex items-center justify-center"
        >
          Write a review
        </button>
      </div>
    )
  }

  /* ================= HAS REVIEW ================= */

  const isPending = myReview.status === 'pending'

  /**
   * Date priority:
   * 1. publishedAt (new system)
   * 2. moderatedAt (legacy)
   * 3. createdAt (last fallback)
   */
  const publishedDate =
    myReview.status === 'published'
      ? formatDate(
          myReview.publishedAt ??
            myReview.moderatedAt ??
            myReview.createdAt
        )
      : null

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

      {/* PUBLISHED DATE */}
      {publishedDate && (
        <p className="text-xs text-gray-500">
          Published on {publishedDate}
        </p>
      )}

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
      <div className="pt-4 border-t grid grid-cols-2 gap-3">
        <button
          onClick={onEdit}
          disabled={isPending}
          className={`h-12 rounded-full font-bold ${
            isPending
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white'
          }`}
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="h-12 rounded-full border-2 border-red-300 text-red-600 font-bold"
        >
          Delete
        </button>
      </div>

      {/* INFO */}
      {isPending && (
        <p className="text-xs text-gray-500">
          Your review is under moderation. Editing will be available once approved.
        </p>
      )}
    </div>
  )
}