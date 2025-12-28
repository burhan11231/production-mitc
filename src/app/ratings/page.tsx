'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function RatingsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const reviewsData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      setReviews(reviewsData);

      // Calculate average
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Customer Reviews</h1>
          <div className="flex justify-center items-center gap-4">
            <div className="text-5xl font-bold text-yellow-500">{averageRating}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`text-3xl ${i <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
            <div className="text-lg text-gray-600">({reviews.length} reviews)</div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CTA for users without review */}
        {user && (
          <div className="card p-8 mb-12 bg-gradient-to-r from-blue-50 to-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Have you used our services?</h3>
                <p className="text-gray-600">Share your experience and help others make informed decisions.</p>
              </div>
              <Link href="/profile" className="btn-primary flex-shrink-0">
                Add Your Review
              </Link>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {!user && (
          <div className="card p-8 mb-12 bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-gray-700 mb-4">Sign in to share your experience with MITC</p>
              <Link href="/login" className="btn-primary">
                Sign In to Review
              </Link>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`text-lg ${i <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-gray-600 mb-4">No reviews yet. Be the first to share your experience!</p>
            {user ? (
              <Link href="/profile" className="btn-primary">
                Add First Review
              </Link>
            ) : (
              <Link href="/login" className="btn-primary">
                Sign In to Review
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
