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

export default function RatingsPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* ---------------- FETCH PUBLISHED REVIEWS ---------------- */

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

  /* ---------------- FETCH MY REVIEW ---------------- */

  const fetchMyReview = async () => {
    if (!user) {
      setMyReview(null);
      return;
    }

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
    if (!reviews.length)
      return { avg: 0, count: 0 };

    const count = reviews.length;
    const avg =
      Math.round(
        (reviews.reduce((a, r) => a + r.rating, 0) / count) * 10
      ) / 10;

    return { avg, count };
  }, [reviews]);

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
    <div className="min-h-screen bg-gray-50/50 pb-20">
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
          {/* LEFT – STATS + GATE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border p-8 sticky top-8">
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
                  Based on {stats.count} reviews
                </p>
              </div>

              <PublicReviewGate
                myReview={myReview}
                onWrite={() => setShowForm(true)}
              />
            </div>
          </div>

          {/* RIGHT – LIST */}
          <div className="lg:col-span-8 space-y-6">
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
            ) : reviews.length ? (
              <div className="grid gap-6">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-6 rounded-2xl border shadow-sm"
                  >
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="font-bold">
                          {r.userName || 'User'}
                        </h4>
                        <div className="flex gap-1">
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

                    <p className="text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl border text-center">
                <MdMessage
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="font-bold text-xl">No reviews yet</h3>
                <p className="text-gray-500">
                  Be the first to share your experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}