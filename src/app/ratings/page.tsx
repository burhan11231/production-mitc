import { Suspense } from 'react';  
import ReviewsClient from './ReviewsClient';  
  
export const metadata = {  
  title: 'Customer Reviews | MITC Srinagar',  
  description:  
    'Verified customer reviews for MITC Srinagar. Read real feedback from customers who purchased or serviced laptops at our showroom.',  
};  
  
type PageProps = {  
  searchParams?: Promise<{  
    page?: string;  
    rating?: string;  
  }>;  
};  
  
export default async function ReviewsPage({ searchParams }: PageProps) {  
  const params = (await searchParams) || {};  
  
  const page =  
    params.page && Number(params.page) > 0 ? Number(params.page) : 1;  
  
  const rating =  
    params.rating && Number(params.rating) >= 1 && Number(params.rating) <= 5  
      ? Number(params.rating)  
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