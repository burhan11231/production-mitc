'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Plus, UserCircle } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';

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
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] });

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

      // Calculate Stats
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        const dist = [0, 0, 0, 0, 0];
        reviewsData.forEach(r => dist[r.rating - 1]++);
        setStats({ 
          avg: Math.round(avg * 10) / 10, 
          count: reviewsData.length,
          distribution: dist.reverse() // 5 stars to 1 star
        });
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Community <span className="text-blue-600">Feedback</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We value your experience. Join thousands of satisfied users who have shared their journey with us.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-gray-900 mb-2">{stats.avg}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={20} className={i <= Math.round(stats.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <div className="text-gray-500 font-medium">Based on {stats.count} reviews</div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                {stats.distribution.map((count, idx) => {
                  const starNum = 5 - idx;
                  const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
                  return (
                    <div key={starNum} className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-gray-600 w-12">{starNum} star</div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 w-8 text-right">{Math.round(percentage)}%</div>
                    </div>
                  );
                })}
              </div>

              {!showForm && (
                <button 
                  onClick={() => user ? setShowForm(true) : toast.error('Please login to review')}
                  className="w-full mt-8 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all"
                >
                  <Plus size={20} /> Write a Review
                </button>
              )}
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {showForm && (
              <ReviewForm 
                onSuccess={() => { setShowForm(false); fetchReviews(); }} 
                onCancel={() => setShowForm(false)} 
              />
            )}

            {!user && (
              <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <MessageSquare className="text-white" />
                  </div>
                  <p className="font-medium text-lg">Sign in to share your own experience!</p>
                </div>
                <Link href="/login" className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                  Get Started
                </Link>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{review.userName}</h4>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} size={14} className={i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-1">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-8">Be the first one to tell the world about us!</p>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Leave a Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
