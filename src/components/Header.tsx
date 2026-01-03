// src/components/Header.tsx - UPDATED VERSION
// Connects to real-time settings and salespersons

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Transition, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useAuth } from '@/lib/auth-context'
import { useSettings } from '@/hooks/useSettings'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from './SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/ratings', label: 'Ratings' },
  { href: '/contact', label: 'Contact' },
  { href: '/team', label: 'Team' },
]


// --- Icons ---
const IconPhone = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const IconUser = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
)

// Modern Info / Details icon (Heroicons-style)
const IconInfo = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
    />
  </svg>
)


export default function Header() {
  const { user, isLoading } = useAuth()
  const { settings } = useSettings()
  const { salespersons } = useSalespersons()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 🔹 Search state
  const [search, setSearch] = useState('')

  // 🔹 Role logic (ONLY ONCE)
  const isAdmin = user?.role === 'admin'
  const showCallButton = !isLoading && !isAdmin

  // 🔹 Top active salespersons
  const topSalespersons = salespersons
    .filter(p => p.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)

  // 🔹 Search filter (SAFE)
  const filteredSalespersons = topSalespersons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSalespersonClick = (person: Salesperson) => {
    setSelectedPerson(person)
    setModalOpen(true)
    setShowTeamModal(false)
  }

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
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
            {settings?.logoUrl && (
              <Image
                src={settings.logoUrl}
                alt={settings.businessName || 'Logo'}
                width={40}
                height={40}
                className="rounded-lg lg:rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                unoptimized
              />
            )}
            <div className="leading-tight">
              <div className="text-sm lg:text-xl font-bold tracking-tight text-gray-900">
                {settings?.businessName || 'MITC'}
              </div>
              <div className="text-[8px] lg:text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">
                {settings?.tagline || 'Mateen IT Corp'}
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

        {/* RIGHT: Call & Profile Dropdown (Mobile + PC) */}
        <div className="flex items-center gap-2 lg:gap-4">
          
          {/* Call Button - Opens Team Modal */}
          {showCallButton && (
            <button 
              onClick={() => setShowTeamModal(true)}
              className="p-2 lg:px-4 lg:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all flex items-center gap-2"
            >
              <IconPhone />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Call MITC</span>
            </button>
          )}

          {/* Profile Dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition overflow-hidden">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Profile" width={44} height={44} className="object-cover" unoptimized />
              ) : (
                <IconUser className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
              )}
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-50 overflow-hidden">
                
                {/* User Info Header */}
                {user && (
                  <div className="px-4 py-4 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'MITC User'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                )}

                <div className="p-2">
                  {isLoading ? (
                    <div className="p-4 flex justify-center"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"/></div>
                  ) : user ? (
                    <>
                      {/* Admin Links */}
                      {isAdmin ? (
                        <MenuItem>
                          {({ active }) => (
                            <Link href="/dashboard" className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition`}>
                              Admin Dashboard
                            </Link>
                          )}
                        </MenuItem>
                      ) : (
                        <MenuItem>
                          {({ active }) => (
                            <Link href="/profile" className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition`}>
                              My Profile
                            </Link>
                          )}
                        </MenuItem>
                      )}
                      
                      <MenuItem>
                        {({ active }) => (
                          <Link href="/auth/logout" className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition`}>
                            <IconLogout /> Logout
                          </Link>
                        )}
                      </MenuItem>
                    </>
                  ) : (
                    /* Guest Links */
                    <div className="grid grid-cols-1 gap-1">
                      <MenuItem>
                        {({ active }) => (
                          <Link href="/login" className={`${active ? 'bg-gray-100' : ''} flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 transition`}>
                            Login
                          </Link>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <Link href="/signup" className={`${active ? 'bg-blue-700' : 'bg-blue-600'} flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold text-white transition shadow-md shadow-blue-100`}>
                            Create Account
                          </Link>
                        )}
                      </MenuItem>
                    </div>
                  )}
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </nav>

      {/* MOBILE NAV DRAWER */}
      <Transition show={menuOpen} as={Fragment}>
        <Dialog open={menuOpen} onClose={setMenuOpen} className="relative z-[60] lg:hidden">
          <DialogBackdrop transition className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 data-[closed]:opacity-0" />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <DialogPanel transition className="absolute left-0 top-0 h-full w-[80%] max-w-[300px] bg-white border-r shadow-2xl duration-300 data-[closed]:-translate-x-full">
                <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Menu</span>
                  <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-lg font-bold text-gray-900 rounded-xl hover:bg-gray-50 transition">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* TEAM MODAL – IMPROVED */}
<Transition show={showTeamModal} as={Fragment}>
  <Dialog open={showTeamModal} onClose={() => setShowTeamModal(false)} className="relative z-50">
    <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl">

          {/* HEADER */}
          <div className="px-6 py-5 border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Talk to our team
                </h2>
                <p className="text-sm text-gray-500">
                  Choose a specialist to assist you
                </p>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* SEARCH */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 max-h-[420px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSalespersons.map((person) => (
                <div
                  key={person.id}
                  className="rounded-2xl border p-4 hover:shadow-md transition bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={person.imageUrl || '/avatar.png'}
                      alt={person.name}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                      unoptimized
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {person.name}
                      </p>
                      <p className="text-xs text-blue-600 font-medium truncate">
                        {person.role}
                      </p>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={`tel:${person.phone}`}
                      className="flex-1 text-center rounded-xl bg-blue-600 text-white text-sm font-bold py-2 hover:bg-blue-700 transition"
                    >
                      Call
                    </a>

                    <a
                      href={`https://wa.me/${person.whatsapp || person.phone}`}
                      target="_blank"
                      className="flex-1 text-center rounded-xl bg-green-500 text-white text-sm font-bold py-2 hover:bg-green-600 transition"
                    >
                      WhatsApp
                    </a>

                    <button
  onClick={() => handleSalespersonClick(person)}
  className="group p-2 rounded-xl border border-gray-200 transition hover:bg-blue-50 hover:border-blue-200"
  title="View details"
>
  <IconInfo className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition" />
</button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSalespersons.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No team member found
              </p>
            )}
          </div>

          {/* FOOTER */}
          {salespersons.filter(p => p.isActive).length > 5 && (
            <div className="px-6 py-4 border-t">
              <Link
                href="/team"
                onClick={() => setShowTeamModal(false)}
                className="block text-center font-bold text-blue-600 hover:text-blue-700"
              >
                View full team →
              </Link>
            </div>
          )}

        </DialogPanel>
      </div>
    </div>
  </Dialog>
</Transition>

      {/* Individual Person Modal */}
      <SalespersonModal isOpen={modalOpen} salesperson={selectedPerson} onClose={() => setModalOpen(false)} />

      <style jsx>{`
        .nav-link {
          position: relative;
          font-size: 13px;
          font-weight: 700;
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
          height: 2px;
          background: #0071e3;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
      `}</style>
    </header>
  )
}
