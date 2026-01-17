'use server';

export const runtime = 'nodejs';

import admin from '@/lib/firebase-admin';

type ReactionType = 'like' | 'dislike';

export async function toggleSalespersonReaction(
  userId: string,
  salespersonId: string,
  type: ReactionType
) {
  const db = admin.firestore();

  const reactionId = `${userId}_${salespersonId}`;
  const reactionRef = db.doc(`salesperson_reactions/${reactionId}`);
  const salespersonRef = db.doc(`salespersons/${salespersonId}`);

  await db.runTransaction(async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    const salespersonSnap = await tx.get(salespersonRef);

    if (!salespersonSnap.exists) {
      throw new Error('Salesperson not found');
    }

    let likes = salespersonSnap.data()?.likesCount ?? 0;
    let dislikes = salespersonSnap.data()?.dislikesCount ?? 0;

    if (!reactionSnap.exists) {
      // NEW reaction
      tx.set(reactionRef, {
        userId,
        salespersonId,
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      type === 'like' ? likes++ : dislikes++;
    } else {
      const prevType = reactionSnap.data()?.type as ReactionType;

      if (prevType === type) {
        // TOGGLE OFF
        tx.delete(reactionRef);
        type === 'like' ? likes-- : dislikes--;
      } else {
        // SWITCH
        tx.update(reactionRef, {
          type,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        prevType === 'like' ? likes-- : dislikes--;
        type === 'like' ? likes++ : dislikes++;
      }
    }

    tx.update(salespersonRef, {
      likesCount: Math.max(0, likes),
      dislikesCount: Math.max(0, dislikes),
    });
  });
}