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

    // ✅ Reactivate account
    await db.collection('users').doc(uid).update({
      isDisabled: false,
      updatedAt: new Date(),
    })

    // Optional: revoke tokens so user must re-login cleanly
    await adminAuth.revokeRefreshTokens(uid)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[ACCOUNT_ACTIVATE]', e)
    return NextResponse.json({ error: 'Activate failed' }, { status: 500 })
  }
}