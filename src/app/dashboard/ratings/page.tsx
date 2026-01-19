'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

// 👇 IMPORT THE NEW COMPONENT HERE
import RecalculateStats from '@/components/admin/RecalculateStats';

/* ---------------- TYPES ---------------- */

type FilterMode = 'all' | 'published' | 'pending';
type SortMode = 'newest' | 'oldest';

interface Review {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published';
  createdAt?: Timestamp | Date | string | number | null;
}

/* ---------------- COMPONENT ---------------- */

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('newest');

  /* ---------------- ADMIN GUARD ---------------- */

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

  /* ---------------- FETCH ---------------- */

  const fetchReviews = async () => {
  if (!user) return;

  setReviewsLoading(true);

  try {
    const token = await user.getIdToken();

    const res = await fetch('/api/admin/reviews', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed');

    const data = await res.json();
    setReviews(data);
  } catch {
    toast.error('Failed to load reviews');
  } finally {
    setReviewsLoading(false);
  }
};

  /* ---------------- HELPERS ---------------- */

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

  /* ---------------- FILTERED LIST ---------------- */

  const displayedReviews = useMemo(() => {
    if (filter === 'published')
      return reviews.filter((r) => r.status === 'published');
    if (filter === 'pending')
      return reviews.filter((r) => r.status === 'pending');
    return reviews;
  }, [reviews, filter]);

  /* ---------------- STATS ---------------- */

  const counts = useMemo(() => {
    const published = reviews.filter((r) => r.status === 'published').length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    return { all: reviews.length, published, pending };
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (!displayedReviews.length) return 0;
    const avg =
      displayedReviews.reduce((sum, r) => sum + r.rating, 0) /
      displayedReviews.length;
    return Math.round(avg * 10) / 10;
  }, [displayedReviews]);

  /* ---------------- ACTIONS ---------------- */

  const handleDelete = async (reviewId: string, userName?: string) => {
    if (!confirm(`Delete review${userName ? ` by ${userName}` : ''}?`)) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleToggleStatus = async (
    reviewId: string,
    nextStatus: 'pending' | 'published'
  ) => {
    // optimistic
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: nextStatus } : r
      )
    );

    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: nextStatus,
        moderatedAt: new Date(),
        moderatedBy: user?.uid || null,
      });

      toast.success(
        nextStatus === 'published'
          ? 'Review published'
          : 'Review moved to pending'
      );
    } catch {
      // revert
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                status: nextStatus === 'published' ? 'pending' : 'published',
              }
            : r
        )
      );
      toast.error('Failed to update review');
    }
  };

  if (isLoading || user?.role !== 'admin') return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/dashboard" className="text-sm text-blue-600">
            ← Back to Dashboard
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Review Moderation</h1>
              <p className="text-sm text-gray-600 mt-1">
                Approve or reject customer reviews.
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">
                {averageRating}
              </div>
              <p className="text-sm text-gray-600">
                {displayedReviews.length} shown • {counts.all} total
              </p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            {(['all', 'published', 'pending'] as FilterMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                    filter === mode
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} (
                  {counts[mode]})
                </button>
              )
            )}

            <button
              onClick={() =>
                setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))
              }
              className="px-4 py-2 rounded-lg border bg-white text-sm"
            >
              Sort: {sort === 'newest' ? 'Newest' : 'Oldest'}
            </button>

            <button
              onClick={fetchReviews}
              className="px-4 py-2 rounded-lg border bg-white text-sm"
            >
              Refresh
            </button>
            
            {/* 👇 THIS IS THE NEW BUTTON */}
            <div className="ml-auto">
              <RecalculateStats />
            </div>

          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {reviewsLoading ? (
          <p className="text-center">Loading…</p>
        ) : displayedReviews.length ? (
          <div className="space-y-6">
            {displayedReviews.map((r) => {
              const isPublished = r.status === 'published';

              return (
                <div key={r.id} className="bg-white p-8 rounded-2xl border">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {r.userName || 'Anonymous'}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i <= r.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 text-right">
                      {formatDate(r.createdAt)}
                    </div>
                  </div>

                  <p className="text-gray-700 whitespace-pre-line mb-6">
                    {r.comment}
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          r.id,
                          isPublished ? 'pending' : 'published'
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                        isPublished
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDelete(r.id, r.userName)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No reviews found.
          </p>
        )}
      </div>
    </div>
  );
}