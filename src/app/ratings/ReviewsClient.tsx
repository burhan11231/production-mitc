'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import StarRating from '@/components/StarRatings';
import PublicReviewGate from '@/components/PublicReviewGate';
import ReviewForm from '@/components/ReviewForm';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import AggregateRatingSchema from './AggregateRatingSchema';
import ReviewSchema from './ReviewSchema';

import { useAuth } from '@/lib/auth-context';

/* ---------------- TYPES ---------------- */

interface Review {
  id: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  starCounts: Record<string, number>;
}

/* ---------------- PROPS ---------------- */

interface ReviewsClientProps {
  initialPage: number;
  initialRating: number | null;
}

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: ReviewsClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const [page, setPage] = useState(initialPage);
  const [ratingFilter, setRatingFilter] = useState<number | null>(
    initialRating
  );

  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [myReview, setMyReview] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  /* ---------------- FETCH PUBLIC REVIEWS ---------------- */

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (ratingFilter) params.set('rating', String(ratingFilter));

      const res = await fetch(`/api/reviews/public?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setReviews(data.reviews);
      setHasNextPage(data.hasNextPage);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reviews/stats', {
        cache: 'no-store',
      });

      if (!res.ok) return;
      setStats(await res.json());
    } catch {
      /* silent */
    }
  };

  /* ---------------- FETCH MY REVIEW ---------------- */

  const fetchMyReview = async () => {
    if (!user) {
      setMyReview(null);
      return;
    }

    try {
      const res = await fetch(`/api/reviews/my`, {
        cache: 'no-store',
      });

      if (!res.ok) return;
      setMyReview(await res.json());
    } catch {
      /* silent */
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [page, ratingFilter]);

  useEffect(() => {
    fetchMyReview();
  }, [user]);

  /* ---------------- HANDLERS ---------------- */



const handleSoftDelete = async () => {
  if (!user || !myReview) return;
  if (!confirm('Delete your review?')) return;

  try {
    await updateDoc(doc(db, 'reviews', user.uid), {
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });

    toast.success('Review deleted');
    setMyReview(null);
    fetchReviews();
    fetchStats();
  } catch {
    toast.error('Delete failed');
  }
};

  const changeRatingFilter = (rating: number | null) => {
    setPage(1);
    setRatingFilter(rating);

    const params = new URLSearchParams();
    if (rating) params.set('rating', String(rating));
    router.push(`/ratings?${params.toString()}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- SEO STRUCTURED DATA ---------- */}
      {stats && page === 1 && !ratingFilter && (
        <>
          <AggregateRatingSchema
            avg={stats.averageRating}
            total={stats.totalReviews}
          />
          <ReviewSchema reviews={reviews} />
        </>
      )}

      {/* ---------- HEADER ---------- */}
      <div className="bg-white border-b py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Customer Reviews</h1>

          {stats && (
            <div className="mt-4 flex items-center gap-4">
              <StarRating rating={stats.averageRating} size={26} />
              <span className="text-lg font-semibold">
                {stats.averageRating.toFixed(1)} / 5
              </span>
              <span className="text-gray-500">
                ({stats.totalReviews} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
<div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_2fr] gap-10">

  {/* ---------- LEFT: MY REVIEW / FORM ---------- */}
  <div className="space-y-6">

    {!myReview && !showForm && (
      <PublicReviewGate
        myReview={null}
        onEdit={() => setShowForm(true)}
        onDelete={() => {}}
      />
    )}

    {myReview && !showForm && (
      <PublicReviewGate
        myReview={myReview}
        onEdit={() => {
          if (myReview.status === 'pending') return;
          setShowForm(true);
        }}
        onDelete={handleSoftDelete}
      />
    )}

    {showForm && (
      <ReviewForm
        existingReview={myReview}
        onSuccess={() => {
          setShowForm(false);
          fetchMyReview();
          fetchReviews();
          fetchStats();
        }}
        onCancel={() => setShowForm(false)}
      />
    )}
  </div>

  {/* ---------- RIGHT: REVIEWS LIST ---------- */}
  <div className="space-y-6">

    {/* FILTERS */}
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => changeRatingFilter(null)}
        className={`px-4 py-2 rounded-xl border text-sm ${
          ratingFilter === null ? 'bg-gray-900 text-white' : 'bg-white'
        }`}
      >
        All
      </button>

      {[5, 4, 3, 2, 1].map((r) => (
        <button
          key={r}
          onClick={() => changeRatingFilter(r)}
          className={`px-4 py-2 rounded-xl border text-sm ${
            ratingFilter === r ? 'bg-gray-900 text-white' : 'bg-white'
          }`}
        >
          {r}★
        </button>
      ))}
    </div>

    {/* LIST */}
    {loading ? (
      <p className="text-center py-10">Loading…</p>
    ) : reviews.length ? (
      reviews.map((r) => (
        <div
          key={r.id}
          className="bg-white p-6 rounded-2xl border"
        >
          <div className="flex items-center gap-3">
            <p className="font-bold">
              {r.userName || 'Verified Customer'}
            </p>
            <StarRating rating={r.rating} size={18} />
          </div>

          <p className="text-gray-700 mt-3 whitespace-pre-line">
            {r.comment}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No reviews found.</p>
    )}

    {/* PAGINATION */}
    <div className="flex justify-between pt-6">
      {page > 1 && (
        <button
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded-xl"
        >
          Previous
        </button>
      )}

      {hasNextPage && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded-xl ml-auto"
        >
          Next
        </button>
      )}
    </div>

  </div>
</div>
    </div>
  );
}