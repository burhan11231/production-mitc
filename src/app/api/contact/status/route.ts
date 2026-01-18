import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

const MAX_TOTAL_MESSAGES = 50000;

export async function GET() {
  const snap = await admin.database().ref('meta/contactStats').get();
  const total = snap.val()?.totalMessages ?? 0;

  return NextResponse.json({
    total,
    percent: Math.min(100, Math.round((total / MAX_TOTAL_MESSAGES) * 100)),
    blocked: total >= MAX_TOTAL_MESSAGES,
  });
}