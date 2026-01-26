'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import StarRating from '@/components/StarRatings'
import PublicReviewGate from '@/components/PublicReviewGate'
import ReviewForm from '@/components/ReviewForm'

import { deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

import AggregateRatingSchema from './AggregateRatingSchema'
import ReviewSchema from './ReviewSchema'

/* ---------------- TYPES ---------------- */

interface Review {
  id: string
  displayName?: string
  rating: number
  comment: string
  publishedAt?: any
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  starCounts: Record<string, number>
}

interface ReviewsClientProps {
  initialPage: number
  initialRating: number | null
}

/* ---------------- DATE HELPER ---------------- */

function formatReviewDate(value: any): string | null {
  if (!value) return null

  let date: Date | null = null

  if (value instanceof Date) date = value
  else if (typeof value === 'string') date = new Date(value)
  else if (value.seconds) date = new Date(value.seconds * 1000)
  else if (value._seconds) date = new Date(value._seconds * 1000)

  if (!date || isNaN(date.getTime())) return null

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: ReviewsClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)

  const [page, setPage] = useState(initialPage)
  const [ratingFilter, setRatingFilter] = useState<number | null>(
    initialRating
  )

  const [loading, setLoading] = useState(true)
  const [hasNextPage, setHasNextPage] = useState(false)

  const [myReview, setMyReview] = useState<any>(null)
  const [myReviewLoading, setMyReviewLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  /* ---------------- FETCH PUBLIC REVIEWS ---------------- */

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (ratingFilter) params.set('rating', String(ratingFilter))

      const res = await fetch(`/api/reviews/public?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setReviews(data.reviews)
      setHasNextPage(data.hasNextPage)
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reviews/stats', { cache: 'no-store' })
      if (!res.ok) return
      setStats(await res.json())
    } catch {}
  }

  /* ---------------- FETCH MY REVIEW ---------------- */

  const fetchMyReview = async () => {
    setMyReviewLoading(true)

    if (!auth.currentUser) {
      setMyReview(null)
      setMyReviewLoading(false)
      return
    }

    try {
      const token = await auth.currentUser.getIdToken()

      const res = await fetch('/api/reviews/my', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        setMyReview(null)
        return
      }

      setMyReview(await res.json())
    } catch {
      setMyReview(null)
    } finally {
      setMyReviewLoading(false)
    }
  }

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [page, ratingFilter])

  useEffect(() => {
    fetchMyReview()
  }, [user])

  /* ---------------- DELETE MY REVIEW ---------------- */

  const handleDeleteReview = async () => {
    if (!user || !myReview) return

    if (
      !confirm(
        'Are you sure you want to permanently delete your review? This action cannot be undone.'
      )
    )
      return

    try {
      await deleteDoc(doc(db, 'reviews', user.uid))
      toast.success('Review deleted permanently')

      setMyReview(null)
      fetchReviews()
      fetchStats()
    } catch {
      toast.error('Failed to delete review')
    }
  }

  /* ---------------- FILTER ---------------- */

  const changeRatingFilter = (rating: number | null) => {
    setPage(1)
    setRatingFilter(rating)

    const params = new URLSearchParams()
    if (rating) params.set('rating', String(rating))
    router.push(`/ratings?${params.toString()}`)
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO */}
      {stats && page === 1 && !ratingFilter && (
        <>
          <AggregateRatingSchema
            avg={stats.averageRating}
            total={stats.totalReviews}
          />
          <ReviewSchema reviews={reviews} />
        </>
      )}

      {/* HEADER */}
      <div className="bg-white border-b py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Customer Reviews</h1>

          {stats && stats.totalReviews > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <StarRating rating={stats.averageRating} size={26} />
              <span className="text-lg font-semibold">
                {stats.averageRating.toFixed(1)} / 5
              </span>
              <span className="text-gray-500">
                ({stats.totalReviews} review
                {stats.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_2fr] gap-10">
        {/* LEFT */}
        <div className="space-y-6">
          {myReviewLoading && !showForm && (
            <div className="bg-white p-6 rounded-2xl border animate-pulse space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-40 bg-gray-200 rounded-full" />
            </div>
          )}

          {!myReviewLoading && !showForm && (
            <PublicReviewGate
              myReview={myReview}
              onEdit={() => {
                if (myReview?.status === 'pending') return
                setShowForm(true)
              }}
              onDelete={handleDeleteReview}
            />
          )}

          {showForm && (
            <ReviewForm
              existingReview={myReview}
              onSuccess={() => {
                setShowForm(false)
                fetchMyReview()
                fetchReviews()
                fetchStats()
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>

        {/* RIGHT – PUBLIC LIST */}
        <div className="space-y-6">
          {/* FILTERS */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => changeRatingFilter(null)}
              className={`px-4 py-2 rounded-xl border text-sm ${
                ratingFilter === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-white'
              }`}
            >
              All
            </button>

            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => changeRatingFilter(r)}
                className={`px-4 py-2 rounded-xl border text-sm ${
                  ratingFilter === r
                    ? 'bg-gray-900 text-white'
                    : 'bg-white'
                }`}
              >
                {r}★
              </button>
            ))}
          </div>

          {/* LIST */}
          {loading ? (
            <p className="text-center py-10">Loading…</p>
          ) : reviews.length ? (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-2xl border space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">
  {r.displayName || 'Verified Customer'}
                    </p>
                    <StarRating rating={r.rating} size={18} />
                  </div>

                  {formatReviewDate(r.publishedAt) && (
                    <p className="text-xs text-gray-500">
                      {formatReviewDate(r.publishedAt)}
                    </p>
                  )}
                </div>

                <p className="text-gray-700 whitespace-pre-line">
                  {r.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews found.</p>
          )}

          {/* PAGINATION */}
          <div className="flex justify-between pt-6">
            {page > 1 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded-xl"
              >
                Previous
              </button>
            )}

            {hasNextPage && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-xl ml-auto"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}