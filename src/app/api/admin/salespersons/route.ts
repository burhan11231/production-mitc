import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/requireAdmin'

/* ================= GET (FETCH ALL) ================= */

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection('salespersons')
      .orderBy('order', 'asc')
      .get()

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_GET]', err)
    return NextResponse.json(
      { error: 'Fetch failed' },
      { status: 500 }
    )
  }
}

/* ================= POST (CREATE) ================= */

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    const adminDb = getAdminDb()
    const ref = await adminDb.collection('salespersons').add({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_POST]', err)
    return NextResponse.json(
      { error: 'Create failed' },
      { status: 500 }
    )
  }
}