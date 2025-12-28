'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-2xl text-primary-600">MITC</div>
            <span className="hidden sm:inline text-xs text-gray-600">Mateen IT Corp</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-primary-600 transition">Home</Link>
            <Link href="/services" className="text-gray-600 hover:text-primary-600 transition">Services</Link>
            <Link href="/about" className="text-gray-600 hover:text-primary-600 transition">About</Link>
            <Link href="/ratings" className="text-gray-600 hover:text-primary-600 transition">Ratings</Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition">Contact</Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="spinner" />
            ) : user ? (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-primary-600 transition">
                  {user.name || user.email}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/dashboard" className="text-primary-600 font-medium hover:text-primary-700 transition">
                    Dashboard
                  </Link>
                )}
                <Link href="/auth/logout" className="btn-primary">
                  Logout
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-4 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-600 hover:text-primary-600">Home</Link>
            <Link href="/services" className="block py-2 text-gray-600 hover:text-primary-600">Services</Link>
            <Link href="/about" className="block py-2 text-gray-600 hover:text-primary-600">About</Link>
            <Link href="/ratings" className="block py-2 text-gray-600 hover:text-primary-600">Ratings</Link>
            <Link href="/contact" className="block py-2 text-gray-600 hover:text-primary-600">Contact</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
