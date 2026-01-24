import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const adminDb = getAdminDb();

    const snap = await adminDb
      .collection('salespersons')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const salespersons = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(salespersons, {
      headers: {
        'Cache-Control': 'private, max-age=300',
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