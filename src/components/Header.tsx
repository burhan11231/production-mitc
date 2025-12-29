'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  /* ESC close */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  /* Touch handlers (HORIZONTAL ONLY) */
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    currentX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (startX.current === null || currentX.current === null) return;

    const deltaX = currentX.current - startX.current;

    // swipe LEFT to close
    if (deltaX < -70) {
      setOpen(false);
    }

    startX.current = null;
    currentX.current = null;
  };

  return (
    <>
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/10">
        <nav className="h-16 flex items-center justify-between px-4 max-w-[1440px] mx-auto">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
              <div className="leading-tight">
                <div className="text-sm font-bold">MITC</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500">
                  Mateen IT Corp
                </div>
              </div>
            </Link>
          </div>

          {/* RIGHT */}
          <div>
            {isLoading ? null : user ? (
              <Link
                href="/auth/logout"
                className="px-4 py-2 text-xs rounded-full bg-gray-900 text-white"
              >
                Logout
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs rounded-full bg-gray-900 text-white"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* LEFT DRAWER (REAL) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[80%] max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="p-6 flex flex-col gap-6 text-lg font-semibold">
          <button
            onClick={() => setOpen(false)}
            className="self-end text-gray-500"
          >
            ✕
          </button>

          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/ratings" onClick={() => setOpen(false)}>Ratings</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      </aside>
    </>
  );
}
