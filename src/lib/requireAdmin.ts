import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const decoded = await getAdminAuth().verifyIdToken(token);

  const userSnap = await getAdminDb()
    .collection('users')
    .doc(decoded.uid)
    .get();

  if (!userSnap.exists) return null;

  return userSnap.data()?.role === 'admin' ? decoded : null;
}