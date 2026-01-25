'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import ReviewForm from '@/components/ReviewForm'
import StarRating from '@/components/StarRating'

export default function ReviewSection() {
  const [review, setReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const loadReview = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const res = await fetch('/api/reviews/my', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()
      setReview(data)
    } catch {
      toast.error('Failed to load review')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReview()
  }, [])

  if (loading) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        {editing ? (
          <ReviewForm
            existingReview={review}
            onSuccess={() => {
              setEditing(false)
              loadReview()
            }}
            onCancel={() => setEditing(false)}
          />
        ) : review ? (
          <>
            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} size={22} />
              <span className="text-sm font-semibold text-gray-700">
                {review.rating.toFixed(1)} / 5
              </span>
            </div>

            {/* Review Text */}
            <p className="text-gray-700 leading-relaxed">
              {review.comment}
            </p>

            {/* Meta */}
            {review.updatedAt && (
              <p className="text-xs text-gray-400">
                Last updated {new Date(review.updatedAt).toLocaleDateString()}
              </p>
            )}

            {/* Action */}
            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Edit review
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Write your review
          </button>
        )}
      </div>
    </div>
  )
}