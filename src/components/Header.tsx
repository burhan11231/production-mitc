'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);

  const closeMenu = () => setMenuOpen(false);

  // Close on ESC and lock scroll
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    if (menuOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Swipe to close logic (Left swipe)
  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!startX.current) return;
    const deltaX = startX.current - e.touches[0].clientX;
    if (deltaX > 50) { // Swiped left
      closeMenu();
      startX.current = null;
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Ratings', href: '/ratings' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          
          {/* LEFT: Logo & Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={40}
                height={40}
                className="rounded-lg object-cover shadow-sm"
              />
              <div className="hidden xs:block leading-tight">
                <div className="text-sm lg:text-lg font-bold tracking-tight text-gray-900">MITC</div>
                <div className="text-[8px] lg:text-[10px] uppercase tracking-[0.15em] font-bold text-blue-600">
                  Mateen IT Corp
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="nav-link">
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Auth Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                {user.role === 'admin' && (
                   <Link href="/dashboard" className="hidden md:block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                    Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition-all">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMenu} />
        
        <div
          ref={menuRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex items-center justify-between">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              {user ? (
                <Link href="/auth/logout" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-red-600 font-bold text-sm">
                  Logout
                </Link>
              ) : (
                <Link href="/login" onClick={closeMenu} className="block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          position: relative;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #4b5563;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #2563eb;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
