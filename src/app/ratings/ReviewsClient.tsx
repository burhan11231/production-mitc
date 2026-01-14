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
import { FaStar, FaTimes } from 'react-icons/fa'; // Added FaTimes for clearing filters
import { MdMessage } from 'react-icons/md';

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
const PAGE_WINDOW = 3;

// Fallback to prevent UI crash if stats doc is missing
const DEFAULT_STATS: ReviewStats = {
  totalReviews: 0,
  averageRating: 0,
  starCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
};

/* ---------------- HELPER ---------------- */

const formatDate = (dateValue: any) => {
  if (!dateValue) return '';
  try {
    // Handle Firestore Timestamp
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    // Handle JS Date or String
    return new Date(dateValue).toLocaleDateString();
  } catch (e) {
    return '';
  }
};

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  // Store all loaded docs to allow "Previous" button to work without re-fetching
  // (Optional optimization: you can keep it simple, but this helps stability)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  
  const [hasNext, setHasNext] = useState(false);
  const [stats, setStats] = useState<ReviewStats>(DEFAULT_STATS);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- SAFETY CHECK ---------------- */

  // If user refreshes on page 2, we lose 'lastDoc'. 
  // Firestore needs 'lastDoc' for cursor pagination. 
  // We must reset to page 1 to ensure data consistency.
  useEffect(() => {
    if (initialPage > 1 && !lastDoc) {
       // Keep the rating param if it exists, but reset page
       const params = new URLSearchParams();
       if (initialRating) params.set('rating', String(initialRating));
       router.replace(`/ratings${params.toString() ? `?${params}` : ''}`);
    }
  }, [initialPage, lastDoc, initialRating, router]);

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = async () => {
    try {
      const snap = await getDoc(doc(db, 'reviewStats', 'global'));
      if (snap.exists()) {
        setStats(snap.data() as ReviewStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default stats so UI doesn't break
    }
  };

  /* ---------------- FETCH REVIEWS ---------------- */

  const fetchReviews = async () => {
    // If we are on page > 1 but don't have a cursor, stop here (Safety Check effect will handle redirect)
    if (initialPage > 1 && !lastDoc) return;

    setLoading(true);

    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(PER_PAGE + 1), // Fetch 1 extra to check 'hasNext'
      ];

      if (initialRating) {
        // NOTE: This requires a Composite Index in Firestore
        // (status ASC, rating ASC, createdAt DESC)
        // Check your browser console for a link to create it if this fails!
        constraints.unshift(where('rating', '==', initialRating));
      }

      if (initialPage > 1 && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, 'reviews'), ...constraints);
      const snap = await getDocs(q);

      const docs = snap.docs;
      const hasMore = docs.length > PER_PAGE;
      const pageItems = hasMore ? docs.slice(0, PER_PAGE) : docs;

      setReviews(
        pageItems.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Review, 'id'>),
        }))
      );

      setHasNext(hasMore);
      // Update lastDoc to the actual last item of the *current* page
      if (pageItems.length > 0) {
        setLastDoc(pageItems[pageItems.length - 1]);
      }
    } catch (error) {
      console.error("Review Fetch Error:", error);
      toast.error('Failed to load reviews. Check console for index errors.');
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
    fetchReviews();
    fetchMyReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, initialRating, user?.uid]); 

  /* ---------------- NAVIGATE ---------------- */

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (initialRating) params.set('rating', String(initialRating));
    if (page > 1) params.set('page', String(page));
    router.push(`/ratings${params.toString() ? `?${params}` : ''}`);
  };

  const clearFilters = () => {
    router.push('/ratings');
  };

  /* ---------------- UI HELPERS ---------------- */
  
  // Calculate bars based on stats
  const renderBars = () => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = stats.starCounts?.[String(star)] || 0;
      const total = stats.totalReviews || 1; // avoid divide by zero
      const percent = Math.round((count / total) * 100);

      return (
        <div key={star} className="flex items-center gap-3 text-sm">
           {/* Click bar to filter by that rating */}
          <button 
            onClick={() => router.push(`/ratings?rating=${star}`)}
            className="w-4 font-semibold hover:text-blue-600 transition-colors"
          >
            {star}
          </button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="w-8 text-right text-gray-500">
            {percent}%
          </span>
        </div>
      );
    });
  };

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">
      
      {initialPage === 1 && (
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
        
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl border p-8 sticky top-6">
            
            <div className="text-center mb-6">
              <div className="text-6xl font-black">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FaStar
                    key={i}
                    className={
                      i <= Math.round(stats.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-200'
                    }
                  />
                ))}
              </div>
              <p className="text-gray-500">
                {stats.totalReviews} reviews
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {renderBars()}
            </div>

            <PublicReviewGate myReview={myReview} onWrite={() => {}} />
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Active Filter Display */}
          {initialRating && (
            <div className="flex items-center justify-between bg-blue-50 text-blue-900 px-4 py-3 rounded-xl border border-blue-100">
              <span className="font-medium">Showing only {initialRating}-star reviews</span>
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm font-bold hover:underline"
              >
                <FaTimes /> Clear Filter
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
                      <h4 className="font-bold">
                        {r.userName || 'Verified Customer'}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>

                    <div className="flex gap-1 my-2">
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

                    <p className="text-gray-700 whitespace-pre-wrap">{r.comment}</p>
                  </article>
                ))}
              </div>

              {/* PAGINATION - Only show if we actually need it */}
              {(hasNext || initialPage > 1) && (
                <div className="flex justify-center items-center gap-2 pt-10 text-sm font-semibold">
                  
                  <button
                    onClick={() => goToPage(initialPage - 1)}
                    disabled={initialPage <= 1}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="px-4 text-gray-500">
                    Page {initialPage}
                  </div>

                  <button
                    onClick={() => goToPage(initialPage + 1)}
                    disabled={!hasNext}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                 <p className="text-gray-500 mt-2">Try clearing the star filter.</p>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
