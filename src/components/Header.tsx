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

// --- Icons ---
const IconPhone = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const IconLogin = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
)

const IconUserPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
)

export default function Header() {
  const { user, isLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Logic: Call button for everyone except Admin. Profile only for User (Not Admin).
  const isAdmin = user?.role === 'admin'
  const showCallButton = !isLoading && !isAdmin
  const showProfile = user && !isAdmin

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/10">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between relative">
        
        {/* LEFT: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition"
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
              width={48}
              height={48}
              className="rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform w-10 h-10 lg:w-12 lg:h-12"
            />
            <div className="leading-tight">
              <div className="text-sm lg:text-xl font-bold tracking-tight text-gray-900">MITC</div>
              <div className="text-[9px] lg:text-[10px] uppercase tracking-[0.18em] font-bold text-gray-500">
                Mateen IT Corp
              </div>
            </div>
          </Link>
        </div>

        {/* CENTER: Desktop Links */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT: PC Actions & Call Button */}
        <div className="flex items-center gap-2 lg:gap-5">
          
          {/* 1. Call MITC Button (Desktop: before profile | Mobile: far right) */}
          {showCallButton && (
            <a 
              href="tel:+919876543210" 
              className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all group"
              title="Call MITC"
            >
              <IconPhone />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Call MITC</span>
            </a>
          )}

          {/* 2. PC Specific Auth/Profile (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700">
                    Dashboard
                  </Link>
                )}
                
                {showProfile && (
                  <Link href="/profile" className="relative group">
                    {user.photoURL ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-transparent group-hover:border-blue-500 transition-all">
                        <Image 
                          src={user.photoURL} 
                          alt="Profile" 
                          fill 
                          className="object-cover"
                          unoptimized 
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </Link>
                )}

                <Link href="/auth/logout" title="Logout" className="p-2 text-gray-400 hover:text-red-600 transition">
                  <IconLogout />
                </Link>
              </div>
            ) : (
              <div className="flex items-center bg-gray-50 px-2 rounded-full border border-gray-100">
                <Link href="/login" title="Login" className="p-2 text-gray-600 hover:text-blue-600 transition">
                  <IconLogin />
                </Link>
                <span className="text-gray-300 mx-0.5 font-light">|</span>
                <Link href="/signup" title="Sign Up" className="p-2 text-gray-600 hover:text-blue-600 transition">
                  <IconUserPlus />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <Transition show={menuOpen} as={Fragment}>
        <Dialog open={menuOpen} onClose={setMenuOpen} className="relative z-[60] lg:hidden">
          <DialogBackdrop transition className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 data-[closed]:opacity-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <DialogPanel transition className="absolute left-0 top-0 h-full w-[86%] max-w-[340px] bg-white border-r shadow-2xl duration-300 data-[closed]:-translate-x-full">
                
                <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Navigation</span>
                  <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-4 flex flex-col h-[calc(100%-64px)]">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-4 py-3.5 text-[16px] font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto pb-6 pt-4 border-t border-gray-100">
                    {user ? (
                      <div className="space-y-2">
                        {isAdmin && (
                           <Link
                           href="/dashboard"
                           onClick={() => setMenuOpen(false)}
                           className="flex items-center gap-3 px-4 py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition"
                         >
                           Dashboard
                         </Link>
                        )}
                        
                        {showProfile && (
                          <Link
                            href="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-bold"
                          >
                             {user.photoURL ? (
                               <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" alt="Profile" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-gray-200" />
                             )}
                             <div className="flex flex-col">
                               <span className="text-sm">Profile</span>
                               <span className="text-[10px] text-gray-500 font-normal truncate max-w-[150px]">{user.email}</span>
                             </div>
                          </Link>
                        )}

                        <Link
                          href="/auth/logout"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition"
                        >
                          <IconLogout />
                          Logout
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/login"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold text-sm"
                        >
                          <IconLogin /> Login
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-gray-200"
                        >
                          <IconUserPlus /> Signup
                        </Link>
                      </div>
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
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1d1d1f;
          transition: color 0.2s ease;
        }
        .nav-link:hover { color: #0071e3; }
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
        .nav-link:hover::after { width: 100%; }
      `}</style>
    </header>
  )
}
