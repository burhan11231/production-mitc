import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminDb = getAdminDb();

    const snap = await adminDb
      .collection('salespersons')
      .orderBy('order', 'asc')
      .get();

    const salespersons = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(salespersons, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[ADMIN_SALESPERSONS_GET]', err);
    return NextResponse.json(
      { error: 'Failed to load salespersons' },
      { status: 500 }
    );
  }
}