'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

type FilterMode = 'all' | 'published' | 'hidden';
type SortMode = 'newest' | 'oldest';

interface Review {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | Date | string | number | null;
  published?: boolean;
}

export default function RatingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('newest');

  // ---- Guard: admin only ----
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, sort]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const q = query(
        collection(db, 'reviews'),
        orderBy('createdAt', sort === 'newest' ? 'desc' : 'asc')
      );
      const snap = await getDocs(q);

      const reviewsData = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, 'id'>),
      })) as Review[];

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (createdAt: Review['createdAt']) => {
    try {
      // Firestore Timestamp
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

  const displayedReviews = useMemo(() => {
    const list = [...reviews];

    if (filter === 'published') return list.filter((r) => r.published === true);
    if (filter === 'hidden') return list.filter((r) => !r.published);
    return list;
  }, [reviews, filter]);

  const averageRating = useMemo(() => {
    if (!displayedReviews.length) return 0;
    const avg = displayedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / displayedReviews.length;
    return Math.round(avg * 10) / 10;
  }, [displayedReviews]);

  const counts = useMemo(() => {
    const publishedCount = reviews.filter((r) => r.published === true).length;
    const hiddenCount = reviews.length - publishedCount;
    return { all: reviews.length, published: publishedCount, hidden: hiddenCount };
  }, [reviews]);

  const handleDelete = async (reviewId: string, userName?: string) => {
    if (!confirm(`Delete review${userName ? ` by ${userName}` : ''}?`)) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleTogglePublish = async (reviewId: string, nextPublished: boolean) => {
    // Optimistic UI update (fast UI)
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, published: nextPublished } : r))
    );

    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        published: nextPublished,
        moderatedAt: new Date(),
        moderatedBy: user?.uid || null,
      });
      toast.success(nextPublished ? 'Review published' : 'Review hidden');
    } catch (error) {
      console.error('Error updating publish state:', error);
      // revert on failure
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, published: !nextPublished } : r))
      );
      toast.error('Failed to update review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Review Moderation</h1>
              <p className="text-gray-600 mt-2 text-sm">
                Publish/hide reviews (public page shows only published reviews). {/* per Option A [web:6] */}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`text-2xl ${i <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                ({displayedReviews.length} shown • {counts.all} total)
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  filter === 'published'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Published ({counts.published})
              </button>
              <button
                onClick={() => setFilter('hidden')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  filter === 'hidden'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Hidden ({counts.hidden})
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                title="Toggle sort order"
              >
                Sort: {sort === 'newest' ? 'Newest first' : 'Oldest first'}
              </button>

              <button
                onClick={fetchReviews}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reviewsLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : displayedReviews.length > 0 ? (
          <div className="space-y-6">
            {displayedReviews.map((review) => {
              const isPublished = review.published === true;

              return (
                <div key={review.id} className="card p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{review.userName || 'Anonymous'}</h3>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full border ${
                            isPublished
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Hidden'}
                        </span>
                      </div>

                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`text-xl ${i <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      {!!review.userEmail && (
                        <p className="text-xs text-gray-500 mt-2">{review.userEmail}</p>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500 mb-3">{formatDate(review.createdAt)}</p>

                      <div className="flex gap-2 sm:justify-end flex-wrap">
                        <button
                          onClick={() => handleTogglePublish(review.id, !isPublished)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                            isPublished
                              ? 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {isPublished ? 'Hide' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleDelete(review.id, review.userName)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-gray-600 text-lg">No reviews found</p>
            <p className="text-gray-500">Try changing the filter or refresh.</p>
          </div>
        )}
      </div>
    </div>
  );
}