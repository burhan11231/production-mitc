'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/ratings', label: 'Ratings' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const { user, isLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Optional: close drawer on route change (App Router)
  // If you want, tell me if you're using next/navigation and I’ll add it cleanly.

  // Optional: lock body scroll (Headless UI already handles inert/focus,
  // but scroll locking can vary by setup; keeping explicit lock is fine.)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/10">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between relative">
        {/* LEFT */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Open menu"
            aria-expanded={menuOpen}
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
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

      {/* Mobile Drawer */}
      <Transition show={menuOpen} as={Fragment}>
        <Dialog open={menuOpen} onClose={setMenuOpen} className="relative z-[60] lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 ease-out data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <DialogPanel
                transition
                className="
                  absolute left-0 top-0 h-full w-[86%] max-w-[340px]
                  bg-white/95 backdrop-blur-xl border-r border-black/10 shadow-2xl
                  duration-300 ease-out
                  data-[closed]:-translate-x-full
                "
              >
                <div className="h-16 px-4 flex items-center justify-between border-b border-black/10">
                  <div className="text-sm font-bold tracking-tight text-gray-900">Menu</div>

                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl px-3 py-3 text-[15px] font-semibold text-gray-900 hover:bg-gray-100 transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-black/10">
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="rounded-xl px-3 py-3 text-[14px] font-semibold text-gray-700 hover:bg-gray-100 transition"
                        >
                          Profile
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-xl px-3 py-3 text-[14px] font-semibold text-blue-700 hover:bg-blue-50 transition"
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          href="/auth/logout"
                          onClick={() => setMenuOpen(false)}
                          className="rounded-xl px-3 py-3 text-[14px] font-semibold text-red-700 hover:bg-red-50 transition"
                        >
                          Logout
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 bg-gray-900 text-white text-sm font-bold hover:bg-blue-600 transition"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>

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
  )
}
