import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

/* ------------------------------------
   INIT ADMIN SDK (SAFE SINGLETON)
------------------------------------ */
initAdmin();

/* ------------------------------------
   POST: Decrement totalMessages
   Admin-only
------------------------------------ */
export async function POST(req: Request) {
  try {
    /* ---------- AUTH HEADER ---------- */
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    /* ---------- VERIFY TOKEN ---------- */
    const decoded = await getAuth().verifyIdToken(token);

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    /* ---------- ATOMIC DECREMENT ---------- */
    await admin
      .database()
      .ref('meta/contactStats/totalMessages')
      .transaction(current =>
        Math.max(0, (current ?? 0) - 1)
      );

    /* ---------- SUCCESS ---------- */
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACT_DECREMENT_ERROR]', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}