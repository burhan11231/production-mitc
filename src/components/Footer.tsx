'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { useMemo } from 'react';

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="relative bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-16">
        
        {/* Middle Section: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 py-12">
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
                    className="text-base font-semibold text-gray-600 hover:text-blue-600 transition"
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
            <div className="flex gap-4 justify-center md:justify-start">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href={settings?.[social.toLowerCase() as keyof typeof settings] as string || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300"
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
