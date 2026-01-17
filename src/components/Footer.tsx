'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useSettingsRTDB } from '@/hooks/useSettingsRTDB';

const FALLBACK_LOGO =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg';

export default function Footer() {
  const { settings, loading } = useSettingsRTDB();

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  if (loading) return null;

  const logoSrc = settings?.logoUrl || FALLBACK_LOGO;

  const socials = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'Twitter / X' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube', label: 'YouTube' },
  ] as const;

  return (
    <footer className="relative bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-10">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 py-8">

          {/* Column 1 – Brand */}
          <div>
            <p className="text-base leading-relaxed text-gray-500 max-w-sm">
              Kashmir&apos;s trusted authority for premium commercial laptops and
              professional IT services since 2013.
            </p>

            <Link href="/" className="inline-block mt-6">
              <Image
                src={logoSrc}
                alt={settings?.businessName || 'Logo'}
                width={48}
                height={48}
                className="rounded-lg object-cover opacity-90"
                unoptimized
              />
            </Link>
          </div>

          {/* Column 2 – Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
              Company
            </h4>

            <ul className="space-y-5">
              {[
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Ratings', href: '/ratings' },
                { label: 'Contact', href: '/contact' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-base font-semibold text-gray-600 hover:text-blue-600 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Social */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
              Connect
            </h4>

            <div className="flex gap-4">
              {socials.map(({ key, label }) => {
                const url = settings?.[key];
                if (!url) return null;

                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                  >
                    <span className="sr-only">{label}</span>
                    <span className="text-sm font-bold">
                      {label[0]}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-sm font-medium text-gray-400">
            © {currentYear} {settings?.businessName || 'Mateen IT Corp'}. All rights reserved.
          </p>

          <div className="flex gap-10">
            <Link
              href="/privacy"
              className="text-sm font-bold text-gray-400 hover:text-gray-900 transition"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm font-bold text-gray-400 hover:text-gray-900 transition"
            >
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}