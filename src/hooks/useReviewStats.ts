'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

let cachedStats: ReviewStats | null = null;
let statsPromise: Promise<ReviewStats | null> | null = null;

export function useReviewStats() {
  const [stats, setStats] = useState<ReviewStats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    if (!statsPromise) {
      statsPromise = (async () => {
        const snap = await getDoc(doc(db, 'reviewStats', 'global'));
        cachedStats = snap.exists() ? (snap.data() as ReviewStats) : null;
        return cachedStats;
      })();
    }

    statsPromise
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}