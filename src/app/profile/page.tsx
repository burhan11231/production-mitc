'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db, storage } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import toast from 'react-hot-toast';

import { compressImage, validateImageFile } from '@/lib/image-utils';

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.displayName || '',
      email: user.email || '',
      phone: (user as any).phone || '',
      photoURL: user.photoURL || '',
    });

    fetchUserReview();
  }, [user]);

  /* ---------------- PROFILE PIC UPLOAD ---------------- */
  const handlePhotoChange = async (file: File) => {
    if (!user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingPhoto(true);

    try {
      const compressed = await compressImage(file, 700);
      const imageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);

      await uploadString(imageRef, compressed, 'data_url');
      const url = await getDownloadURL(imageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url,
        updatedAt: new Date(),
      });

      // Update Auth profile
      await refreshUser({ photoURL: url });

      setFormData((p) => ({ ...p, photoURL: url }));
      toast.success('Profile picture updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ---------------- FETCH REVIEW ---------------- */
  const fetchUserReview = async () => {
    if (!user?.uid) return;

    setReviewLoading(true);
    try {
      const snap = await getDoc(doc(db, 'reviews', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserReview({
          id: snap.id,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt,
        });
        setReviewForm({ rating: data.rating, comment: data.comment });
      } else {
        setUserReview(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date(),
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- DELETE REVIEW ---------------- */
  const handleDeleteReview = async () => {
    if (!user?.uid) return;
    if (!confirm('Delete your review permanently?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', user.uid));
      setUserReview(null);
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-8 shadow border flex items-center gap-6">
          <div className="relative">
            <img
              src={formData.photoURL || '/avatar-placeholder.png'}
              className="h-24 w-24 rounded-full object-cover border"
              alt="Profile"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 bg-black text-white text-xs px-3 py-1 rounded-full"
            >
              {uploadingPhoto ? 'Uploading…' : 'Edit'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && handlePhotoChange(e.target.files[0])
              }
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">{formData.name || 'My Profile'}</h1>
            <p className="text-gray-500">{formData.email}</p>
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="bg-white rounded-3xl p-8 shadow border space-y-5">
          <input
            className="input"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input className="input bg-gray-100" disabled value={formData.email} />

          <input
            className="input"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <button onClick={handleSaveProfile} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* REVIEW */}
        <div className="bg-white rounded-3xl p-8 shadow border">
          <h2 className="text-xl font-bold mb-4">Your Review</h2>

          {reviewLoading ? (
            <div className="h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : userReview ? (
            <>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-2xl ${
                      s <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="mb-4">{userReview.comment}</p>
              <button onClick={handleDeleteReview} className="btn-danger">
                Delete Review
              </button>
            </>
          ) : (
            <p className="text-gray-500">No review submitted yet.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .btn-primary {
          background: #111827;
          color: white;
          padding: 12px 20px;
          border-radius: 9999px;
          font-weight: 600;
        }
        .btn-danger {
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px 18px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}