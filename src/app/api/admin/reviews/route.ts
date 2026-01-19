import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snap = await getAdminDb()
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();

    return NextResponse.json(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
    );
  } catch (err) {
    console.error('[ADMIN_REVIEWS_GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}