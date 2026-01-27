import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    const db = getAdminDb()

    // 🔥 DELETE REVIEWS (CORRECT FIELD)
    const reviewsSnap = await db
      .collection('reviews')
      .where('userId', '==', uid)
      .get()

    for (const doc of reviewsSnap.docs) {
      await doc.ref.delete()
    }

    // 🔥 DELETE USER DOC
    await db.collection('users').doc(uid).delete()

    // 🔥 DELETE AUTH USER
    await adminAuth.deleteUser(uid)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[ACCOUNT_DELETE]', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}