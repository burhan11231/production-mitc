'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { useMemo, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Filled Star SVG ---
const FilledStar = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// --- Half/Empty Star (for precision) ---
const HalfStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#e5e7eb" />
      </linearGradient>
    </defs>
    <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const EmptyStar = () => (
  <svg className="w-5 h-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
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
        {/* Top Section: Location + Ratings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16 lg:mb-20">
          {/* Location */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 mx-auto lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-[#0071e3] animate-pulse shadow-lg shadow-[#0071e3]/30" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">
                Flagship Store
              </span>
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Gaw Kadal, Maisuma
              </h2>
              <p className="mt-2 text-lg font-medium text-gray-500">Srinagar, J&K — 190001</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                Get Directions <span className="text-lg">→</span>
              </a>
              <a
                href="tel:+918082754459"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-sm hover:border-[#0071e3] hover:text-[#0071e3] transition-all"
              >
                Call Us
              </a>
            </div>
          </div>

          {/* Ratings – Compact & Modern */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-gray-50/60 to-white border border-gray-100 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(0,113,227,0.08),transparent_60%)]" />
              <div className="relative z-10 text-center">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading reviews...</p>
                ) : (
                  <>
                    <StarRating rating={ratingStats.avg} />
                    <div className="mt-4 flex items-baseline justify-center gap-3">
                      <span className="text-4xl lg:text-5xl font-black text-gray-900">
                        {ratingStats.avg}
                      </span>
                      <span className="text-lg font-semibold text-gray-500">
                        ({ratingStats.count} reviews)
                      </span>
                    </div>
                    <Link
                      href="/ratings"
                      className="mt-6 inline-block text-sm font-bold text-[#0071e3] hover:underline"
                    >
                      View all reviews →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20 py-12 border-t border-gray-100">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-4 mb-6">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={40}
                height={40}
                className="rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
              />
              <span className="text-2xl font-bold tracking-tighter text-gray-900">MITC</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs mx-auto md:mx-0">
              Premium commercial laptops and precision IT services in Kashmir since 2013.
            </p>
          </div>

          {/* Company Links */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Company</h4>
            <ul className="space-y-4">
              {['About', 'Services', 'Ratings', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm font-semibold text-gray-600 hover:text-[#0071e3] transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Connect</h4>
            <div className="flex gap-4 justify-center md:justify-start">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href={settings?.[social.toLowerCase() as keyof typeof settings] as string || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0071e3]/5 hover:text-[#0071e3] hover:border-[#0071e3]/30 transition-all"
                >
                  <span className="sr-only">{social}</span>
                  <span className="text-xs font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-xs font-medium text-gray-400">
            © {currentYear} Mateen IT Corp. All rights reserved.
          </p>
          <div className="flex gap-8 flex-wrap justify-center">
            <Link href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
