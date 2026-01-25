'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import ReviewForm from '@/components/ReviewForm'
import StarRatings from '@/components/StarRatings'

export default function ReviewSection() {
  const [review, setReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadReview = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const res = await fetch('/api/reviews/my', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) throw new Error()
      setReview(await res.json())
    } catch {
      toast.error('Unable to load your review')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReview()
  }, [])

  const deleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return

    try {
      setDeleting(true)
      await deleteDoc(doc(db, 'reviews', auth.currentUser!.uid))
      toast.success('Review deleted')
      setReview(null)
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'approved')
      return <span className="text-xs font-semibold text-emerald-600">Approved</span>
    if (status === 'pending')
      return <span className="text-xs font-semibold text-amber-600">Pending approval</span>
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">

        {/* LOADING */}
        {loading && <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />}

        {/* EDIT MODE */}
        {!loading && editing && (
          <ReviewForm
            existingReview={review}
            onSuccess={() => {
              setEditing(false)
              loadReview()
            }}
            onCancel={() => setEditing(false)}
          />
        )}

        {/* VIEW MODE */}
        {!loading && !editing && review && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StarRatings rating={review.rating} size={22} />
                <span className="font-semibold text-gray-700">
                  {review.rating.toFixed(1)} / 5
                </span>
              </div>
              {statusBadge(review.status)}
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {review.comment}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 h-12 rounded-full bg-gray-900 text-white font-bold"
              >
                Edit review
              </button>

              <button
                onClick={deleteReview}
                disabled={deleting}
                className="flex-1 h-12 rounded-full border-2 border-red-300 text-red-600 font-bold disabled:opacity-50"
              >
                Delete review
              </button>
            </div>
          </>
        )}

        {/* NO REVIEW */}
        {!loading && !editing && !review && (
          <button
            onClick={() => setEditing(true)}
            className="w-full h-12 rounded-full bg-gray-900 text-white font-bold"
          >
            Write a review
          </button>
        )}
      </div>
    </div>
  )
}