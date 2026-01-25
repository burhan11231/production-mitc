'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

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

      if (!data || data.status === 'deleted') {
        setMyReview(null)
        return
      }

      setMyReview(data)
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

  /* ---------------- DELETE (SOFT) ---------------- */

  const handleDelete = async () => {
    if (!user || !myReview) return
    if (!confirm('Delete your review?')) return

    try {
      await updateDoc(doc(db, 'reviews', user.uid), {
        status: 'deleted',
        updatedAt: serverTimestamp(),
      })

      toast.success('Review deleted')
      setMyReview(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      {/* LOADING */}
      {loading && (
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
      )}

      {/* VIEW MODE */}
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

      {/* FORM */}
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