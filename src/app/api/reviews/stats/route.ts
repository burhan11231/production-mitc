import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection('reviews')
      .where('status', '==', 'published')
      .get()

    const totalReviews = snap.size

    if (totalReviews === 0) {
      return NextResponse.json({
        totalReviews: 0,
        averageRating: 0,
        starCounts: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
      })
    }

    let sum = 0
    const starCounts: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    }

    snap.docs.forEach((doc) => {
      const rating = Number(doc.data().rating || 0)
      if (rating >= 1 && rating <= 5) {
        sum += rating
        starCounts[String(rating)]++
      }
    })

    const averageRating = Number((sum / totalReviews).toFixed(1))

    return NextResponse.json({
      totalReviews,
      averageRating,
      starCounts,
    })
  } catch (err) {
    console.error('[REVIEWS_STATS_GET]', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}