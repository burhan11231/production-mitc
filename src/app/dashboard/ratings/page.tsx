'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

/* ---------------- TYPES ---------------- */

type FilterMode = 'all' | 'published' | 'pending';

interface Review {
  id: string
  userName?: string
  rating: number
  comment: string
  status: 'pending' | 'published'
  createdAt?: any
  publishedAt?: {
    seconds: number
  } | null
}

/* ---------------- COMPONENT ---------------- */

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');

  /* ---------------- ADMIN GUARD ---------------- */

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  /* ---------------- TOKEN HELPER ---------------- */

  const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  /* ---------------- FETCH REVIEWS ---------------- */

  const fetchReviews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getToken();

      const res = await fetch('/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchReviews();
  }, [user?.role]);

  /* ---------------- ACTIONS ---------------- */

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;

    try {
      const token = await getToken();

      await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async (
    id: string,
    nextStatus: 'pending' | 'published'
  ) => {
    // optimistic update
    setReviews(prev =>
  prev.map(r =>
    r.id === id
      ? {
          ...r,
          status: nextStatus,
          publishedAt:
            nextStatus === 'published'
              ? { seconds: Math.floor(Date.now() / 1000) }
              : null,
        }
      : r
  )
);

    try {
      const token = await getToken();

      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
      fetchReviews(); // revert
    }
  };

  /* ---------------- FILTER ---------------- */

  const displayedReviews = useMemo(() => {
    if (filter === 'published')
      return reviews.filter(r => r.status === 'published');
    if (filter === 'pending')
      return reviews.filter(r => r.status === 'pending');
    return reviews;
  }, [reviews, filter]);

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

          <div className="mt-6 flex flex-wrap gap-3 items-center">
  {(['all', 'published', 'pending'] as FilterMode[]).map(mode => (
    <button
      key={mode}
      onClick={() => setFilter(mode)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
        filter === mode
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white border-gray-200'
      }`}
    >
      {mode}
    </button>
  ))}

  <button
    onClick={fetchReviews}
    className="px-4 py-2 rounded-lg border bg-white text-sm"
  >
    Refresh
  </button>
</div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center">Loading…</p>
        ) : displayedReviews.length ? (
          <div className="space-y-6">
            {displayedReviews.map(r => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-xl border"
              >
                <h3 className="font-bold">
                  {r.userName || 'Anonymous'}
                </h3>

                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {r.comment}
                </p>
{r.status === 'published' && r.publishedAt?.seconds && (
  <p className="text-xs text-gray-500 mt-1">
    Published on{' '}
    {new Date(r.publishedAt.seconds * 1000).toLocaleDateString()}
  </p>
)}


                <div className="mt-4 flex gap-3 flex-wrap">
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        r.id,
                        r.status === 'published'
                          ? 'pending'
                          : 'published'
                      )
                    }
                    className="px-4 py-2 rounded-lg border text-sm"
                  >
                    {r.status === 'published'
                      ? 'Unpublish'
                      : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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