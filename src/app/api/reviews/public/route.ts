import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminfirebase';

const PER_PAGE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') || 1);
  const rating = Number(searchParams.get('rating') || 0);

  const db = getAdminDb();

  let q = db
    .collection('reviews')
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .limit(PER_PAGE + 1);

  if (rating >= 1 && rating <= 5) {
    q = q.where('rating', '==', rating);
  }

  // Pagination cursor
  if (page > 1) {
    const cursorSnap = await db
      .collection('reviewCursors')
      .doc(`page-${page - 1}-${rating || 'all'}`)
      .get();

    if (cursorSnap.exists) {
      q = q.startAfter(cursorSnap.data()!.lastDoc);
    }
  }

  const snap = await q.get();
  const docs = snap.docs;

  const hasNextPage = docs.length > PER_PAGE;
  const pageDocs = hasNextPage ? docs.slice(0, PER_PAGE) : docs;

  // Save cursor
  if (pageDocs.length) {
    await db
      .collection('reviewCursors')
      .doc(`page-${page}-${rating || 'all'}`)
      .set({
        lastDoc: pageDocs[pageDocs.length - 1],
      });
  }

  return NextResponse.json({
    reviews: pageDocs.map(d => ({ id: d.id, ...d.data() })),
    hasNextPage,
  });
}