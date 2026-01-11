'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';

interface PublicReviewGateProps {
  myReview: {
    rating: number;
    comment: string;
    status: 'pending' | 'published';
  } | null;
  onWrite: () => void;
}

export default function PublicReviewGate({
  myReview,
  onWrite,
}: PublicReviewGateProps) {
  const { user } = useAuth();

  /* ================= NOT LOGGED IN ================= */

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center">
        <p className="font-semibold mb-3">
          Want to share your experience?
        </p>
        <Link
          href="/login"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Login to write a review
        </Link>
      </div>
    );
  }

  /* ================= USER HAS REVIEW ================= */

  if (myReview) {
    return (
      <div className="bg-white p-6 rounded-2xl border space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-bold">Your Review</p>

          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              myReview.status === 'published'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {myReview.status === 'published'
              ? 'Published'
              : 'Pending approval'}
          </span>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar
              key={i}
              className={
                i <= myReview.rating
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }
            />
          ))}
        </div>

        <p className="text-gray-700">{myReview.comment}</p>

        <div className="pt-4 border-t flex gap-4">
          <Link
            href="/profile"
            className="text-blue-600 font-semibold"
          >
            {myReview.status === 'pending'
              ? 'View in Profile'
              : 'Edit / Delete in Profile'}
          </Link>
        </div>

        {myReview.status === 'pending' && (
          <p className="text-xs text-gray-500">
            Editing is disabled until admin approval.
          </p>
        )}
      </div>
    );
  }

  /* ================= USER CAN WRITE ================= */

  return (
    <div className="bg-white p-6 rounded-2xl border text-center">
      <p className="font-semibold mb-3">
        Share your experience with others
      </p>
      <button
        onClick={onWrite}
        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold"
      >
        Write a Review
      </button>
    </div>
  );
}