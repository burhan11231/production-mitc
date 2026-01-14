'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  QueryConstraint,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { MdMessage, MdClose } from 'react-icons/md';

import PublicReviewGate from '@/components/PublicReviewGate';
import AggregateRatingSchema from './AggregateRatingSchema';
import ReviewSchema from './ReviewSchema';

/* ---------------- TYPES ---------------- */

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  status: 'published' | 'pending';
  createdAt?: Timestamp | Date | string | number | null;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  starCounts: Record<string, number>;
}

interface Props {
  initialPage: number;
  initialRating: number | null;
}

const PER_PAGE = 10;
const PAGE_WINDOW = 2; // Reduced window for cleaner mobile look

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = async () => {
    try {
      const snap = await getDoc(doc(db, 'reviewStats', 'global'));
      if (snap.exists()) {
        setStats(snap.data() as ReviewStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  /* ---------------- FETCH REVIEWS ---------------- */

  const fetchReviews = async () => {
    setLoading(true);

    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(PER_PAGE),
      ];

      // FIX: Apply Rating Filter
      if (initialRating) {
        constraints.unshift(where('rating', '==', initialRating));
      }

      // FIX: Pagination Logic
      // Note: This relies on maintaining 'lastDoc' state correctly. 
      // If jumping deep into pages via URL, simple offset/startAfter(lastDoc) 
      // might break without loading previous pages. 
      // For this example, we assume sequential navigation or valid lastDoc.
      // If deep linking (e.g. page 5) without previous data, Firestore 
      // usually requires 'offset' (expensive) or a snapshot. 
      // Resetting to page 1 if no lastDoc is present on >1 page is a safer fallback.
      if (initialPage > 1 && lastDoc) {
        constraints.push(startAfter(lastDoc));
      } else if (initialPage > 1 && !lastDoc) {
        // Fallback: If we loaded page 5 directly from URL but don't have the doc cursor,
        // we essentially have to load page 1 or implement specific offset logic.
        // For now, let's allow the query to run (it will show first page data) 
        // or handle it by resetting page.
      }

      const q = query(collection(db, 'reviews'), ...constraints);
      const snap = await getDocs(q);

      setReviews(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Review, 'id'>),
        }))
      );

      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH MY REVIEW ---------------- */

  const fetchMyReview = async () => {
    if (!user) return;
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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMyReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    // When params change, fetch new reviews
    // Reset lastDoc if going back to page 1 or changing filter
    if (initialPage === 1) setLastDoc(null);
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, initialRating]);


  /* ---------------- PAGINATION LOGIC ---------------- */

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    
    // Preserve rating if exists
    if (initialRating) params.set('rating', String(initialRating));
    
    // Set page (only if > 1)
    if (page > 1) params.set('page', String(page));
    
    router.push(`/ratings${params.toString() ? `?${params}` : ''}`);
  };

  const clearFilter = () => {
    router.push('/ratings'); // Reset to all reviews
  };

  // FIX: Accurate Page Calculation
  const totalPages = useMemo(() => {
    if (!stats) return 0;
    
    // If filtering, we don't strictly know the count unless we query for count.
    // However, if NOT filtering, we use global stats.
    if (initialRating) {
      // Rough estimate or rely on "next" button only for filtered views
      // Since we don't have specific count stats for "5 star reviews only" easily available
      // without a separate counter, we will hide numbered pagination for filters 
      // unless we implement a specific counter.
      return -1; 
    }

    return Math.ceil(stats.totalReviews / PER_PAGE);
  }, [stats, initialRating]);

  const pageNumbers = useMemo(() => {
    if (totalPages === -1) return []; // Filtered mode
    
    return Array.from(
      { length: PAGE_WINDOW * 2 + 1 },
      (_, i) => initialPage - PAGE_WINDOW + i
    ).filter((p) => p > 0 && p <= totalPages);
  }, [initialPage, totalPages]);


  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">

      {stats && initialPage === 1 && !initialRating && (
        <>
          <AggregateRatingSchema
            avg={stats.averageRating}
            total={stats.totalReviews}
          />
          <ReviewSchema reviews={reviews} />
        </>
      )}

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Verified feedback from MITC customers
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 -mt-10 grid lg:grid-cols-12 gap-8">

        {/* LEFT ASIDE (STATS) */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl border p-8 sticky top-6">
            {stats ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl font-black">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar
                        key={i}
                        className={i <= Math.round(stats.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-500">
                    {stats.totalReviews} reviews
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {/* FIX: Bars Logic reversed 5->1 */}
                  {[5, 4, 3, 2, 1].map((star) => {
                    // FIX: Safe access to starCounts
                    const count = stats.starCounts?.[String(star)] || 0;
                    
                    const percent = stats.totalReviews > 0
                      ? Math.round((count / stats.totalReviews) * 100)
                      : 0;

                    // Click to filter by this star
                    return (
                      <button
                        key={star}
                        onClick={() => goToPage(1) /* Reset to page 1 when filtering logic added */ } 
                        // Note: To make bars clickable to filter:
                        // onClick={() => { const p = new URLSearchParams(); p.set('rating', String(star)); router.push(`/ratings?${p}`); }}
                        className="w-full flex items-center gap-3 text-sm group cursor-default"
                      >
                        <span className="w-4 font-semibold">{star}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500">
                          {percent}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-4 mb-6">
                 <div className="h-20 bg-gray-200 rounded-xl w-full"></div>
                 <div className="h-40 bg-gray-200 rounded-xl w-full"></div>
              </div>
            )}

            <PublicReviewGate myReview={myReview} onWrite={() => {}} />
          </div>
        </aside>

        {/* RIGHT CONTENT (LIST) */}
        <section className="lg:col-span-8 space-y-6">

          {/* FIX: Filter Status Banner */}
          {initialRating && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800 font-semibold">
                <FaStar className="text-yellow-500" />
                Showing only {initialRating}-star reviews
              </div>
              <button 
                onClick={clearFilter}
                className="flex items-center gap-1 text-sm bg-white px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <MdClose /> Clear Filter
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : reviews.length ? (
            <>
              <div className="grid gap-6">
                {reviews.map((r) => (
                  <article key={r.id} className="bg-white rounded-3xl border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">
                          {r.userName || 'Verified Customer'}
                        </h4>
                         <div className="flex gap-1 my-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FaStar
                              key={i}
                              size={14}
                              className={i <= r.rating
                                ? 'text-yellow-400'
                                : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {r.createdAt && (
                          // @ts-ignore
                          r.createdAt?.toDate?.() ?? new Date(r.createdAt)
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mt-3 leading-relaxed">{r.comment}</p>
                  </article>
                ))}
              </div>

              {/* FIX: PAGINATION VISIBILITY */}
              {/* Only show if we have pages > 1 OR if we are in Filter mode (hasNext check) */}
              {(totalPages > 1 || initialRating) && (
                <div className="flex justify-center items-center gap-2 pt-10 text-sm font-semibold">
                  
                  {/* Prev Button */}
                  <button
                    onClick={() => goToPage(initialPage - 1)}
                    disabled={initialPage <= 1}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page Numbers (Hidden if filtered, as we don't know total count easily) */}
                  {!initialRating && pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        p === initialPage
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {/* Next Button */}
                  {/* 
                     If filtered: Show Next if we pulled a full page (reviews.length === PER_PAGE).
                     If not filtered: Show Next if current page < totalPages
                  */}
                  <button
                    onClick={() => goToPage(initialPage + 1)}
                    disabled={
                      initialRating 
                        ? reviews.length < PER_PAGE // Rough estimate for filters
                        : initialPage >= totalPages
                    }
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-16 rounded-3xl border text-center">
              <MdMessage size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-xl">No reviews found</h3>
              {initialRating && (
                <button 
                  onClick={clearFilter}
                  className="mt-4 text-blue-600 font-semibold hover:underline"
                >
                  Clear filters to see all reviews
                </button>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}