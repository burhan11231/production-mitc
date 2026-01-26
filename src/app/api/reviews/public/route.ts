import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const PER_PAGE = 10;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const rating = Number(searchParams.get('rating') || 0);

    let query = getAdminDb()
      .collection('reviews')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc');

    if (rating >= 1 && rating <= 5) {
      query = query.where('rating', '==', rating);
    }

    const snap = await query.limit(page * PER_PAGE + 1).get();

    // Collect userIds
    const userIds = snap.docs.map(d => d.data().userId).filter(Boolean);

    // Fetch users in parallel
    const usersSnap = await Promise.all(
      userIds.map(uid =>
        getAdminDb().collection('users').doc(uid).get()
      )
    );

    const userMap = new Map(
      usersSnap
        .filter(s => s.exists)
        .map(s => [s.id, s.data()?.name])
    );

    const docs = snap.docs;
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    return NextResponse.json({
      reviews: docs.slice(start, end).map(d => {
        const data = d.data();
        return {
          id: d.id,
          rating: data.rating,
          comment: data.comment,
          publishedAt: data.publishedAt,
          displayName: userMap.get(data.userId) || 'Verified Customer',
        };
      }),
      hasNextPage: docs.length > end,
    });
  } catch (err) {
    console.error('[PUBLIC_REVIEWS_GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}