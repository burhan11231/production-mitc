'use client';        
        
import { useState, useEffect } from 'react';        
import Link from 'next/link';        
import {        
  collection,        
  getDocs,        
  query,        
  where,        
  orderBy,        
} from 'firebase/firestore';        
import { db } from '@/lib/firebase';        
        
const StarIcon = ({ filled }: { filled: boolean }) => (        
  <svg        
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}        
    fill="currentColor"        
    viewBox="0 0 20 20"        
  >        
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />        
  </svg>        
);        
        
export default function TopFooter() {        
  const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });        
  const [isLoading, setIsLoading] = useState(true);        
        
  useEffect(() => {        
    const fetchRatings = async () => {        
      try {        
        const q = query(        
          collection(db, 'reviews'),        
          where('published', '==', true),        
          orderBy('createdAt', 'desc')        
        );        
        
        const snap = await getDocs(q);        
        
        const reviews = snap.docs.map((d) => d.data());        
        const count = reviews.length;        
        
        if (count > 0) {        
          const sum = reviews.reduce(        
            (acc, r: any) => acc + (Number(r.rating) || 0),        
            0        
          );        
          const avg = Math.round((sum / count) * 10) / 10;        
        
          setRatingStats({ avg, count });        
        } else {        
          setRatingStats({ avg: 0, count: 0 });        
        }        
      } catch (err) {        
        console.error('Error fetching ratings:', err);        
      } finally {        
        setIsLoading(false);        
      }        
    };        
        
    fetchRatings();        
  }, []);        
        
  return (        
    <section className="w-full bg-white border-b border-gray-100">        
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-10">        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">        
        
          {/* Location */}        
          <div className="space-y-2">        
        
            <h2 className="text-2xl font-bold text-gray-900">Gaw Kadal, Maisuma</h2>        
            <p className="text-sm text-gray-500">Srinagar, J&K — 190001</p>        
            <a        
              href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"        
              target="_blank"        
              rel="noopener noreferrer"        
              className="inline-block text-sm font-semibold text-gray-900 hover:underline pt-1"        
            >        
              Get Directions →        
            </a>        
          </div>        
        
          {/* Ratings */}        
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 min-w-[240px]">        
            {isLoading ? (        
              <div className="animate-pulse space-y-2">        
                <div className="h-4 w-32 bg-gray-200 rounded" />        
                <div className="h-3 w-24 bg-gray-200 rounded" />        
              </div>        
            ) : (        
              <div className="space-y-1">        
                <div className="flex items-center gap-2">        
                  <div className="flex">        
                    {[1, 2, 3, 4, 5].map((star) => (        
                      <StarIcon        
                        key={star}        
                        filled={star <= Math.round(ratingStats.avg)}        
                      />        
                    ))}        
                  </div>        
                  <span className="text-sm font-bold text-gray-900">        
                    {ratingStats.avg}        
                    <span className="text-gray-400 font-medium">        
                      {' '}({ratingStats.count})        
                    </span>        
<Link        
                    href="/ratings"        
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"        
                  >        
                    Read customer reviews →        
                  </Link>        
                  </span>        
                </div>        
        
        
        
              </div>        
            )}        
          </div>        
        
        </div>        
      </div>        
    </section>        
  );        
}