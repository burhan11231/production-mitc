'use client';

import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  existingReview?: ExistingReview | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- INIT EDIT MODE ---------------- */
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        /* ✏️ UPDATE REVIEW */
        await updateDoc(doc(db, 'reviews', user.uid), {
          rating,
          comment,
          updatedAt: serverTimestamp(),
        });

        toast.success('Review updated');
      } else {
        /* ✍️ CREATE REVIEW (docId = uid) */
        await setDoc(doc(db, 'reviews', user.uid), {
          userId: user.uid,
          userName: user.displayName || 'User',
          rating,
          comment,
          published: false,
          createdAt: serverTimestamp(),
        });

        toast.success('Review submitted');
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      <p className="text-gray-500 mb-6">
        Share your experience with our services.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RATING */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <FaStar
                  size={30}
                  className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* COMMENT */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Your Feedback
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : existingReview
              ? 'Update Review'
              : 'Post Review'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}