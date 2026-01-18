// app/api/admin/salespersons/route.ts
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  const snap = await adminDb
    .collection('salespersons')
    .orderBy('order', 'asc')
    .get()

  return NextResponse.json(
    snap.docs.map(d => ({ id: d.id, ...d.data() })),
    { headers: { 'Cache-Control': 'no-store' } }
  )
}