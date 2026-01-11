'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { 
  deleteUser, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  reauthenticateWithPopup 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import { 
  ShieldCheck, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Copy
} from 'lucide-react';

/* ---------------- TYPES ---------------- */

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoURL: string;
}

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published'; 
  published: boolean; 
  createdAt: any;
}

/* ---------------- COMPONENT ---------------- */

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  // Review State
  const [review, setReview] = useState<UserReview | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);

  // UI State
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  /* ---------------- CALCULATE COMPLETION ---------------- */
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (profile.photoURL) score += 30;
    if (profile.phone) score += 30;
    if (review) score += 40;
    return score;
  }, [profile.photoURL, profile.phone, review]);

  /* ---------------- UNSAVED CHANGES CHECK ---------------- */
  const isDirty = useMemo(() => {
    if (!originalProfile) return false;
    return (
      profile.name !== originalProfile.name ||
      profile.phone !== originalProfile.phone ||
      profile.photoURL !== originalProfile.photoURL
    );
  }, [profile, originalProfile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user) return;

    const initialData: UserProfile = {
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      photoURL: user.photoURL || '',
    };
    setProfile(initialData);

    const fetchData = async () => {
      // Load Profile
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const d = userSnap.data();
        const merged = { ...initialData, ...d };
        setProfile(merged);
        setOriginalProfile(merged);
      } else {
        setOriginalProfile(initialData);
      }

      // Load Review
      try {
        const reviewSnap = await getDoc(doc(db, 'reviews', user.uid));
        if (reviewSnap.exists()) {
          const d = reviewSnap.data();
          setReview({
            id: reviewSnap.id,
            rating: d.rating,
            comment: d.comment,
            status: d.status || 'published', 
            published: d.published ?? true, 
            createdAt: d.createdAt,
          });
          setReviewForm({ rating: d.rating, comment: d.comment });
        }
      } finally {
        setLoadingReview(false);
      }
    };

    fetchData();
  }, [user]);

  /* ---------------- CROSS-SYNC SAVE ---------------- */
  const saveProfile = async () => {
    if (!isDirty) return;
    setSaving(true);
    
    try {
      const batch = writeBatch(db); 
      
      // 1. Update User Profile
      const userRef = doc(db, 'users', user!.uid);
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        photoURL: profile.photoURL,
        updatedAt: new Date(),
      };
      
      batch.set(userRef, updateData, { merge: true });

      // 2. Sync to Review (if exists)
      if (review) {
        const reviewRef = doc(db, 'reviews', user!.uid);
        batch.update(reviewRef, {
          userName: profile.name, 
          userPhoto: profile.photoURL 
        });
      }

      await batch.commit(); 
      
      setOriginalProfile(profile); 
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- AVATAR HANDLER ---------------- */
  const handleAvatarChange = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) return toast.error(error!);

    try {
      const base64 = await compressImage(file, 700);
      setProfile((p) => ({ ...p, photoURL: base64 }));
      toast.success('Preview updated. Click Save Profile to apply.');
    } catch (err: any) {
      toast.error('Image processing failed');
    }
  };

  /* ---------------- REVIEW ACTIONS ---------------- */
  const saveReview = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      const reviewRef = doc(db, 'reviews', user!.uid);
      
      const reviewData = {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userId: user!.uid,
        userName: profile.name,
        userPhoto: profile.photoURL,
        status: 'pending',     
        published: false,      
        updatedAt: new Date(),
        createdAt: review ? review.createdAt : new Date(),
      };

      batch.set(reviewRef, reviewData);
      await batch.commit();

      toast.success('Review submitted for approval');
      setEditingReview(false);
      
      // Refresh local state
      const snap = await getDoc(reviewRef);
      if (snap.exists()) {
        const d = snap.data();
        setReview({
          id: snap.id,
          rating: d.rating,
          comment: d.comment,
          status: d.status,
          published: d.published,
          createdAt: d.createdAt
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm('Permanently delete your review?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'reviews', user!.uid));
      setReview(null);
      toast.success('Review deleted');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- ACCOUNT SECURITY ACTIONS ---------------- */
  
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent');
    } catch (e) {
      toast.error('Error sending reset email');
    }
  };

  // ✅ FIX 1: Non-recursive delete helper
  const performDelete = async (keepReview: boolean) => {
    // 1. Handle Review
    if (!keepReview && review) {
      await deleteDoc(doc(db, 'reviews', user!.uid));
    }

    // 2. Delete User Data
    await deleteDoc(doc(db, 'users', user!.uid));

    // 3. Delete Auth Account
    await deleteUser(user!);
  };

  const handleDeleteAccount = async (keepReview: boolean) => {
    setSaving(true);
    try {
      await performDelete(keepReview);
      toast.success('Account deleted');
      router.push('/');
    } catch (error: any) {
      // ✅ Handle Re-Auth without recursion
      if (error.code === 'auth/requires-recent-login') {
        const providerId = user?.providerData[0]?.providerId;
        
        if (providerId === 'google.com') {
          try {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(user!, provider);
            
            // Retry delete exactly once
            await performDelete(keepReview);
            
            toast.success('Account deleted');
            router.push('/');
          } catch (reauthErr) {
            console.error(reauthErr);
            toast.error('Re-authentication failed. Cannot delete account.');
          }
        } else {
          toast.error('Security update required: Please log out and log in again to delete your account.');
        }
      } else {
        console.error(error);
        toast.error('Failed to delete account. Contact support.');
      }
    } finally {
      setSaving(false);
      setDeleteModalOpen(false);
    }
  };

  if (isLoading || !user) return <div className="p-12 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      
      {/* FEATURE 7: Completion Indicator */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-lg font-bold text-gray-800">Profile Strength</h2>
          <span className="text-sm font-semibold text-blue-600">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 flex gap-4">
          <span className={profile.photoURL ? 'text-green-600' : ''}>• Photo</span>
          <span className={profile.phone ? 'text-green-600' : ''}>• Phone</span>
          <span className={review ? 'text-green-600' : ''}>• Review</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. EDIT PROFILE */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Basic Info
              {isDirty && <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Unsaved Changes</span>}
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <img
                  src={profile.photoURL || '/avatar-placeholder.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="absolute inset-0 bg-black/10 rounded-full group-hover:bg-black/20 transition-all" />
              </div>
              <div className="flex flex-col">
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200">
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files && handleAvatarChange(e.target.files[0])}
                  />
                </label>
                <span className="text-xs text-gray-400 mt-2">Recommended: 500x500px</span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={profile.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={saveProfile}
                  disabled={saving || !isDirty} 
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    isDirty 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                {isDirty && (
                  <button 
                    onClick={() => originalProfile && setProfile(originalProfile)}
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    Reset Changes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. SECURITY & METADATA */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
              Account Security
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Metadata */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div>
                  <label className="text-xs uppercase text-gray-400 font-bold">User ID</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 truncate max-w-[150px]">
                      {user.uid}
                    </code>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(user.uid); toast.success('UID Copied'); }}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-400 font-bold">Provider</label>
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {user.providerData[0]?.providerId.replace('.com', '') || 'Email'}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-400 font-bold">Member Since</label>
                  <p className="text-sm font-medium text-gray-700">
                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 justify-center">
                <button
                  onClick={handlePasswordReset}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  <RefreshCw size={16} /> Send Password Reset
                </button>
                
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full border border-red-100 text-red-600 py-3 rounded-xl hover:bg-red-50 font-medium text-sm transition-colors"
                >
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Review Management */}
        <div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">My Review</h2>
              {/* Status Badge */}
              {review && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  review.status === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {review.status === 'published' ? 'Published' : 'Pending Approval'}
                </span>
              )}
            </div>

            {loadingReview ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
              </div>
            ) : review ? (
              editingReview ? (
                // EDIT MODE
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex gap-2 mb-4 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                        className={`text-3xl transition-transform hover:scale-110 ${
                          i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-4 mb-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Write your experience..."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEditingReview(false)} className="border border-gray-200 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={saveReview} className="bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-black">
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`text-xl ${i <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                  
                  {review.status === 'pending' && (
                    <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={14} className="mt-0.5" />
                      Your review is waiting for admin approval. It is not visible to the public yet.
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex gap-4">
                    <button onClick={() => setEditingReview(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      Edit
                    </button>
                    <button onClick={deleteReview} className="text-sm font-semibold text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              )
            ) : (
              // EMPTY STATE
              <div className="text-center py-6">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">⭐</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">You haven't left a review yet.</p>
                <button 
                  onClick={() => { setEditingReview(true); setReviewForm({rating: 5, comment: ''}); }}
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-black w-full"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-red-600 mb-2">Delete Account?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. You will lose access to your profile.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleDeleteAccount(true)}
                className="w-full border border-gray-200 p-4 rounded-xl text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="block font-semibold text-gray-800">Delete Account Only</span>
                  <span className="text-xs text-gray-500">Keep my review visible to help others.</span>
                </div>
                <CheckCircle className="text-gray-300 group-hover:text-green-500" />
              </button>

              <button 
                onClick={() => handleDeleteAccount(false)}
                className="w-full border border-red-100 bg-red-50 p-4 rounded-xl text-left hover:bg-red-100 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="block font-semibold text-red-700">Delete Everything</span>
                  <span className="text-xs text-red-500">Remove account and my review.</span>
                </div>
                <Trash2 className="text-red-300 group-hover:text-red-600" />
              </button>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => setDeleteModalOpen(false)} className="text-gray-500 text-sm hover:text-gray-800 font-medium">
                Cancel, keep my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}