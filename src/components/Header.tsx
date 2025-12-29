'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Menu, Home, Layers, Info, Star, Mail, LayoutDashboard, LogOut, User } from 'lucide-react'; // Recommended: npm install lucide-react

export default function Header() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);

  // Close menu function
  const closeMenu = () => setMenuOpen(false);

  /* ---------------------------
     Accessibility & Window Listeners
  ---------------------------- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    if (menuOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden'; // Lock scroll
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* ---------------------------
     Swipe to Close (Left) Logic
  ---------------------------- */
  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!startX.current) return;
    const deltaX = startX.current - e.touches[0].clientX;
    // If user swipes left more than 50px, close menu
    if (deltaX > 50) {
      closeMenu();
      startX.current = null;
    }
  }

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Services', href: '/services', icon: <Layers size={20} /> },
    { name: 'About', href: '/about', icon: <Info size={20} /> },
    { name: 'Ratings', href: '/ratings', icon: <Star size={20} /> },
    { name: 'Contact', href: '/contact', icon: <Mail size={20} /> },
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
              <Menu size={24} />
            </button>

            <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
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
                {user.role === 'admin' && (
                  <Link href="/dashboard" className="hidden md:block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                    Dashboard
                  </Link>
                )}
                <Link href="/profile" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                  <User size={20} />
                </Link>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
          onClick={closeMenu}
        />

        {/* Side Panel */}
        <div
          ref={menuRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="font-bold text-gray-900">MITC</span>
              </div>
              <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center gap-4 px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer (User Section) */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/auth/logout" 
                    className="flex items-center gap-3 px-4 py-3 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition"
                    onClick={closeMenu}
                  >
                    <LogOut size={18} />
                    Logout
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md"
                >
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
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #2563eb;
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
