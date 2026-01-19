import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(null, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await getAdminAuth().verifyIdToken(token);

    const snap = await getAdminDb()
      .collection('reviews')
      .doc(decoded.uid)
      .get();

    if (!snap.exists) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: snap.id,
      ...snap.data(),
    });
  } catch (err) {
    console.error('[REVIEWS_MY_GET]', err);
    return NextResponse.json(null, { status: 500 });
  }
}