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
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar, FaPlus } from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';
import ReviewForm from '@/components/ReviewForm';

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | Date | string | number | null;
  published?: boolean;
}

export default function RatingsPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* ---------------- FETCH PUBLIC REVIEWS ---------------- */
  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('published', '==', true),
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
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    }
  };

  /* ---------------- FETCH CURRENT USER REVIEW (BY UID) ---------------- */
  const fetchMyReview = async () => {
    if (!user) {
      setMyReview(null);
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'reviews', user.uid));

      if (snap.exists()) {
        setMyReview({
          id: snap.id,
          ...(snap.data() as Omit<Review, 'id'>),
        });
      } else {
        setMyReview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchReviews(), fetchMyReview()]).finally(() =>
      setIsLoading(false)
    );
  }, [user]);

  /* ---------------- STATS (PUBLISHED ONLY) ---------------- */
  const stats = useMemo(() => {
    if (!reviews.length)
      return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

    const count = reviews.length;
    const avg =
      Math.round(
        (reviews.reduce((a, r) => a + r.rating, 0) / count) * 10
      ) / 10;

    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });

    return { avg, count, distribution: [...dist].reverse() };
  }, [reviews]);

  const formatDate = (v: Review['createdAt']) => {
    try {
      // @ts-ignore
      if (v?.toDate) return v.toDate().toLocaleDateString();
      if (v instanceof Date) return v.toLocaleDateString();
      if (typeof v === 'number') return new Date(v).toLocaleDateString();
      if (typeof v === 'string') return new Date(v).toLocaleDateString();
      return '';
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-lg text-gray-600">
            Real feedback from verified customers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT – STATS */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border p-8 sticky top-8">
              <div className="text-center mb-8">
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

              {!user && (
                <button
                  onClick={() => toast.error('Login to write a review')}
                  className="w-full py-4 rounded-xl bg-gray-200 font-bold"
                >
                  Login to Review
                </button>
              )}

              {user && !myReview && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800"
                >
                  <FaPlus className="inline mr-2" /> Write a Review
                </button>
              )}
            </div>
          </div>

          {/* RIGHT – LIST */}
          <div className="lg:col-span-8 space-y-6">
            {showForm && (
              <ReviewForm
                existingReview={myReview}
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
                  <div key={r.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="font-bold">{r.userName || 'User'}</h4>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FaStar
                              key={i}
                              size={14}
                              className={i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-600">{r.comment}</p>

                    {user?.uid === r.userId && (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => setShowForm(true)}
                          className="text-blue-600 font-semibold text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete your review?')) return;
                            await deleteDoc(doc(db, 'reviews', user.uid));
                            toast.success('Review deleted');
                            fetchReviews();
                            fetchMyReview();
                          }}
                          className="text-red-500 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl border text-center">
                <MdMessage size={48} className="mx-auto text-gray-300 mb-4" />
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