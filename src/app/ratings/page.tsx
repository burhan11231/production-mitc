import { Suspense } from 'react';
import ReviewsClient from './ReviewsClient';

export const metadata = {
  title: 'Customer Reviews | MITC Srinagar',
  description:
    'Verified customer reviews for MITC Srinagar. Read real feedback from customers who purchased or serviced laptops at our showroom.',
};

export default function ReviewsPage({
  searchParams,
}: {
  searchParams: { page?: string; rating?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const rating =
    searchParams.rating && Number(searchParams.rating) >= 1
      ? Number(searchParams.rating)
      : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <ReviewsClient initialPage={page} initialRating={rating} />
    </Suspense>
  );
}