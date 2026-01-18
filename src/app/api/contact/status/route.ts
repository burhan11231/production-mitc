import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

const MAX_TOTAL_MESSAGES = 50000;

initAdmin();

export async function GET() {
  const snap = await admin
    .database()
    .ref('meta/contactStats')
    .get();

  const total = snap.val()?.totalMessages ?? 0;
  const percent = Math.min(
    100,
    Math.round((total / MAX_TOTAL_MESSAGES) * 100)
  );

  return NextResponse.json({
    total,
    percent,
    blocked: total >= MAX_TOTAL_MESSAGES,
  });
}