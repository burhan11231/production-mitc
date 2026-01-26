import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/requireAdmin';

/* ---------------- PATCH ---------------- */
export async function PATCH(req: NextRequest, context: any) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await req.json();
    if (!['pending', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await getAdminDb()
      .collection('reviews')
      .doc(context.params.id)
      .update({
  status,
  moderatedAt: new Date(),
  moderatedBy: admin.uid,
  publishedAt: status === 'published' ? new Date() : null,
});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ADMIN_REVIEW_PATCH]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req: NextRequest, context: any) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await getAdminDb()
      .collection('reviews')
      .doc(context.params.id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ADMIN_REVIEW_DELETE]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}