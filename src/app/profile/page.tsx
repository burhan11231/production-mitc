'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { compressImage, validateImageFile } from '@/lib/image-utils';

/* ---------------- TYPES ---------------- */

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: any;
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

    setProfile({
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      photoURL: '',
    });

    loadProfile();
    loadReview();
  }, [user]);

  const loadProfile = async () => {
    const snap = await getDoc(doc(db, 'users', user!.uid));
    if (snap.exists()) {
      const d = snap.data();
      setProfile((p) => ({
        ...p,
        name: d.name || '',
        phone: d.phone || '',
        photoURL: d.photoURL || '',
      }));
    }
  };

  /* ---------------- LOAD REVIEW (ONE PER USER) ---------------- */

  const loadReview = async () => {
    try {
      const snap = await getDoc(doc(db, 'reviews', user!.uid));
      if (snap.exists()) {
        const d = snap.data();
        setReview({
          id: snap.id,
          rating: d.rating,
          comment: d.comment,
          createdAt: d.createdAt,
        });
        setReviewForm({ rating: d.rating, comment: d.comment });
      }
    } finally {
      setLoadingReview(false);
    }
  };

  /* ---------------- PROFILE SAVE ---------------- */

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name: profile.name,
        phone: profile.phone,
        photoURL: profile.photoURL,
        updatedAt: new Date(),
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- PROFILE PIC (USING YOUR LIB) ---------------- */

  const handleAvatarChange = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast.error(error!);
      return;
    }

    try {
      const base64 = await compressImage(file, 700);
      setProfile((p) => ({ ...p, photoURL: base64 }));
      toast.success('Image ready. Save profile to apply.');
    } catch (err: any) {
      toast.error(err.message || 'Image processing failed');
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
        updatedAt: new Date(),
      });
      toast.success('Review updated');
      setEditingReview(false);
      loadReview();
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm('Delete your review?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'reviews', user!.uid));
      setReview(null);
      toast.success('Review deleted');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">

      {/* PROFILE */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={profile.photoURL || '/avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <label className="cursor-pointer text-sm font-semibold text-blue-600">
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
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
            disabled={saving}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* REVIEW */}
      <div className="bg-white rounded-3xl p-8 shadow">
        <h2 className="text-xl font-bold mb-6">My Review</h2>

        {loadingReview ? (
          <p>Loading…</p>
        ) : review ? (
          editingReview ? (
            <>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: i })
                    }
                    className={`text-3xl ${
                      i <= reviewForm.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="w-full border rounded-xl p-4 mb-4"
                rows={4}
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: e.target.value,
                  })
                }
              />

              <div className="flex gap-3">
                <button
                  onClick={saveReview}
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingReview(false)}
                  className="border px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i <= review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-gray-700 mb-6">{review.comment}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingReview(true)}
                  className="text-blue-600 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={deleteReview}
                  className="text-red-500 font-semibold"
                >
                  Delete
                </button>
              </div>
            </>
          )
        ) : (
          <p className="text-gray-500">
            You haven’t submitted a review yet.
          </p>
        )}
      </div>
    </div>
  );
}