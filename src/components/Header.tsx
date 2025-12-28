'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);

  /* ---------------------------
     Close on outside click
  ---------------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  /* ---------------------------
     Close on ESC key
  ---------------------------- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    if (menuOpen) {
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  /* ---------------------------
     Lock body scroll
  ---------------------------- */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  /* ---------------------------
     Swipe down to close
  ---------------------------- */
  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!startY.current) return;
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 80) {
      setMenuOpen(false);
      startY.current = null;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/10">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between relative">

        {/* LEFT */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
              alt="MITC"
              width={48}
              height={48}
              className="rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="leading-tight">
              <div className="text-sm lg:text-xl font-bold tracking-tight text-gray-900">MITC</div>
              <div className="text-[9px] lg:text-[10px] uppercase tracking-[0.18em] font-bold text-gray-500">
                Mateen IT Corp
              </div>
            </div>
          </Link>
        </div>

        {/* CENTER (Desktop) */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
              <Link href="/profile" className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                {user.name || user.email}
              </Link>

              {user.role === 'admin' && (
                <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                  Dashboard
                </Link>
              )}

              <Link href="/auth/logout" className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition">
                Logout
              </Link>
            </>
          ) : (
            <Link href="/login" className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`lg:hidden fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-xl transition-all duration-300 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col p-6 space-y-4 text-lg font-semibold">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/ratings" onClick={() => setMenuOpen(false)}>Ratings</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      </div>

      {/* Desktop underline animation */}
      <style jsx>{`
        .nav-link {
          position: relative;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1d1d1f;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: #0071e3;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #0071e3;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </header>
  );
}
