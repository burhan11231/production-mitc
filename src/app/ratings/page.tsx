import { Suspense } from 'react';
import ReviewsClient from './ReviewsClient';

export const metadata = {
  title: 'Customer Reviews | MITC Srinagar',
  description:
    'Verified customer reviews for MITC Srinagar. Read real feedback from customers who purchased or serviced laptops at our showroom.',
};

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <ReviewsClient />
    </Suspense>
  );
}