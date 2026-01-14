'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';
import ReviewForm from '@/components/ReviewForm';
import PublicReviewGate from '@/components/PublicReviewGate';

/* ---------------- TYPES ---------------- */

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | Date | string | number | null;
  status: 'pending' | 'published';
}

/* ---------------- COMPONENT ---------------- */

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ratingParam = searchParams.get('rating');
  const initialRating =
    ratingParam && Number(ratingParam) >= 1 && Number(ratingParam) <= 5
      ? Number(ratingParam)
      : null;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(
    initialRating
  );

  /* ---------------- FETCH DATA ---------------- */

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      const snap = await getDocs(q);
      setReviews(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Review, 'id'>),
        }))
      );
    } catch {
      toast.error('Failed to load reviews');
    }
  };

  const fetchMyReview = async () => {
    if (!user) return setMyReview(null);

    try {
      const snap = await getDoc(doc(db, 'reviews', user.uid));
      setMyReview(
        snap.exists()
          ? ({ id: snap.id, ...snap.data() } as Review)
          : null
      );
    } catch {
      setMyReview(null);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchReviews(), fetchMyReview()]).finally(() =>
      setIsLoading(false)
    );
  }, [user]);

  /* ---------------- URL FILTER SYNC ---------------- */

  const setRatingFilter = (rating: number | null) => {
    setFilterRating(rating);

    if (!rating) {
      router.replace('/reviews', { scroll: false });
    } else {
      router.replace(`/reviews?rating=${rating}`, { scroll: false });
    }
  };

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total === 0
        ? 0
        : Math.round(
            (reviews.reduce((a, r) => a + r.rating, 0) / total) * 10
          ) / 10;

    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return {
        star,
        percent: total ? Math.round((count / total) * 100) : 0,
      };
    });

    return { avg, total, distribution };
  }, [reviews]);

  /* ---------------- FILTER ---------------- */

  const visibleReviews = useMemo(() => {
    if (!filterRating) return reviews;
    return reviews.filter((r) => r.rating === filterRating);
  }, [reviews, filterRating]);

  /* ---------------- DATE FORMAT ---------------- */

  const formatDate = (v: Review['createdAt']) => {
    try {
      // @ts-ignore
      if (v?.toDate) return v.toDate().toLocaleDateString();
      return new Date(v as any).toLocaleDateString();
    } catch {
      return '';
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Verified feedback from real MITC customers
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 -mt-10 grid lg:grid-cols-12 gap-8">
        {/* LEFT – STATS */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl border p-8 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-black">{stats.avg}</div>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FaStar
                    key={i}
                    className={
                      i <= Math.round(stats.avg)
                        ? 'text-yellow-400'
                        : 'text-gray-200'
                    }
                  />
                ))}
              </div>
              <p className="text-gray-500">
                Based on {stats.total} reviews
              </p>
            </div>

            {/* STAR FILTER BARS */}
            <div className="space-y-3 mb-6">
              {stats.distribution.map((d) => (
                <button
                  key={d.star}
                  onClick={() =>
                    setRatingFilter(
                      filterRating === d.star ? null : d.star
                    )
                  }
                  className="w-full flex items-center gap-3 text-sm"
                >
                  <span className="w-24 flex">
                    {Array.from({ length: d.star }).map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <PublicReviewGate
              myReview={myReview}
              onWrite={() => setShowForm(true)}
            />
          </div>
        </aside>

        {/* RIGHT – REVIEWS */}
        <section className="lg:col-span-8 space-y-6">
          {showForm && !myReview && (
            <ReviewForm
              onSuccess={() => {
                setShowForm(false);
                fetchReviews();
                fetchMyReview();
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
            </div>
          ) : visibleReviews.length ? (
            <div className="grid gap-6">
              {visibleReviews.map((r) => (
                <article
                  key={r.id}
                  className="bg-white rounded-3xl border p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900">
                      {r.userName || 'User'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>

                  <div className="flex gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar
                        key={i}
                        size={14}
                        className={
                          i <= r.rating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {r.comment}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl border text-center">
              <MdMessage
                size={48}
                className="mx-auto text-gray-300 mb-4"
              />
              <h3 className="font-bold text-xl">
                No reviews match this filter
              </h3>
              <p className="text-gray-500">
                Try another rating or reset filters.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}