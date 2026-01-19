import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/adminfirebase';

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split('Bearer ')[1];
  const decoded = await getAdminAuth().verifyIdToken(token);

  return decoded.role === 'admin' ? decoded : null;
}

/* ---------------- PATCH (Publish / Unpublish) ---------------- */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { status } = await req.json();
    if (!['pending', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await getAdminDb()
      .collection('reviews')
      .doc(params.id)
      .update({
        status,
        moderatedAt: new Date(),
        moderatedBy: admin.uid,
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await getAdminDb().collection('reviews').doc(params.id).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}