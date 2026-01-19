'use client';

import { FaStar } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';

interface PublicReviewGateProps {
  myReview: {
    rating: number;
    comment: string;
    status: 'pending' | 'published';
  } | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PublicReviewGate({
  myReview,
  onEdit,
  onDelete,
}: PublicReviewGateProps) {
  const { user } = useAuth();

  /* ================= NOT LOGGED IN ================= */

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center">
        <p className="font-semibold mb-3">
          Want to share your experience?
        </p>
        <a
          href="/login"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Login to write a review
        </a>
      </div>
    );
  }

  /* ================= USER HAS NO REVIEW ================= */

  if (!myReview) {
    return (
      <div className="bg-white p-6 rounded-2xl border text-center">
        <p className="font-semibold mb-3">
          Share your experience with others
        </p>
        <button
          onClick={onEdit}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Write a Review
        </button>
      </div>
    );
  }

  /* ================= USER HAS REVIEW ================= */

  const isPending = myReview.status === 'pending';

  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-bold">Your Review</p>

        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            isPending
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isPending ? 'Pending approval' : 'Published'}
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
        <button
          onClick={onEdit}
          disabled={isPending}
          className={`font-semibold ${
            isPending
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600'
          }`}
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="font-semibold text-red-600"
        >
          Delete
        </button>
      </div>

      {isPending && (
        <p className="text-xs text-gray-500">
          Editing is disabled until admin approval.
        </p>
      )}
    </div>
  );
}