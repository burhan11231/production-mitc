import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/requireAdmin'

export async function PATCH(req: NextRequest, context: any) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ✅ SAFE CAST INSIDE FUNCTION
    const { id } = context.params as { id: string }

    const data = await req.json()

    const adminDb = getAdminDb()
    await adminDb
      .collection('salespersons')
      .doc(id)
      .update({
        ...data,
        updatedAt: Date.now(),
      })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ✅ SAFE CAST INSIDE FUNCTION
    const { id } = context.params as { id: string }

    const adminDb = getAdminDb()
    await adminDb.collection('salespersons').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_SALESPERSON_DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}