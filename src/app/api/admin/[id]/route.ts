import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

type RouteContext = {
  params: {
    id: string;
  };
};

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const decoded = await getAdminAuth().verifyIdToken(token);

  return decoded.role === 'admin' ? decoded : null;
}

/* ---------------- PATCH (Publish / Unpublish) ---------------- */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
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
      .doc(context.params.id)
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
  req: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await getAdminDb()
      .collection('reviews')
      .doc(context.params.id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}