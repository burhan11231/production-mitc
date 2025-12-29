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
    if (menuOpen) {
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen]);

  // Swipe to close (Left swipe)
  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const deltaX = startX.current - e.touches[0].clientX;
    if (deltaX > 60) { closeMenu(); startX.current = null; }
  };

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
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                alt="MITC"
                width={38}
                height={38}
                className="rounded-lg shadow-sm"
                priority
              />
              <div className="hidden xs:block">
                <div className="text-base font-bold text-gray-900 leading-none">MITC</div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-blue-600 mt-1">Mateen IT Corp</div>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="nav-link">
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Auth */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                   <Link href="/dashboard" className="hidden sm:block text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-tight">
                    Admin
                  </Link>
                )}
                <Link href="/profile" className="p-2 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </Link>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* HUMBLE STYLE MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMenu} />
        
        {/* Left Side Panel */}
        <div
          ref={menuRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <span className="text-xl font-black text-gray-900 tracking-tighter">MITC</span>
              <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="12"></line></svg>
              </button>
            </div>

            <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="block px-4 py-4 text-lg font-bold text-gray-800 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="p-6 bg-gray-50 mt-auto">
              {user ? (
                <Link href="/auth/logout" onClick={closeMenu} className="flex items-center justify-center w-full py-4 text-red-600 font-bold bg-white border border-red-100 rounded-2xl shadow-sm">
                  Sign Out
                </Link>
              ) : (
                <Link href="/login" onClick={closeMenu} className="flex items-center justify-center w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #374151;
          position: relative;
          padding: 4px 0;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #2563eb;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link:hover {
          color: #2563eb;
        }
      `}</style>
    </>
  );
}
