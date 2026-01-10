'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function TopFooter() {
  const [rating, setRating] = useState({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => d.data());
        const count = data.length;

        if (count) {
          const sum = data.reduce(
            (a, r: any) => a + (Number(r.rating) || 0),
            0
          );
          setRating({
            avg: Math.round((sum / count) * 10) / 10,
            count,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">
            Store Location
          </p>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            Gaw Kadal, Maisuma
          </h3>
          <p className="text-sm text-gray-500">
            Srinagar, J&K — 190001
          </p>
        </div>

        {/* RATINGS (RIGHT-ALIGNED ON DESKTOP) */}
        {!loading && (
          <div className="text-right hidden sm:block">
            <div className="flex justify-end gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  filled={star <= Math.round(rating.avg)}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {rating.avg}
              <span className="text-gray-400 font-medium">
                {' '}({rating.count})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="my-6 h-px bg-gray-200" />

      {/* FOOT ACTION ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <a
          href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-900 hover:underline"
        >
          Get Directions →
        </a>

        <Link
          href="/ratings"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Read customer reviews →
        </Link>
      </div>
    </div>
  );
}