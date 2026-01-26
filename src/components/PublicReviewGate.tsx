'use client'

import { FaStar } from 'react-icons/fa'

/* ---------------- TYPES ---------------- */

type AnyTimestamp =
  | { seconds: number }
  | { _seconds: number }
  | string
  | Date
  | null
  | undefined

interface PublicReviewGateProps {
  myReview: {
    rating: number
    comment: string
    status: 'pending' | 'published'
    publishedAt?: AnyTimestamp
  } | null
  onEdit: () => void
  onDelete: () => void
}

/* ---------------- HELPERS ---------------- */

function parseFirestoreDate(value: AnyTimestamp): string | null {
  if (!value) return null

  let date: Date | null = null

  if (typeof value === 'string') {
    date = new Date(value)
  } else if (value instanceof Date) {
    date = value
  } else if ('seconds' in value) {
    date = new Date(value.seconds * 1000)
  } else if ('_seconds' in value) {
    date = new Date(value._seconds * 1000)
  }

  if (!date || isNaN(date.getTime())) return null

  return date.toLocaleDateString(undefined, {
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

  const isPending = myReview.status === 'pending'

  const publishedDate =
    myReview.status === 'published'
      ? parseFirestoreDate(myReview.publishedAt)
      : null

  return (
    <div className="bg-white p-6 rounded-2xl border space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-bold text-gray-900">Your Review</p>

          {/* STARS — moved closer to heading */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
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
        </div>

        {/* DATE — replaces published badge */}
        {publishedDate && (
          <p className="text-xs text-gray-500 text-right">
            Published on<br />
            <span className="font-medium text-gray-700">
              {publishedDate}
            </span>
          </p>
        )}
      </div>

      {/* COMMENT */}
      <p className="text-gray-700 whitespace-pre-line">
        {myReview.comment}
      </p>

      {/* ACTIONS — unchanged */}
      <div className="pt-4 border-t grid grid-cols-2 gap-3">
        <button
          onClick={onEdit}
          disabled={isPending}
          className={`h-12 rounded-full font-bold ${
            isPending
              ? 'bg-gray-100 text-gray-400'
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

      {isPending && (
        <p className="text-xs text-gray-500">
          Your review is under moderation.
        </p>
      )}
    </div>
  )
}