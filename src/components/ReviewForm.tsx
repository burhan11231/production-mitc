'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

interface ReviewFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    if (comment.length < 10) return toast.error('Comment must be at least 10 characters');

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user?.uid,
        userName: user?.displayName || 'Anonymous User',
        userEmail: user?.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
      <p className="text-gray-500 mb-6">How was your experience with our services?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    (hover || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-semibold text-gray-700">Your Feedback</label>
            <span className="text-xs text-gray-400">{comment.length}/500</span>
          </div>
          <textarea
            required
            maxLength={500}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? How can we improve?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {isSubmitting ? 'Posting...' : 'Post Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
