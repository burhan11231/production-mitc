'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { useMemo } from 'react';

// --- Icons ---
const IconStar = ({ filled }: { filled: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-200'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Mock stats (Replace with real data from your hook)
  const ratingStats = { avg: 4.9, count: 128 };

  return (
    <footer className="relative mt-20 border-t border-black/5 bg-white/80 backdrop-blur-xl">
      
      {/* 1. TOP SECTION: LOCATION & RATINGS */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-b border-black/5 pb-16">
          
          {/* Location Branding */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Our Flagship Store</span>
            </div>
            
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                Gaw Kadal, Maisuma
              </h2>
              <p className="text-lg text-gray-500 font-medium mt-1">Srinagar, J&K — 190001</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7" target="_blank" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center gap-2">
                Get Directions <span>→</span>
              </a>
              <a href="tel:+918082754459" className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                Call Concierge
              </a>
            </div>
          </div>

          {/* Trust Badge / Ratings */}
          <div className="lg:ml-auto p-8 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => <IconStar key={s} filled={s <= Math.floor(ratingStats.avg)} />)}
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">{ratingStats.avg}</div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Average Customer Rating</p>
            
            <Link href="/ratings" className="group flex items-center gap-2 py-2 px-4 rounded-full bg-white border border-gray-200 hover:border-blue-200 transition">
              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">Based on {ratingStats.count} verified reviews</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: MAIN LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={32}
                height={32}
                className="rounded-lg grayscale hover:grayscale-0 transition-all"
              />
              <span className="text-lg font-bold tracking-tighter">MITC</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-[200px]">
              Premium laptop solutions and enterprise IT services since 2013.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Company</h4>
            <ul className="space-y-4">
              {['About', 'Services', 'Ratings', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href={`tel:${settings?.phone}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">Help Center</a></li>
              <li><Link href="/contact" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">Book a Repair</Link></li>
              <li><Link href="#" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">Track Order</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Connect</h4>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a 
                  key={social}
                  href={settings?.[social.toLowerCase() as keyof typeof settings] as string || '#'} 
                  className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition hover:border-blue-100"
                >
                   <span className="sr-only">{social}</span>
                   {/* Replace with actual social icons as needed */}
                   <div className="text-[10px] font-bold">{social[0]}</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SECTION: LEGAL */}
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[12px] font-medium text-gray-400">
            © {currentYear} Mateen IT Corp. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 transition">Privacy Policy</Link>
            <Link href="#" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
