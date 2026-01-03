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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar, FaPlus } from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';
import ReviewForm from '@/components/ReviewForm';

interface Review {
  id: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | Date | string | number | null;
  published?: boolean;
}

function extractIndexUrl(err: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msg = (err as any)?.message || String(err);

  // Matches:
  // https://console.firebase.google.com/...
  // https://console.cloud.google.com/...
  // Captures until whitespace using S (non-whitespace) [web:98]
  const match = msg.match(/https://console.(firebase|cloud).google.com/S+/);
  return match?.[0] ?? null;
}

export default function RatingsPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [indexUrl, setIndexUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    setLoadError(null);
    setIndexUrl(null);

    try {
      // ✅ Public page: only published reviews (public can read them if rules allow published==true) [web:1]
      // This compound query may require a composite index; Firestore error includes a console link [web:1][web:2]
      const q = query(
        collection(db, 'reviews'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      const snap = await getDocs(q);

      const reviewsData = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, 'id'>),
      })) as Review[];

      setReviews(reviewsData);
    } catch (err) {
      console.error('Failed to load reviews:', err);

      const url = extractIndexUrl(err);
      if (url) {
        setIndexUrl(url);
        toast.error('Missing Firestore index. Use the link shown below.');
        console.error('Create the missing Firestore index here:', url);
      } else {
        toast.error('Failed to load reviews');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLoadError((err as any)?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

    const count = reviews.length;
    const avgRaw = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;

    const dist = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const rating = Number(r.rating);
      if (rating >= 1 && rating <= 5) dist[rating - 1] += 1;
    }

    return {
      avg: Math.round(avgRaw * 10) / 10,
      count,
      distribution: [...dist].reverse(),
    };
  }, [reviews]);

  const formatDate = (createdAt: Review['createdAt']) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (createdAt && typeof (createdAt as any).toDate === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (createdAt as any).toDate().toLocaleDateString();
      }
      if (createdAt instanceof Date) return createdAt.toLocaleDateString();
      if (typeof createdAt === 'number') return new Date(createdAt).toLocaleDateString();
      if (typeof createdAt === 'string') return new Date(createdAt).toLocaleDateString();
      return '';
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real feedback from our valued clients.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-gray-900 mb-2">{stats.avg}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FaStar
                      key={i}
                      size={20}
                      className={i <= Math.round(stats.avg) ? 'text-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <div className="text-gray-500">Based on {stats.count} reviews</div>
              </div>

              <div className="space-y-3">
                {stats.distribution.map((count, idx) => {
                  const starNum = 5 - idx;
                  const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
                  return (
                    <div key={starNum} className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-gray-600 w-12">{starNum} star</div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="text-sm text-gray-400 w-8 text-right">{Math.round(percentage)}%</div>
                    </div>
                  );
                })}
              </div>

              {!showForm && (
                <button
                  onClick={() => (user ? setShowForm(true) : toast.error('Please login to review'))}
                  className="w-full mt-8 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all"
                >
                  <FaPlus size={14} /> Write a Review
                </button>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-8 space-y-6">
            {(indexUrl || loadError) && (
              <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Couldn’t load reviews</h3>

                {indexUrl && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">
                      Firestore says this query needs a composite index. Create it here:
                    </p>
                    <a
                      href={indexUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {indexUrl}
                    </a>
                  </div>
                )}

                {loadError && (
                  <pre className="text-xs bg-gray-50 border border-gray-100 p-3 rounded-xl overflow-auto">
                    {loadError}
                  </pre>
                )}

                <button
                  onClick={fetchReviews}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
                >
                  Retry
                </button>
              </div>
            )}

            {showForm && (
              <ReviewForm
                onSuccess={() => {
                  setShowForm(false);
                  fetchReviews();
                }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{review.userName || 'Anonymous'}</h4>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <FaStar
                                key={i}
                                size={14}
                                className={i <= review.rating ? 'text-yellow-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                <MdMessage size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-8">Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}