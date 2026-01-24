import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/requireAdmin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    const adminDb = getAdminDb()
    await adminDb.collection('salespersons').doc(params.id).update({
      ...data,
      updatedAt: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminDb = getAdminDb()
    await adminDb.collection('salespersons').doc(params.id).delete()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}