import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST() {
  const db = getAdminDb();

  const snap = await db
    .collection('reviews')
    .where('status', '==', 'published')
    .get();

  let totalReviews = 0;
  let sumRating = 0;

  const starCounts: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  snap.docs.forEach(d => {
    const r = d.data();
    const rating = r.rating || 0;

    sumRating += rating;
    totalReviews++;

    const key = String(rating);
    if (starCounts[key] !== undefined) {
      starCounts[key]++;
    }
  });

  const averageRating =
    totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  await db.collection('reviewStats').doc('global').set({
    totalReviews,
    averageRating,
    starCounts,
    updatedAt: new Date(),
  });

  return NextResponse.json({ totalReviews, averageRating });
}