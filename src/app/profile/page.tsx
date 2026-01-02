'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
      });
      fetchUserReview();
    }
  }, [user]);

  const fetchUserReview = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'reviews'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const reviewData = snap.docs[0].data();
        setUserReview({
          id: snap.docs[0].id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: reviewData.createdAt,
        });
        setReviewForm({ rating: reviewData.rating, comment: reviewData.comment });
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReview = async () => {
    if (!user?.uid || !userReview?.id) return;
    setIsSaving(true);
    try {
      const reviewRef = doc(db, 'reviews', userReview.id);
      await updateDoc(reviewRef, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        updatedAt: new Date(),
      });
      toast.success('Review updated successfully!');
      setIsEditingReview(false);
      fetchUserReview();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview?.id) return;
    if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) return;

    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'reviews', userReview.id));
      setUserReview(null);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf9f7] to-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] via-[#fefefe] to-[#f5f3f0]">
      {/* Header */}
      <div className="relative border-b border-gray-200/50 bg-white/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold shadow-xl shadow-gray-900/20">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-lg text-gray-600">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Information */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-gray-200/50 shadow-xl shadow-gray-900/5">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Account Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all duration-200 text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all duration-200 text-gray-900"
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-gray-500 mt-2">Required for contact and order notifications</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>

            {/* Review Section */}
            {reviewLoading ? (
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50 shadow-xl shadow-gray-900/5 flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : userReview ? (
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-gray-200/50 shadow-xl shadow-gray-900/5">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Your Review</h2>
                {isEditingReview ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-4xl transition-all hover:scale-110"
                          >
                            <span className={star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={5}
                        className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all duration-200 text-gray-900 resize-none"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveReview}
                        disabled={isSaving}
                        className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-gray-900/20"
                      >
                        {isSaving ? 'Saving...' : 'Save Review'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingReview(false);
                          setReviewForm({ rating: userReview.rating, comment: userReview.comment });
                        }}
                        className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl transition-all border border-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`text-3xl ${i <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">{userReview.comment}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditingReview(true)}
                        className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-gray-900/20"
                      >
                        Edit Review
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        disabled={isSaving}
                        className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl transition-all border border-red-200"
                      >
                        {isSaving ? 'Deleting...' : 'Delete Review'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 border border-gray-200/50 shadow-xl shadow-gray-900/5 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Share Your Experience</h2>
                <p className="text-gray-600 mb-4">You haven't submitted a review yet. Help others by sharing your experience with MITC.</p>
                <p className="text-sm text-gray-500">Contact admin to submit your review.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Account Status</h3>
              <div className="space-y-5">
                <div className="pb-5 border-b border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(user.metadata?.creationTime || '').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold">Account Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Keep your profile updated</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Make sure your phone number is current so we can contact you about orders and important updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
