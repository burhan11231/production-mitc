import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

initAdmin();

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message?.trim()) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }

  const statsRef = admin.database().ref('meta/contactStats/totalMessages');

  const current = (await statsRef.get()).val() ?? 0;

  if (current >= 50000) {
    return NextResponse.json(
      { error: 'Messages are temporarily unavailable' },
      { status: 503 }
    );
  }

  // Store lead (Firestore)
  await admin.firestore().collection('leads').add({
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    message: message.trim(),
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Increment RTDB counter
  await statsRef.transaction(n => (n ?? 0) + 1);

  return NextResponse.json({ success: true });
}