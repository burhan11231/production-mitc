'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { HiChevronDown } from 'react-icons/hi2';
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

type SortMode = 'newest' | 'oldest' | 'rating';

/* ---------------- COMPONENT ---------------- */

export default function RatingsPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  /* ---------------- FETCH ---------------- */

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
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      };
    });

    return { avg, total, distribution };
  }, [reviews]);

  /* ---------------- FILTER + SORT ---------------- */

  const visibleReviews = useMemo(() => {
    let list = [...reviews];

    if (filterRating) list = list.filter((r) => r.rating === filterRating);
    if (sortMode === 'oldest') list.reverse();
    if (sortMode === 'rating') list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [reviews, filterRating, sortMode]);

  /* ---------------- DATE ---------------- */

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
    <div className="min-h-screen bg-gray-50/60 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Real feedback from verified customers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT – STATS */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border p-8 sticky top-8 space-y-6">
              <div className="text-center">
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

              {/* DISTRIBUTION BARS */}
              <div className="space-y-2">
                {stats.distribution.map((d) => (
                  <button
                    key={d.star}
                    onClick={() =>
                      setFilterRating(
                        filterRating === d.star ? null : d.star
                      )
                    }
                    className={`w-full flex items-center gap-3 text-sm ${
                      filterRating === d.star
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="w-8">{d.star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right">{d.percent}%</span>
                  </button>
                ))}
              </div>

              <PublicReviewGate
                myReview={myReview}
                onWrite={() => setShowForm(true)}
              />
            </div>
          </div>

          {/* RIGHT – FILTER + REVIEWS */}
          <div className="lg:col-span-8 space-y-6">

            {/* FILTER BAR */}
            <div className="bg-white border rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold mr-1">Filter:</span>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setFilterRating(filterRating === star ? null : star)
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                      filterRating === star
                        ? 'bg-yellow-400 border-yellow-400 text-black'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {star}★
                  </button>
                ))}
                {filterRating && (
                  <button
                    onClick={() => setFilterRating(null)}
                    className="text-sm text-blue-600 ml-2"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* SORT */}
              <div className="relative">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="appearance-none border rounded-xl pl-4 pr-10 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="rating">Highest rating</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

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
                  <div
                    key={r.id}
                    className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {r.userName || 'Customer'}
                        </h4>
                        <div className="flex gap-1 mt-1">
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
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
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
                  Try a different rating or reset filters.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}