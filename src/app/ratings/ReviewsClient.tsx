'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import AggregateRatingSchema from './AggregateRatingSchema';
import ReviewSchema from './ReviewSchema';

import StarRating from '@/components/StarRatings';
import PublicReviewGate from '@/components/PublicReviewformGate';

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

interface Props {
  initialPage: number;
  initialRating: number | null;
}

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const [page, setPage] = useState(initialPage);
  const [rating, setRating] = useState<number | null>(initialRating);

  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH STATS ---------------- */

  useEffect(() => {
    fetch('/api/reviews/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  /* ---------------- FETCH REVIEWS ---------------- */

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    params.set('page', String(page));
    if (rating) params.set('rating', String(rating));

    fetch(`/api/reviews/public?${params}`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setHasNextPage(data.hasNextPage);
      })
      .catch(() => {
        toast.error('Failed to load reviews');
      })
      .finally(() => setLoading(false));
  }, [page, rating]);

  /* ---------------- URL SYNC ---------------- */

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', String(page));
    rating ? params.set('rating', String(rating)) : params.delete('rating');

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [page, rating]);

  /* ---------------- FILTERED REVIEWS ---------------- */

  const schemaReviews = useMemo(
    () =>
      reviews.map((r) => ({
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    [reviews]
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= SCHEMA (SEO) ================= */}
      {stats && page === 1 && !rating && (
        <>
          <AggregateRatingSchema
            avg={stats.averageRating}
            total={stats.totalReviews}
          />
          <ReviewSchema reviews={schemaReviews} />
        </>
      )}

      {/* ================= HEADER ================= */}
      <section className="bg-white border-b py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3">
            Customer Reviews
          </h1>

          {stats && (
            <div className="flex items-center gap-4">
              <StarRating rating={stats.averageRating} size={22} />
              <span className="text-gray-600">
                {stats.averageRating.toFixed(1)} · {stats.totalReviews} reviews
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ================= FILTER ================= */}
      <section className="max-w-7xl mx-auto px-6 py-6 flex gap-3 flex-wrap">
        <button
          onClick={() => {
            setRating(null);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg border ${
            rating === null ? 'bg-gray-900 text-white' : 'bg-white'
          }`}
        >
          All
        </button>

        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => {
              setRating(r);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border ${
              rating === r ? 'bg-gray-900 text-white' : 'bg-white'
            }`}
          >
            {r}★
          </button>
        ))}
      </section>

      {/* ================= REVIEW GATE ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-10">
        <PublicReviewGate
          myReview={null /* fetched elsewhere if needed */}
          onWrite={() => router.push('/profile')}
        />
      </section>

      {/* ================= LIST ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <p className="text-center">Loading…</p>
        ) : reviews.length ? (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-xl border"
              >
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">
                    {r.userName || 'Verified Customer'}
                  </p>
                  <StarRating rating={r.rating} />
                </div>

                <p className="text-gray-700 whitespace-pre-line">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No reviews found.
          </p>
        )}

        {/* ================= PAGINATION ================= */}
        <div className="mt-10 flex justify-center gap-4">
          {page > 1 && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Previous
            </button>
          )}

          {hasNextPage && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </section>
    </div>
  );
}