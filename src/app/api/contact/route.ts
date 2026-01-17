import { NextResponse } from 'next/server';
import admin from '@/firebase-admin';

const db = admin.firestore();
const MAX_MESSAGES_PER_MONTH = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, message } = body;

    if (!userId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 🔒 Count messages server-side
    const countSnap = await db
      .collection('leads')
      .where('userId', '==', userId)
      .where('createdAt', '>=', monthStart)
      .count()
      .get();

    const used = countSnap.data().count;

    if (used >= MAX_MESSAGES_PER_MONTH) {
      return NextResponse.json(
        { error: 'Monthly limit reached' },
        { status: 429 }
      );
    }

    // Create lead
    await db.collection('leads').add({
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
    console.error(err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}