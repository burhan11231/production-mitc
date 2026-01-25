'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteDoc, doc } from 'firebase/firestore'

import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

import PublicReviewGate from '@/components/PublicReviewGate'
import ReviewForm from '@/components/ReviewForm'

export default function ReviewSection() {
  const { user } = useAuth()

  const [myReview, setMyReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  /* ---------------- FETCH MY REVIEW ---------------- */

  const fetchMyReview = async () => {
    setLoading(true)

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const res = await fetch('/api/reviews/my', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        setMyReview(null)
        return
      }

      const data = await res.json()
      setMyReview(data || null)
    } catch {
      toast.error('Failed to load your review')
      setMyReview(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyReview()
  }, [user])

  /* ---------------- HARD DELETE ---------------- */

  const handleDelete = async () => {
    if (!user || !myReview) return

    if (!confirm('Are you sure you want to permanently delete your review?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'reviews', user.uid))
      toast.success('Review deleted permanently')
      setMyReview(null)
    } catch {
      toast.error('Failed to delete review')
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      {loading && (
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
      )}

      {!loading && !showForm && (
        <PublicReviewGate
          myReview={myReview}
          onEdit={() => {
            if (myReview?.status === 'pending') return
            setShowForm(true)
          }}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <ReviewForm
          existingReview={myReview}
          onSuccess={() => {
            setShowForm(false)
            fetchMyReview()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}