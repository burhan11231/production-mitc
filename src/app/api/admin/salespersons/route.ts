import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/requireAdmin'

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
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}