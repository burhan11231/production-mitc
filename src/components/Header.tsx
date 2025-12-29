'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  /* ------------------------
     Lock body scroll
  ------------------------- */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  /* ------------------------
     Close on ESC
  ------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  /* ------------------------
     Swipe left to close
  ------------------------- */
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.touches[0].clientX;
    if (diff > 80) {
      setMenuOpen(false);
      touchStartX.current = null;
    }
  }

  return (
    <>
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/10">
        <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={44}
                height={44}
                className="rounded-xl object-cover shadow"
                priority
              />
              <div className="leading-tight">
                <div className="text-sm lg:text-xl font-bold text-gray-900">MITC</div>
                <div className="text-[9px] lg:text-[10px] uppercase tracking-[0.18em] font-bold text-gray-500">
                  Mateen IT Corp
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER (Desktop) */}
          <div className="hidden lg:flex gap-10 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/services" className="nav-link">Services</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/ratings" className="nav-link">Ratings</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            ) : user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/dashboard" className="hidden sm:inline text-sm font-semibold text-blue-600">
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/auth/logout"
                  className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* BACKDROP */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* LEFT DRAWER */}
      <aside
        ref={drawerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm z-50 bg-white shadow-2xl transform transition-transform duration-300 ease-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden`}
      >
        <div className="p-6 flex flex-col gap-6 text-lg font-semibold">
          <button
            onClick={() => setMenuOpen(false)}
            className="self-end text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            ✕
          </button>

          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/ratings" onClick={() => setMenuOpen(false)}>Ratings</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      </aside>

      {/* Desktop nav underline */}
      <style jsx>{`
        .nav-link {
          position: relative;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1d1d1f;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 1.5px;
          background: #0071e3;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
