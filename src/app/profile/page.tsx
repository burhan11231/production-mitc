'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  sendPasswordResetEmail,
  reload,
  deleteUser,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import ReviewForm from '@/components/reviews/ReviewForm';

/* ---------------- TYPES ---------------- */

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published';
}

/* ---------------- COMPONENT ---------------- */

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  /* ---------------- STATE ---------------- */

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });

  const [review, setReview] = useState<UserReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [saving, setSaving] = useState(false);
  const originalProfile = useRef<any>(null);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    if (!user) return;

    const base = {
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      photoURL: '',
    };

    setProfile(base);
    originalProfile.current = base;

    loadProfile();
    loadReview();
  }, [user]);

  const loadProfile = async () => {
    const snap = await getDoc(doc(db, 'users', user!.uid));
    if (!snap.exists()) return;

    const d = snap.data();
    const merged = {
      name: d.name || '',
      phone: d.phone || '',
      photoURL: d.photoURL || '',
      email: user!.email!,
    };

    setProfile(merged);
    originalProfile.current = merged;
  };

  /* ---------------- LOAD REVIEW ---------------- */

  const loadReview = async () => {
    try {
      const snap = await getDoc(doc(db, 'reviews', user!.uid));
      if (snap.exists()) {
        const d = snap.data();
        setReview({
          id: snap.id,
          rating: d.rating,
          comment: d.comment,
          status: d.status || 'pending',
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
    return (
      JSON.stringify(profile) !== JSON.stringify(originalProfile.current)
    );
  }, [profile]);

  /* ---------------- PROFILE COMPLETION ---------------- */

  const completion = useMemo(() => {
    let total = 3;
    let done = 0;
    if (profile.photoURL) done++;
    if (profile.phone) done++;
    if (review) done++;
    return Math.round((done / total) * 100);
  }, [profile, review]);

  /* ---------------- SAVE PROFILE ---------------- */

  const saveProfile = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name: profile.name,
        phone: profile.phone,
        photoURL: profile.photoURL,
        updatedAt: serverTimestamp(),
      });

      /* Sync into review */
      if (review) {
        await updateDoc(doc(db, 'reviews', user!.uid), {
          userName: profile.name,
          userPhoto: profile.photoURL,
        });
      }

      originalProfile.current = profile;
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
      setProfile(originalProfile.current);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- AVATAR ---------------- */

  const handleAvatarChange = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) return toast.error(error!);

    try {
      const base64 = await compressImage(file, 700);
      setProfile((p) => ({ ...p, photoURL: base64 }));
    } catch {
      toast.error('Image processing failed');
    }
  };

  /* ---------------- ACCOUNT TOOLS ---------------- */

  const sendReset = async () => {
    if (!user?.email) return;
    await sendPasswordResetEmail(auth, user.email);
    toast.success('Password reset email sent');
  };

  const reverify = async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    toast.success('Account reverified');
  };

  if (isLoading || !user) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
      {/* PROFILE */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow space-y-8">
        <h2 className="text-2xl font-bold">Profile</h2>

        {/* Completion */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Profile completion</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded">
            <div
              className="h-2 bg-green-500 rounded"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <img
            src={profile.photoURL || '/avatar.png'}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <label className="cursor-pointer text-blue-600 font-semibold">
            Change Photo
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleAvatarChange(e.target.files[0])
              }
            />
          </label>
        </div>

        <input
          className="w-full border rounded-xl px-4 py-3"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
          placeholder="Full name"
        />

        <input
          disabled
          className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          value={profile.email}
        />

        <input
          className="w-full border rounded-xl px-4 py-3"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
          placeholder="Phone"
        />

        <button
          onClick={saveProfile}
          disabled={saving || !hasUnsavedChanges}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          Save Profile
        </button>
      </div>

      {/* REVIEW */}
      <div className="bg-white rounded-3xl p-8 shadow space-y-6">
        <h2 className="text-xl font-bold">My Review</h2>

        {loadingReview ? (
          <p className="text-gray-500">Loading…</p>
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
          <>
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full ${
                review.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {review.status === 'published'
                ? 'Published'
                : 'Pending approval'}
            </span>

            <p className="text-gray-700 mt-4">{review.comment}</p>

            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-4 text-blue-600 font-semibold"
            >
              Edit Review
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500">
              You haven’t submitted a review yet.
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-blue-600 font-semibold"
            >
              Write a Review
            </button>
          </>
        )}
      </div>
    </div>
  );
}