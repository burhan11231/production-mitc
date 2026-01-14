'use client';

import { useEffect, useState } from 'react';
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
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { FaStar, FaFilter } from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';

import ReviewForm from '@/components/ReviewForm';
import PublicReviewGate from '@/components/PublicReviewGate';
import AggregateRatingSchema from './AggregateRatingSchema';
import ReviewSchema from './ReviewSchema';

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | Date | string | number | null;
}

interface Stats {
  totalReviews: number;
  averageRating: number;
  starCounts: Record<string, number>;
}

interface Props {
  initialPage: number;
  initialRating: number | null;
}

const PER_PAGE = 10;

export default function ReviewsClient({ initialPage, initialRating }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);

  /* ---------------- FETCH STATS (NO CLIENT MATH) ---------------- */

  const fetchStats = async () => {
    const snap = await getDoc(doc(db, 'reviewStats', 'global'));
    if (snap.exists()) setStats(snap.data() as Stats);
  };

  /* ---------------- FETCH REVIEWS (SERVER PAGINATION) ---------------- */

  const fetchReviews = async () => {
  setLoading(true);

  try {
    const baseRef = collection(db, 'reviews');

    const constraints: Parameters<typeof query>[1][] = [
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(PER_PAGE),
    ];

    if (initialRating) {
      constraints.unshift(where('rating', '==', initialRating));
    }

    if (initialPage > 1 && lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(baseRef, ...constraints);
    const snap = await getDocs(q);

    setReviews(
  snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Review, 'id'>),
  }))
);

    setLastDoc(snap.docs.at(-1) ?? null);
  } catch {
    toast.error('Failed to load reviews');
  } finally {
    setLoading(false);
  }
};

  const fetchMyReview = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, 'reviews', user.uid));
    if (snap.exists()) setMyReview({ id: snap.id, ...(snap.data() as any) });
  };

  useEffect(() => {
    fetchStats();
    fetchReviews();
    fetchMyReview();
  }, [initialPage, initialRating]);

  /* ---------------- NAVIGATION ---------------- */

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    if (initialRating) params.set('rating', String(initialRating));
    if (p > 1) params.set('page', String(p));
    router.push(`/ratings?${params.toString()}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gray-50/60 pb-24 px-safe">

      {/* SCHEMA ONLY ON PAGE 1 */}
      {stats && initialPage === 1 && (
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

        {/* LEFT – STATS */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl border p-8 sticky top-6">
            {stats && (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl font-black">
                    {stats.averageRating}
                  </div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1,2,3,4,5].map(i=>(
                      <FaStar key={i} className={i<=Math.round(stats.averageRating)?'text-yellow-400':'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-500">
                    {stats.totalReviews} reviews
                  </p>
                </div>
              </>
            )}

            <PublicReviewGate
              myReview={myReview}
              onWrite={() => {}}
            />
          </div>
        </aside>

        {/* RIGHT – LIST */}
        <section className="lg:col-span-8 space-y-6">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : reviews.length ? (
            <>
              <div className="grid gap-6">
                {reviews.map((r) => (
                  <article key={r.id} className="bg-white rounded-3xl border p-6">
                    <div className="flex justify-between">
                      <h4 className="font-bold">
                        {r.userName || 'Verified Customer'}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {new Date(
                          // @ts-ignore
                          r.createdAt?.toDate?.() ?? r.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 my-2">
                      {[1,2,3,4,5].map(i=>(
                        <FaStar key={i} size={14} className={i<=r.rating?'text-yellow-400':'text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-700">{r.comment}</p>
                  </article>
                ))}
              </div>

              {/* PAGINATION */}
              <div className="flex justify-center gap-2 pt-10">
                {initialPage > 1 && (
                  <button
                    onClick={() => goToPage(initialPage - 1)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    ⏮ Prev
                  </button>
                )}

                <span className="px-4 py-2 font-semibold">
                  Page {initialPage}
                </span>

                <button
                  onClick={() => goToPage(initialPage + 1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Next ⏭
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white p-16 rounded-3xl border text-center">
              <MdMessage size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-xl">No reviews found</h3>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}