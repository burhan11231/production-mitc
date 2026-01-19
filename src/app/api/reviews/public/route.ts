import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const PER_PAGE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const rating = Number(searchParams.get('rating') || 0);

  const db = getAdminDb();

  let query = db
    .collection('reviews')
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc');

  if (rating >= 1 && rating <= 5) {
    query = query.where('rating', '==', rating);
  }

  // Fetch only what we need
  const snap = await query.limit(page * PER_PAGE + 1).get();
  const docs = snap.docs;

  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;

  const pageDocs = docs.slice(start, end);
  const hasNextPage = docs.length > end;

  return NextResponse.json({
    reviews: pageDocs.map(d => ({
      id: d.id,
      ...d.data(),
    })),
    hasNextPage,
  });
}