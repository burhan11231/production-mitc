'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
  QueryConstraint,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { FaStar, FaPen } from 'react-icons/fa';
import { MdMessage, MdClose } from 'react-icons/md';

import PublicReviewGate from '@/components/PublicReviewGate';
import AggregateRatingSchema from './AggregateRatingSchema';
import ReviewSchema from './ReviewSchema';

// 1️⃣ Import the new StarRating component
// Adjust path if you placed it elsewhere, e.g. '@/components/StarRating'
import StarRatings from '@/components/StarRatings'; 

/* ---------------- TYPES ---------------- */

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  status: 'published' | 'pending';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any; 
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
const PAGE_WINDOW = 2;

/* ---------------- COMPONENT ---------------- */

export default function ReviewsClient({
  initialPage,
  initialRating,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);

  // Loading States
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Pagination State
  const [hasNextPage, setHasNextPage] = useState(false);

  /* ---------------- FETCH STATS ---------------- */

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const snap = await getDoc(doc(db, 'reviewStats', 'global'));
      if (snap.exists()) {
        setStats(snap.data() as ReviewStats);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  /* ---------------- FETCH REVIEWS ---------------- */

  const fetchReviews = async () => {
    setLoadingReviews(true);

    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(PER_PAGE + 1),
      ];

      if (initialRating) {
        constraints.unshift(where('rating', '==', initialRating));
      }

      if (initialPage > 1 && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, 'reviews'), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs;

      const hasMore = docs.length > PER_PAGE;
      setHasNextPage(hasMore);

      const pageItems = hasMore ? docs.slice(0, PER_PAGE) : docs;

      setReviews(
        pageItems.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Review, 'id'>),
        }))
      );

      setLastDoc(pageItems[pageItems.length - 1] || null);
    } catch (error) {
      console.error("Query Error:", error);
      if (reviews.length > 0) toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    fetchStats();
    fetchMyReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialPage === 1) setLastDoc(null);
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, initialRating]);


  /* ---------------- ACTIONS ---------------- */

  const updateURL = (newPage: number, newRating: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRating) params.set('rating', String(newRating));
    else params.delete('rating');
    if (newPage > 1) params.set('page', String(newPage));
    else params.delete('page');
    router.push(`/ratings?${params.toString()}`);
  };

  const goToPage = (p: number) => updateURL(p, initialRating);
  const filterByStar = (star: number) => updateURL(1, star);
  const clearFilter = () => router.push('/ratings');

  /* ---------------- CALCULATIONS (MERGED LIST) ---------------- */

  // 1. Calculate Pagination
  const totalPages = useMemo(() => {
    if (!stats || initialRating) return -1;
    return Math.ceil(stats.totalReviews / PER_PAGE);
  }, [stats, initialRating]);

  const pageNumbers = useMemo(() => {
    if (totalPages === -1) return [];
    return Array.from(
      { length: PAGE_WINDOW * 2 + 1 },
      (_, i) => initialPage - PAGE_WINDOW + i
    ).filter((p) => p > 0 && p <= totalPages);
  }, [initialPage, totalPages]);

  // 2. Merge My Review + General Reviews (No Duplicates)
  const displayedReviews = useMemo(() => {
    // A. Filter out my own review from the fetched list (to prevent duplicates)
    const otherReviews = reviews.filter((r) => r.id !== user?.uid);

    // B. If on Page 1, Prepend my review to the top
    if (initialPage === 1 && myReview) {
      // Respect the rating filter if active
      if (!initialRating || myReview.rating === initialRating) {
        return [myReview, ...otherReviews];
      }
    }

    return otherReviews;
  }, [reviews, myReview, initialPage, initialRating, user]);


  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">

      {/* SEO Schema */}
      {stats && initialPage === 1 && !initialRating && (
        <>
          <AggregateRatingSchema
            avg={stats.averageRating}
            total={stats.totalReviews}
          />
          <ReviewSchema reviews={reviews} />
        </>
      )}

      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            Customer <span className="text-blue-600">Reviews</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            Verified feedback from MITC customers
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 grid lg:grid-cols-12 gap-8">

        {/* LEFT SIDEBAR (Stats) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 md:p-8">

            {/* STATS SECTION */}
            {loadingStats ? (
              <div className="animate-pulse space-y-4 mb-8">
                <div className="h-16 bg-gray-100 rounded-xl w-3/4 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
                <div className="space-y-2 pt-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
                </div>
              </div>
            ) : stats ? (
              <>
                <div className="text-center mb-8">
                  <div className="text-5xl md:text-6xl font-black text-gray-900">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  
                  {/* 2️⃣ REPLACED: Fractional Star Rendering for Header */}
                  <div className="flex justify-center my-3">
                    <StarRatings rating={stats.averageRating || 0} size={20} />
                  </div>
                  
                  <p className="text-gray-400 text-sm font-medium">
                    Based on {stats.totalReviews} reviews
                  </p>
                </div>

                <div className="space-y-2 mb-8">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.starCounts?.[String(star)] || 0;
                    const percent = stats.totalReviews > 0
                      ? Math.round((count / stats.totalReviews) * 100)
                      : 0;

                    return (
                      <button
                        key={star}
                        onClick={() => filterByStar(star)}
                        className="w-full flex items-center gap-3 text-sm group"
                      >
                        <span className="w-4 font-bold text-gray-700">{star}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              initialRating === star ? 'bg-blue-600' : 'bg-yellow-400 group-hover:bg-yellow-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-gray-400 text-xs">
                          {percent}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center mb-6">
                 <p className="text-gray-500">Average Rating</p>
                 <div className="text-4xl font-bold text-gray-300 mt-1">--</div>
              </div>
            )}

            {!myReview && (
              <PublicReviewGate myReview={null} onWrite={() => {}} />
            )}

          </div>
        </aside>

        {/* RIGHT CONTENT (Review List) */}
        <section className="lg:col-span-8 space-y-6">

          {/* ACTIVE FILTER BANNER */}
          {initialRating && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <FaStar className="text-yellow-500" />
                <span>Showing {initialRating}-star reviews</span>
              </div>
              <button 
                onClick={clearFilter}
                className="flex items-center gap-1.5 text-xs md:text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
              >
                <MdClose size={16} /> Clear Filter
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loadingReviews ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-gray-400 text-sm">Loading reviews...</p>
            </div>
          ) : displayedReviews.length > 0 ? (
            <>
              {/* LIST */}
              <div className="grid gap-4">
                {displayedReviews.map((r) => {
                  const isMyReview = r.id === user?.uid;

                  return (
                    <article 
                      key={r.id} 
                      className={`rounded-3xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
                        isMyReview ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                              {isMyReview ? 'Your Review' : (r.userName || 'Verified Customer')}
                            </h4>

                            {isMyReview && r.status === 'pending' && (
                              <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          {r.createdAt && (
                            // @ts-ignore
                            r.createdAt?.toDate?.() ?? new Date(r.createdAt)
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 3️⃣ REPLACED: Fractional Star Rendering for Review Items */}
                      <div className="mb-3">
                         <StarRating rating={r.rating} size={14} />
                      </div>

                      <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                        {r.comment}
                      </p>

                      {isMyReview && (
                        <div className="mt-4 pt-4 border-t border-blue-100">
                          <Link 
                            href="/profile" 
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <FaPen size={12} /> Edit Review on Profile
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {(initialPage > 1 || hasNextPage) && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <button
                    onClick={() => goToPage(initialPage - 1)}
                    disabled={initialPage <= 1}
                    className="px-4 py-2 rounded-xl border bg-white font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${
                        p === initialPage
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white border hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(initialPage + 1)}
                    disabled={!hasNextPage}
                    className="px-4 py-2 rounded-xl border bg-white font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            // EMPTY STATE
            <div className="bg-white p-12 rounded-3xl border text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdMessage size={24} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">No reviews found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {initialRating 
                  ? `There are no ${initialRating}-star reviews yet.`
                  : "Be the first to share your experience!"}
              </p>
              {initialRating && (
                <button 
                  onClick={clearFilter}
                  className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
                >
                  View all reviews
                </button>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}