'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

import RecalculateStats from '@/components/admin/RecalculateStats';

type FilterMode = 'all' | 'published' | 'pending';
type SortMode = 'newest' | 'oldest';

interface Review {
  id: string;
  userName?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published';
  createdAt?: any;
}

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('newest');

  /* ---------------- ADMIN GUARD ---------------- */

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  /* ---------------- FETCH ---------------- */

  const fetchReviews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [user?.role, sort]);

  /* ---------------- ACTIONS ---------------- */

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Delete this review?')) return;

    try {
      const token = await user.getIdToken();
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((r) => r.filter((x) => x.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async (
    id: string,
    nextStatus: 'pending' | 'published'
  ) => {
    if (!user) return;

    // optimistic
    setReviews((r) =>
      r.map((x) => (x.id === id ? { ...x, status: nextStatus } : x))
    );

    try {
      const token = await user.getIdToken();
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
      fetchReviews();
    }
  };

  /* ---------------- FILTER ---------------- */

  const displayedReviews = useMemo(() => {
    if (filter === 'published') return reviews.filter(r => r.status === 'published');
    if (filter === 'pending') return reviews.filter(r => r.status === 'pending');
    return reviews;
  }, [reviews, filter]);

  if (isLoading || user?.role !== 'admin') return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/dashboard" className="text-sm text-blue-600">
            ← Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            {(['all', 'published', 'pending'] as FilterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  filter === m
                    ? 'bg-gray-900 text-white'
                    : 'bg-white'
                }`}
              >
                {m}
              </button>
            ))}

            <button onClick={fetchReviews} className="px-4 py-2 border rounded-lg">
              Refresh
            </button>

            <div className="ml-auto">
              <RecalculateStats />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center">Loading…</p>
        ) : (
          <div className="space-y-6">
            {displayedReviews.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-xl border">
                <h3 className="font-bold">{r.userName || 'Anonymous'}</h3>
                <p className="text-sm text-gray-600">{r.comment}</p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        r.id,
                        r.status === 'published' ? 'pending' : 'published'
                      )
                    }
                    className="px-4 py-2 border rounded-lg"
                  >
                    {r.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}