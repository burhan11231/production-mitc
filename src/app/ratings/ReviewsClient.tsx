'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  startAfter,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  status: 'published' | 'pending';
  createdAt?: any;
}

const PER_PAGE = 10;

export default function ReviewsClient() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ratingParam = searchParams.get('rating');
  const initialRating = ratingParam && !isNaN(Number(ratingParam)) && Number(ratingParam) >= 1 && Number(ratingParam) <= 5 
    ? Number(ratingParam) 
    : null;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);

  /** 🔥 PERFECTED fetchReviews - Clean deps + functional updates */
  const fetchReviews = useCallback(async (append = false, ratingFilter: number | null = null) => {
    setLoading(!append);
    if (append) setLoadingNext(true);

    try {
      let constraints = [
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
      ];

      if (ratingFilter) {
        constraints = [where('rating', '==', ratingFilter), ...constraints];
      }

      let q;
      if (!append || !lastDoc) {
        q = query(collection(db, 'reviews'), ...constraints, limit(PER_PAGE + 1));
      } else {
        q = query(collection(db, 'reviews'), ...constraints, startAfter(lastDoc), limit(PER_PAGE + 1));
      }

      const snap = await getDocs(q);
      const docs = snap.docs;
      const pageItems = docs.slice(0, PER_PAGE).map(d => ({
        id: d.id,
        ...(d.data() as Omit<Review, 'id'>)
      }));

      setReviews(prevReviews => 
        append 
          ? [...prevReviews, ...pageItems]
          : pageItems
      );
      
      setHasNext(docs.length > PER_PAGE);
      setLastDoc(pageItems.at(-1) ?? null);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  }, [lastDoc]); // ✅ PERFECT - only cursor dependency

  const fetchStats = async () => {
    try {
      const snap = await getDoc(doc(db, 'reviewStats', 'global'));
      if (snap.exists()) setStats(snap.data());
    } catch {}
  };

  const fetchMyReview = async () => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, 'reviews', user.uid));
      if (snap.exists()) {
        setMyReview({ id: snap.id, ...(snap.data() as any) });
      }
    } catch {}
  };

  /** 🔥 SINGLE SOURCE OF TRUTH */
  useEffect(() => {
    setReviews([]);
    setLastDoc(null);
    setHasNext(false);
    fetchReviews(false, initialRating);
  }, [initialRating, fetchReviews]);

  useEffect(() => {
    fetchStats();
    fetchMyReview();
  }, []);

  const updateFilter = (rating: number | null) => {
    const params = new URLSearchParams();
    if (rating) params.set('rating', rating.toString());
    router.push(`/ratings${params.toString() ? `?${params}` : ''}`);
  };

  const loadNext = () => {
    if (hasNext && !loadingNext) {
      fetchReviews(true, initialRating);
    }
  };

  const clearFilter = () => updateFilter(null);

  /** 🔥 BULLETPROOF DATE FORMATTING */
  const formatDate = (createdAt: any) => {
    if (!createdAt) return '';
    if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
      return createdAt.toDate().toLocaleDateString();
    }
    return new Date(createdAt as any).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">
      {/* ✅ TIGHTENED SCHEMA CONDITION */}
      {stats && !initialRating && reviews.length >= 1 && (
        <>
          <AggregateRatingSchema avg={stats.averageRating} total={stats.totalReviews} />
          <ReviewSchema reviews={reviews.slice(0, 5)} />
        </>
      )}

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-gray-600 mt-3">
            {initialRating ? `${initialRating}-star reviews` : 'Verified feedback'} from MITC customers
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 -mt-10 grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl border p-8 sticky top-6 space-y-6">
            {stats && (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl font-black">{stats.averageRating}</div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1,2,3,4,5].map(i => (
                      <FaStar key={i} className={i <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-500">{stats.totalReviews} total reviews</p>
                </div>

                <div className="space-y-2">
                  {[5,4,3,2,1].map((star) => {
                    const count = stats.starCounts[String(star)] || 0;
                    const percent = stats.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => updateFilter(star)}
                        className={`w-full flex items-center gap-3 text-sm p-2 rounded-xl hover:bg-blue-50 transition-all cursor-pointer ${
                          initialRating === star ? 'bg-blue-100 border-2 border-blue-400 ring-2 ring-blue-200' : ''
                        }`}
                      >
                        <span className="w-4 font-semibold">{star}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" 
                               style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-500 font-mono">{percent}%</span>
                        <span className="text-xs text-gray-400">({count})</span>
                      </button>
                    );
                  })}
                  {initialRating && (
                    <button
                      onClick={clearFilter}
                      className="w-full bg-blue-50 border-2 border-blue-200 text-blue-700 text-sm font-semibold py-3 px-4 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      ✨ Show All Reviews
                    </button>
                  )}
                </div>
              </>
            )}
            <PublicReviewGate myReview={myReview} onWrite={() => {}} />
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : reviews.length ? (
            <>
              <div className="grid gap-6">
                {reviews.map((r) => (
                  <article key={r.id} className="bg-white rounded-3xl border p-6 hover:shadow-xl transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-gray-900 pr-4 flex-1 min-w-0 truncate">
                        {r.userName || 'Verified Customer'}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-1 my-2">
                      {[1,2,3,4,5].map(i => (
                        <FaStar key={i} size={14} className={i <= r.rating ? 'text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                  </article>
                ))}
              </div>

              {hasNext && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-12 pb-8">
                  <button
                    onClick={loadNext}
                    disabled={loadingNext}
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
                  >
                    {loadingNext ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white inline-block mr-2" />
                        Loading more...
                      </>
                    ) : (
                      `Load More Reviews (+${PER_PAGE})`
                    )}
                  </button>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500 font-mono">
                      {reviews.length} of <span className="font-bold text-gray-900">{stats?.totalReviews || '∞'}</span> reviews loaded
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <MdMessage size={56} className="mx-auto text-gray-300 mb-6" />
              <h3 className="font-bold text-2xl text-gray-900 mb-2">No reviews match your filter</h3>
              {initialRating ? (
                <>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    There are no {initialRating}-star reviews yet. Try another rating or{' '}
                    <button onClick={clearFilter} className="text-blue-600 hover:underline font-semibold">
                      show all reviews
                    </button>
                    .
                  </p>
                </>
              ) : (
                <p className="text-gray-500 text-lg">Be the first to leave a review!</p>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
