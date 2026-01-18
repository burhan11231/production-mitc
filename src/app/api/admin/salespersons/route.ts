// src/app/api/admin/salespersons/route.ts
import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/* =======================
   GET – Load all members
======================= */
export async function GET() {
  const adminDb = getAdminDb() // ✅ INIT INSIDE HANDLER

  const snap = await adminDb
    .collection('salespersons')
    .orderBy('order', 'asc')
    .get()

  const data = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }))

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

/* =======================
   POST – Add member
======================= */
export async function POST(req: Request) {
  const adminDb = getAdminDb()

  const body = await req.json()

  await adminDb.collection('salespersons').add({
    ...body,
    likesCount: 0,
    dislikesCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ success: true })
}

/* =======================
   PATCH – Update member
======================= */
export async function PATCH(req: Request) {
  const adminDb = getAdminDb()

  const { id, updates } = await req.json()

  await adminDb.doc(`salespersons/${id}`).update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ success: true })
}

/* =======================
   DELETE – Remove member
======================= */
export async function DELETE(req: Request) {
  const adminDb = getAdminDb()

  const { id } = await req.json()

  await adminDb.doc(`salespersons/${id}`).delete()

  return NextResponse.json({ success: true })
}