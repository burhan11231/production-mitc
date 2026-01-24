'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import ReviewForm from '@/components/ReviewForm'

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
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-4">My Review</h2>

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
          <p className="text-gray-700 mb-4">{review.comment}</p>
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            Edit Review
          </button>
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl"
        >
          Write Review
        </button>
      )}
    </div>
  )
}