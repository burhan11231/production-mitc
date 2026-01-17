import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const MAX_MESSAGES_PER_MONTH = 30;

export async function POST(req: Request) {
  try {
    const { userId, name, email, phone, message } = await req.json();

    if (!userId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ✅ Count leads for this month (1 read)
    const countSnap = await adminDb
      .collection('leads')
      .where('userId', '==', userId)
      .where('createdAt', '>=', monthStart)
      .count()
      .get();

    const used = countSnap.data().count;

    if (used >= MAX_MESSAGES_PER_MONTH) {
      return NextResponse.json(
        { error: 'Monthly inquiry limit reached' },
        { status: 429 }
      );
    }

    // ✅ Create lead (1 write)
    await adminDb.collection('leads').add({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim(),
      userId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      remaining: MAX_MESSAGES_PER_MONTH - (used + 1),
    });
  } catch (err) {
    console.error('CONTACT_POST_ERROR', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}