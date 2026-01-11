'use client';

import { useEffect, useMemo, useState } from 'react';
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

/* ---------------- TYPES ---------------- */

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

/* ---------------- COMPONENT ---------------- */

export default function ReviewForm({
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- INIT (EDIT MODE) ---------------- */

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  /* ---------------- CHANGE DETECTION ---------------- */

  const hasChanges = useMemo(() => {
    if (!existingReview) return true;
    return (
      rating !== existingReview.rating ||
      comment.trim() !== existingReview.comment.trim()
    );
  }, [existingReview, rating, comment]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a valid rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    if (existingReview && !hasChanges) {
      toast.error("You didn't make any changes");
      return;
    }

    setIsSubmitting(true);

    try {
      const ref = doc(db, 'reviews', user.uid);

      if (existingReview) {
        /* ✏️ UPDATE → FORCE RE-APPROVAL */
        await updateDoc(ref, {
          rating,
          comment,
          status: 'pending',
          updatedAt: serverTimestamp(),

          // keep display data in sync
          userName: user.displayName || 'User',
        });

        toast.success('Review updated and sent for approval');
      } else {
        /* ✍️ CREATE (docId = uid) */
        await setDoc(ref, {
          userId: user.uid,
          userName: user.displayName || 'User',

          rating,
          comment,
          status: 'pending',

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast.success('Review submitted for approval');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <p className="text-gray-500 mb-6">
        {existingReview
          ? 'Editing will send your review for admin re-approval.'
          : 'Your review will be visible after admin approval.'}
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
                aria-label={`Rate ${star} stars`}
              >
                <FaStar
                  size={30}
                  className={
                    star <= rating ? 'text-yellow-400' : 'text-gray-200'
                  }
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

          <div className="text-xs text-gray-400 mt-1">
            {comment.length}/500 characters
          </div>
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
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}