'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { compressImage, validateImageFile } from '@/lib/image-utils';

/* ---------------- TYPES ---------------- */

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  published?: boolean;
}

/* ---------------- COMPONENT ---------------- */

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });

  const [originalProfile, setOriginalProfile] = useState(profile);

  const [review, setReview] = useState<UserReview | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    if (!user) return;
    loadProfile();
    loadReview();
  }, [user]);

  const loadProfile = async () => {
    const snap = await getDoc(doc(db, 'users', user!.uid));
    if (!snap.exists()) return;

    const d = snap.data();
    const p = {
      name: d.name || '',
      email: user!.email || '',
      phone: d.phone || '',
      photoURL: d.photoURL || '',
    };

    setProfile(p);
    setOriginalProfile(p);
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
          published: d.published,
        });
        setReviewForm({ rating: d.rating, comment: d.comment });
      }
    } finally {
      setLoadingReview(false);
    }
  };

  /* ---------------- UNSAVED CHANGES ---------------- */

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(originalProfile),
    [profile, originalProfile]
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  /* ---------------- PROFILE SAVE (WITH CROSS-SYNC) ---------------- */

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name: profile.name,
        phone: profile.phone,
        photoURL: profile.photoURL,
        updatedAt: serverTimestamp(),
      });

      // 🔁 Cross-sync name into review (feature #15)
      if (review) {
        await updateDoc(doc(db, 'reviews', user!.uid), {
          userName: profile.name,
        });
      }

      setOriginalProfile(profile);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- PROFILE PIC ---------------- */

  const handleAvatarChange = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) return toast.error(error!);

    try {
      const base64 = await compressImage(file, 700);
      setProfile((p) => ({ ...p, photoURL: base64 }));
      toast.success('Image ready. Save to apply.');
    } catch (e: any) {
      toast.error(e.message || 'Image failed');
    }
  };

  /* ---------------- REVIEW UPDATE ---------------- */

  const saveReview = async () => {
    if (!review) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'reviews', user!.uid), {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        updatedAt: serverTimestamp(),
        published: false, // reset approval
      });

      toast.success('Review updated (pending approval)');
      setEditingReview(false);
      loadReview();
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm('Delete your review permanently?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'reviews', user!.uid));
      setReview(null);
      toast.success('Review deleted');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- ACCOUNT DELETE ---------------- */

  const deleteAccount = async () => {
    if (!confirm('Delete your account permanently?')) return;
    try {
      await deleteDoc(doc(db, 'users', user!.uid));
      await deleteDoc(doc(db, 'reviews', user!.uid)).catch(() => {});
      await user!.delete();
      toast.success('Account deleted');
      router.push('/');
    } catch {
      toast.error('Re-authentication required');
    }
  };

  if (isLoading || !user) return null;

  /* ---------------- PROFILE COMPLETION ---------------- */

  const completion =
    (profile.name ? 25 : 0) +
    (profile.phone ? 25 : 0) +
    (profile.photoURL ? 25 : 0) +
    (review ? 25 : 0);

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">

      {/* PROFILE */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-2">Profile</h2>
        <p className="text-sm text-gray-500 mb-6">
          Profile completion: {completion}%
        </p>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={profile.photoURL || '/avatar.png'}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <label className="cursor-pointer text-blue-600 font-semibold text-sm">
            Change photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleAvatarChange(e.target.files[0])
              }
            />
          </label>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-3"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone"
          />

          <button
            disabled={!hasUnsavedChanges || saving}
            onClick={saveProfile}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Save profile
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-6">

        {/* REVIEW */}
        <div className="bg-white rounded-3xl p-8 shadow">
          <h3 className="text-xl font-bold mb-4">My Review</h3>

          {review && (
            <span className={`text-xs font-bold ${
              review.published ? 'text-green-600' : 'text-orange-500'
            }`}>
              {review.published ? 'Published' : 'Pending approval'}
            </span>
          )}

          {loadingReview ? (
            <p>Loading…</p>
          ) : review ? (
            editingReview ? (
              <>
                <textarea
                  className="w-full border rounded-xl p-4 my-4"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                />
                <button onClick={saveReview} className="text-blue-600 font-semibold">
                  Save review
                </button>
              </>
            ) : (
              <>
                <p className="my-4">{review.comment}</p>
                <button
                  onClick={() => setEditingReview(true)}
                  className="text-blue-600 font-semibold mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={deleteReview}
                  className="text-red-500 font-semibold"
                >
                  Delete
                </button>
              </>
            )
          ) : (
            <p className="text-gray-500">No review submitted.</p>
          )}
        </div>

        {/* ACCOUNT */}
        <div className="bg-white rounded-3xl p-8 shadow">
          <h3 className="text-lg font-bold mb-4">Account</h3>
          <p className="text-sm text-gray-500">UID: {user.uid}</p>
          <p className="text-sm text-gray-500">
            Provider: {user.providerData[0]?.providerId}
          </p>

          <button
            onClick={deleteAccount}
            className="mt-6 text-red-600 font-semibold"
          >
            Delete account
          </button>
        </div>

      </div>
    </div>
  );
}