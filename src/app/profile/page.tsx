'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db, auth, storage } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  updateProfile,
  GoogleAuthProvider,
  linkWithPopup,
} from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import ReviewForm from '@/components/ReviewForm';

/* ---------------- TYPES ---------------- */

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published';
}

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  photoURL: string;
}

/* ---------------- MODALS ---------------- */

function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(password);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-auto">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            placeholder="Enter current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading || !password}
            >
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (options: { keepReview: boolean; deleteAll: boolean }) => void;
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [confirmText, setConfirmText] = useState('');
  const options = [
    'Delete account only',
    'Delete account + keep review',
    'Delete account + delete ALL data (profile + review)',
  ];

  if (!isOpen) return null;

  const isValid = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-auto">
        <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
        <p className="text-gray-700 mb-6">
          This action cannot be undone. Choose what to delete:
        </p>
        
        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deleteOption"
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDelete({
              keepReview: selectedOption === 1,
              deleteAll: selectedOption === 2,
            })}
            disabled={!isValid}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            DELETE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  /* ---------------- STATE ---------------- */

  const [profile, setProfile] = useState<ProfileState>({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });

  const [review, setReview] = useState<UserReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [nameCooldownEnd, setNameCooldownEnd] = useState<Date | null>(null);

  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [passwordConfirmAction, setPasswordConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const originalProfile = useRef<ProfileState | null>(null);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!user) return;

    const base = {
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      photoURL: user.photoURL || '',
    };

    setProfile(base);
    originalProfile.current = { ...base };

    loadProfile();
    loadReview();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        const merged = {
          name: data.name || user.displayName || '',
          phone: data.phone || '',
          photoURL: data.photoURL || user.photoURL || '',
          email: user.email!,
        };

        setProfile(merged);
        originalProfile.current = { ...merged };

        // Check name cooldown
        if (data.lastNameChange) {
          const cooldownEnd = new Date(data.lastNameChange.toDate());
          cooldownEnd.setDate(cooldownEnd.getDate() + 14);
          
          if (cooldownEnd > new Date()) {
            setNameCooldownEnd(cooldownEnd);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadReview = async () => {
    if (!user) return;
    
    try {
      const snap = await getDoc(doc(db, 'reviews', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setReview({
          id: snap.id,
          rating: data.rating,
          comment: data.comment,
          status: data.status || 'pending',
        });
      } else {
        setReview(null);
      }
    } finally {
      setLoadingReview(false);
    }
  };

  /* ---------------- UNSAVED CHANGES ---------------- */

  const hasUnsavedChanges = useMemo(() => {
    const original = originalProfile.current;
    if (!original) return false;

    return (
      profile.name !== original.name ||
      profile.phone !== original.phone ||
      profile.photoURL !== original.photoURL
    );
  }, [profile]);

  // REPLACED REACT-USE WITH NATIVE HOOK
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  /* ---------------- PROFILE COMPLETION ---------------- */

  const completion = useMemo(() => {
    let score = 0;
    if (profile.photoURL && profile.photoURL.startsWith('http')) score++;
    if (profile.name.trim()) score++;
    if (profile.phone.trim()) score++;
    return Math.round((score / 3) * 100);
  }, [profile]);

  /* ---------------- NAME COOLDOWN ---------------- */

  const daysUntilNameChange = useMemo(() => {
    if (!nameCooldownEnd) return 0;
    const now = new Date();
    const diffTime = nameCooldownEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [nameCooldownEnd]);

  const canChangeName = daysUntilNameChange <= 0;

  /* ---------------- SAVE PROFILE ---------------- */

  const saveProfile = async () => {
    if (!user || !hasUnsavedChanges) return;

    // Check name cooldown
    if (profile.name !== originalProfile.current?.name && !canChangeName) {
      toast.error(`Name change available in ${daysUntilNameChange} days`);
      return;
    }

    setSaving(true);
    
    try {
      // Upload photo if changed
      let photoURL = profile.photoURL;
      if (profile.photoURL && profile.photoURL !== originalProfile.current?.photoURL) {
        const storageRef = ref(storage, `profile/${user.uid}/photo.jpg`);
        await uploadString(storageRef, profile.photoURL, 'data_url');
        photoURL = await getDownloadURL(storageRef);
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: profile.name,
        phone: profile.phone,
        photoURL,
        updatedAt: serverTimestamp(),
        ...(profile.name !== originalProfile.current?.name && {
          lastNameChange: serverTimestamp(),
        }),
      });

      // Update auth profile
      await updateProfile(user, { displayName: profile.name, photoURL });

      // Sync to review if exists
      if (review) {
        await updateDoc(doc(db, 'reviews', user.uid), {
          userName: profile.name,
          userPhoto: photoURL,
        });
      }

      originalProfile.current = { ...profile, photoURL };
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      loadProfile(); // Revert
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- AVATAR ---------------- */

  const handleAvatarChange = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) return toast.error(error!);

    toast.loading('Processing image...', { id: 'image' });
    try {
      const base64 = await compressImage(file, 700);
      setProfile((p) => ({ ...p, photoURL: base64 }));
      toast.success('Image ready to save', { id: 'image' });
    } catch {
      toast.error('Image processing failed', { id: 'image' });
    }
  };

  /* ---------------- PASSWORD CONFIRM ---------------- */

  const confirmPasswordAction = useCallback(async (password: string) => {
    if (!auth.currentUser || !user?.email) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      setPasswordConfirmOpen(false);
      if (passwordConfirmAction) {
        await passwordConfirmAction();
      }
    } catch (error: any) {
      toast.error('Incorrect password');
    }
  }, [user, passwordConfirmAction]);

  const requirePasswordConfirm = useCallback((action: () => Promise<void>) => {
    setPasswordConfirmAction(() => action);
    setPasswordConfirmOpen(true);
  }, []);

  /* ---------------- GOOGLE LINKING (Fixed auth.currentUser check) ---------------- */

  const connectGoogle = async () => {
    if (
      !auth.currentUser ||
      auth.currentUser.providerData.some(p => p.providerId === 'google.com')
    ) {
      toast.info('Google account already connected');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      toast.success('Google account connected successfully');
    } catch (error: any) {
      const code = error.code;
      
      if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups and try again');
      } else if (code === 'auth/popup-closed-by-user') {
        toast.info('Google connection cancelled');
      } else {
        toast.error(error.message || 'Failed to connect Google account');
      }
    }
  };

  /* ---------------- ACCOUNT ACTIONS ---------------- */

  const sendResetEmail = async () => {
    if (!user?.email) return;
    await sendPasswordResetEmail(auth, user.email);
    toast.success('Password reset email sent');
  };

  const handleDeleteAccount = async (options: { keepReview: boolean; deleteAll: boolean }) => {
    if (!auth.currentUser || !user) return;

    const deleteAction = async () => {
      try {
        // Delete Firestore data FIRST
        if (options.deleteAll || !options.keepReview) {
          await deleteDoc(doc(db, 'reviews', user.uid)).catch(() => {});
        }
        
        if (options.deleteAll) {
          await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});
        }
        
        // Delete auth user LAST
        await deleteUser(auth.currentUser);
        toast.success('Account deleted');
        router.push('/login');
      } catch (error: any) {
        toast.error('Failed to delete account: ' + error.message);
      }
    };

    requirePasswordConfirm(deleteAction);
    setDeleteModalOpen(false);
  };

  const hasGoogleProvider = user?.providerData.some(p => p.providerId === 'google.com');

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* PROFILE SECTION */}
            <div className="lg:col-span-2">
              {loadingProfile ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-white/50 animate-pulse">
                  <div className="h-10 w-48 bg-gray-200 rounded-xl mb-8"></div>
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                    <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gray-200 rounded-3xl"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-12 w-4/5 bg-gray-200 rounded-xl"></div>
                      <div className="h-12 w-3/5 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-14 w-full bg-gray-200 rounded-2xl"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-14 w-full bg-gray-200 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-white/50">
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Profile
                    </h1>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <span>{completion}% complete</span>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE COMPLETION */}
                  <div className="md:hidden mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-800">Profile completion</span>
                      <span className="text-2xl font-bold text-emerald-600">{completion}%</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* AVATAR */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                      <div className="relative">
                        <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-2 ring-gray-100/50">
                          <img
                            src={profile.photoURL || '/avatar.png'}
                            alt="Profile photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 font-semibold text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Change
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleAvatarChange(e.target.files[0])}
                          />
                        </label>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <input
                          className="w-full text-2xl lg:text-3xl font-bold bg-transparent border-none focus:ring-0 p-0 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!canChangeName}
                          placeholder="Enter your full name"
                        />
                        {!canChangeName && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm font-medium text-amber-800 mb-1">
                              Name change available in {daysUntilNameChange} days
                            </p>
                            <p className="text-xs text-amber-600">
                              Last changed {nameCooldownEnd ? nameCooldownEnd.toLocaleDateString() : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          disabled
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-lg font-medium disabled:cursor-not-allowed"
                          value={profile.email}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                        <input
                          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                    </div>

                    <button
                      onClick={saveProfile}
                      disabled={saving || !hasUnsavedChanges}
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </button>

                    {hasUnsavedChanges && (
                      <div className="text-center py-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">
                          Unsaved changes detected ↗️ Leaving this page will discard them
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* REVIEW SECTION */}
            <div className="space-y-6 lg:space-y-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-white/50">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Review
                </h2>

                {loadingReview ? (
                  <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-7 h-7 bg-gray-200 rounded-full"></div>
                      ))}
                    </div>
                    <div className="h-20 w-4/5 bg-gray-200 rounded-xl"></div>
                  </div>
                ) : showReviewForm ? (
                  <ReviewForm
                    existingReview={review}
                    onCancel={() => setShowReviewForm(false)}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      loadReview();
                    }}
                  />
                ) : review ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                        review.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {review.status === 'published' ? '✅ Published' : '⏳ Pending Approval'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-7 h-7 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                            <path d="M12 .587l3.668 7.568 8.332 1.151-6 5.694 1.416 8.246L12 18.272l-7.416 4.38 1.416-8.246-6-5.694 8.332-1.151z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-lg leading-relaxed text-gray-700">{review.comment}</p>
                    </div>

                    {review.status === 'published' && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Edit Review
                      </button>
                    )}
                    
                    {review.status !== 'published' && (
                      <div className="p-6 bg-gray-50 rounded-2xl text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          You can edit your review after admin approval
                        </p>
                        <p className="text-xs text-gray-500">Status: {review.status}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-4">
                      No review yet
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Write a Review
                    </button>
                  </div>
                )}
              </div>

              {/* AUTH & ACCOUNT SECTION */}
              <div className="bg-gradient-to-br from-rose-50 to-red-50/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-rose-200/50">
                <h3 className="text-xl font-bold mb-6 text-rose-900">Account Settings</h3>
                
                <div className="space-y-4 mb-8">
                  {hasGoogleProvider ? (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Connected Accounts</p>
                        <p className="text-sm text-gray-600">Sign in with Email or Google</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white/50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700 mb-2">Connect Google Account</p>
                      <p className="text-xs text-gray-500 mb-4">Link Google for easier sign-in</p>
                      <button 
                        onClick={connectGoogle}
                        className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        </svg>
                        Connect Google
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={sendResetEmail}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.5h3m1.5-3l3 3L21 9.5" />
                    </svg>
                    Reset Password (Email Link)
                  </button>

                  <button
                    onClick={() => requirePasswordConfirm(async () => {
                      toast.success('Use the email link above or contact support for password change');
                    })}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 border border-rose-500/50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasswordConfirmModal
        isOpen={passwordConfirmOpen}
        onClose={() => {
          setPasswordConfirmOpen(false);
          setPasswordConfirmAction(null);
        }}
        onConfirm={confirmPasswordAction}
        title="Confirm your identity"
      />

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </>
  );
}