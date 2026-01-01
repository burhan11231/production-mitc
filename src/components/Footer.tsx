'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { useMemo, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Premium Filled Star with Glow
const FilledStar = ({ size = 'w-12 h-12 lg:w-14 lg:h-14' }) => (
  <svg
    className={`${size} text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Half Star (for precision)
const HalfStar = ({ size = 'w-12 h-12 lg:w-14 lg:h-14' }) => (
  <svg className={size} fill="currentColor" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="half-gradient">
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#e5e7eb" />
      </linearGradient>
    </defs>
    <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Empty Star
const EmptyStar = ({ size = 'w-12 h-12 lg:w-14 lg:h-14' }) => (
  <svg className={`${size} text-gray-200`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Dynamic Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.4;

  return (
    <div className="flex items-center justify-center gap-2">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) return <FilledStar key={i} />;
        if (i === fullStars && hasHalf) return <HalfStar key={i} />;
        return <EmptyStar key={i} />;
      })}
    </div>
  );
};

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [ratingStats, setRatingStats] = useState({ avg: 4.9, count: 128 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const reviews = querySnapshot.docs.map((doc) => doc.data());

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, curr: any) => acc + (curr.rating || 0), 0);
          const avg = Math.round((sum / reviews.length) * 10) / 10;

          setRatingStats({ avg, count: reviews.length });
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <footer className="relative mt-20 bg-white/80 backdrop-blur-2xl border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        {/* Top Section: Location + Premium Ratings Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20">
          {/* Location */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0071e3]/5 border border-[#0071e3]/20 mx-auto lg:mx-0">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0071e3] animate-pulse shadow-lg shadow-[#0071e3]/40" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">
                Flagship Store • Open Daily
              </span>
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Gaw Kadal, Maisuma
              </h2>
              <p className="mt-3 text-lg font-medium text-gray-500">Srinagar, Jammu & Kashmir — 190001</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a
                href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-base hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl"
              >
                Get Directions <span className="text-xl">→</span>
              </a>
              
            </div>
          </div>

         {/* PROFESSIONAL RATINGS CARD */}
<div className="flex justify-center lg:justify-end">
  <div className="relative max-w-md w-full rounded-3xl bg-white border border-gray-200 shadow-[0_20px_40px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(15,23,42,0.12)]">

    {/* Subtle top accent */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0071e3]/40 to-transparent" />

    <div className="relative text-center space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-5 w-40 mx-auto bg-gray-200 rounded animate-pulse" />
          <div className="h-12 w-24 mx-auto bg-gray-200 rounded animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stars */}
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(ratingStats.avg)
                    ? 'text-amber-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-5xl font-bold tracking-tight text-gray-900">
              {ratingStats.avg}
            </span>
            <span className="text-base font-medium text-gray-500">
              out of 5
            </span>
          </div>

          {/* Reviews count */}
          <p className="text-sm text-gray-500">
            Based on <span className="font-semibold text-gray-700">{ratingStats.count}</span> verified reviews
          </p>

          {/* CTA */}
          <Link
            href="/ratings"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0071e3] hover:underline"
          >
            Read customer reviews →
          </Link>
        </>
      )}
    </div>
  </div>
</div>
        </div>

        {/* Middle Section: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 py-12 border-t border-gray-100">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-4 mb-8">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC Logo"
                width={48}
                height={48}
                className="rounded-xl grayscale hover:grayscale-0 transition-all duration-500 shadow-lg"
              />
              <span className="text-3xl font-bold tracking-tighter text-gray-900">MITC</span>
            </Link>
            <p className="text-base leading-relaxed text-gray-500 max-w-sm mx-auto md:mx-0">
              Kashmir's trusted authority for premium commercial laptops and professional IT services since 2013.
            </p>
          </div>

          {/* Company Links */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Company</h4>
            <ul className="space-y-5">
              {['About', 'Services', 'Ratings', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-base font-semibold text-gray-600 hover:text-[#0071e3] transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Connect */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Connect</h4>
            <div className="flex gap-5 justify-center md:justify-start">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href={settings?.[social.toLowerCase() as keyof typeof settings] as string || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0071e3]/5 hover:text-[#0071e3] hover:border-[#0071e3]/40 transition-all duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <span className="text-sm font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-sm font-medium text-gray-400">
            © {currentYear} Mateen IT Corp. All rights reserved.
          </p>
          <div className="flex gap-10">
            <Link href="#" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
