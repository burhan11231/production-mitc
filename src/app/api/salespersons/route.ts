import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb
      .collection('salespersons')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(data, {
      headers: {
        // ✅ CDN + browser cache (huge win)
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('SALESPERSONS_API_ERROR', err);
    return NextResponse.json(
      { error: 'Failed to load salespersons' },
      { status: 500 }
    );
  }
}