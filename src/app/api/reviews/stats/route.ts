import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  const snap = await getAdminDb()
    .collection('reviewStats')
    .doc('global')
    .get();

  return NextResponse.json(snap.exists ? snap.data() : null);
}