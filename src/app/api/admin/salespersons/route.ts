import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const adminDb = getAdminDb();
    const userId = req.headers.get('x-user-id');

    const snap = await adminDb
      .collection('salespersons')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const salespersons = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // ✅ Attach user reaction (if logged in)
    if (userId) {
      const reactionRefs = salespersons.map(sp =>
        adminDb.doc(`salesperson_reactions/${userId}_${sp.id}`)
      );

      const reactionSnaps = await adminDb.getAll(...reactionRefs);

      reactionSnaps.forEach((r, i) => {
        salespersons[i].userReaction = r.exists
          ? r.data()?.type ?? null
          : null;
      });
    }

    // ✅ IMPORTANT: disable caching
    return NextResponse.json(salespersons, {
      headers: {
        'Cache-Control': 'no-store',
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