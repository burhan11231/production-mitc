import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');

    // 1️⃣ Load salespersons
    const snap = await adminDb
      .collection('salespersons')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const salespersons = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // 2️⃣ If user logged in → batch-load reactions
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