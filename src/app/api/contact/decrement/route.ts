import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

initAdmin();

export async function POST() {
  await admin
    .database()
    .ref('meta/contactStats/totalMessages')
    .transaction(n => Math.max(0, (n ?? 1) - 1));

  return NextResponse.json({ success: true });
}