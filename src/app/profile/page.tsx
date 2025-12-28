'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
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
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      if (userReview?.id) {
        // Update existing review
        const reviewRef = doc(db, 'reviews', userReview.id);
        await updateDoc(reviewRef, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          updatedAt: new Date(),
        });
        toast.success('Review updated successfully!');
      } else {
        // This would be handled on Firestore side in a real app
        toast.error('Unable to submit new review. Please contact admin.');
      }
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
    if (!confirm('Are you sure you want to delete your review?')) return;

    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'reviews', userReview.id));
      setUserReview(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Optional but required for orders"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.metadata?.creationTime || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-green-600 font-medium">✓ Account Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-8">
          {reviewLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : userReview ? (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Review</h2>
              {isEditingReview ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={5}
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveReview}
                      disabled={isSaving}
                      className="btn-primary"
                    >
                      {isSaving ? 'Saving...' : 'Save Review'}
                    </button>
                    <button
                      onClick={() => setIsEditingReview(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`text-2xl ${i <= userReview.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">{userReview.comment}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsEditingReview(true)}
                      className="btn-outline"
                    >
                      Edit Review
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      disabled={isSaving}
                      className="btn-outline text-red-600"
                    >
                      Delete Review
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Experience</h2>
              <p className="text-gray-600 mb-6">You haven't submitted a review yet. Help others by sharing your experience with MITC.</p>
              <p className="text-sm text-gray-500 mb-4">Contact admin to submit your review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
