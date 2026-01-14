'use client';

import { useState } from 'react';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function RecalculateStats() {
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      // 1. Get all PUBLISHED reviews
      const q = query(collection(db, 'reviews'), where('status', '==', 'published'));
      const snap = await getDocs(q);
      const reviews = snap.docs.map(d => d.data());

      // 2. Calculate Stats
      const totalReviews = reviews.length;
      let sumRating = 0;
      const starCounts: Record<string, number> = {
        '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
      };

      reviews.forEach((r) => {
        // @ts-ignore
        const rating = r.rating || 0;
        sumRating += rating;
        
        // Count specific stars
        if (starCounts[String(rating)] !== undefined) {
          starCounts[String(rating)]++;
        }
      });

      const averageRating = totalReviews > 0 
        ? Number((sumRating / totalReviews).toFixed(1)) 
        : 0;

      // 3. Save to reviewStats/global
      await setDoc(doc(db, 'reviewStats', 'global'), {
        totalReviews,
        averageRating,
        starCounts,
        updatedAt: new Date()
      });

      toast.success(`Stats updated! Avg: ${averageRating}, Total: ${totalReviews}`);
      // Optional: reload page to see new stats in header
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRecalculate}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? 'Calculating...' : 'Recalculate Stats'}
    </button>
  );
}