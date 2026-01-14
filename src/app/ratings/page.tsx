import { Suspense } from 'react';  
import ReviewsClient from './ReviewsClient';  

export const metadata = {  
  title: 'Customer Reviews | MITC Srinagar',  
  description: 'Verified customer reviews for MITC Srinagar.',  
};  

export default function ReviewsPage() {  
  return (  
    <Suspense fallback={<div>Loading reviews...</div>}>  
      <ReviewsClient />  
    </Suspense>  
  );  
}
