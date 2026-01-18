// src/app/actions/getUserSalespersonReaction.ts
'use server';

import { adminDb } from '@/lib/firebase-admin';

export async function getUserSalespersonReaction(
  userId: string,
  salespersonId: string
): Promise<'like' | 'dislike' | null> {
  const snap = await adminDb
    .doc(`salesperson_reactions/${userId}_${salespersonId}`)
    .get();

  if (!snap.exists) return null;
  return snap.data()?.type ?? null;
}