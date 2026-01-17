// src/components/Footer.tsx
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

  const logoSrc = settings.logoUrl || FALLBACK_LOGO;

  // ✅ Build socials dynamically (NO DEFAULTS)
  const socials = [
    settings.instagram && { key: 'instagram', label: 'Instagram', url: settings.instagram },
    settings.facebook && { key: 'facebook', label: 'Facebook', url: settings.facebook },
    settings.twitter && { key: 'twitter', label: 'Twitter', url: settings.twitter },
    settings.linkedin && { key: 'linkedin', label: 'LinkedIn', url: settings.linkedin },
    settings.youtube && { key: 'youtube', label: 'YouTube', url: settings.youtube },
  ].filter(Boolean) as { key: string; label: string; url: string }[];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

          {/* Brand */}
          <div>
            <p className="text-gray-500 max-w-sm">
              Kashmir&apos;s trusted authority for premium commercial laptops and
              professional IT services since 2013.
            </p>

            <Link href="/" className="inline-block mt-6">
              <Image
                src={logoSrc}
                alt={settings.businessName || 'Logo'}
                width={48}
                height={48}
                className="rounded-lg"
                unoptimized
              />
            </Link>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {['About', 'Services', 'Ratings', 'Contact'].map(item => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-600 font-semibold hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Social – render ONLY if admin added something */}
          {socials.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-6">
                Connect
              </h4>

              <div className="flex gap-3">
                {socials.map(({ key, label, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl border flex items-center justify-center
                               text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <span className="sr-only">{label}</span>
                    <span className="text-sm font-bold">{label[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row gap-4 justify-between">
          <p className="text-sm text-gray-400">
            © {currentYear} {settings.businessName}. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm font-semibold text-gray-400 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm font-semibold text-gray-400 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}