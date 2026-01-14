import { Suspense } from 'react';
import ReviewsClient from './ReviewsClient';

export const metadata = {
  title: 'Customer Reviews | MITC Srinagar',
  description:
    'Verified customer reviews for MITC Srinagar.',
};

type PageProps = {
  searchParams?: {
    rating?: string;
  };
};

export default function ReviewsPage({ searchParams }: PageProps) {
  const rating =
    searchParams?.rating &&
    Number(searchParams.rating) >= 1 &&
    Number(searchParams.rating) <= 5
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
      <ReviewsClient initialRating={rating} />
    </Suspense>
  );
}