'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useMemo, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';

import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import { useSalespersons } from '@/hooks/useSalespersons';
import TeamModal from '@/components/TeamModal';
import SalespersonModal from '@/components/SalespersonModal';
import { Salesperson } from '@/lib/firestore-models';

/* NAV LINKS */
const navItems = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/* ICONS */
const IconUser = () => (
  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

export default function Header() {
  const { user, isLoading } = useAuth();
  const { settings } = useSettings();
  const { salespersons } = useSalespersons();

  const [menuOpen, setMenuOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null);

  const isAdmin = user?.role === 'admin';

  const activeSorted = useMemo(() => {
    return (salespersons || [])
      .filter(p => p?.isActive)
      .sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999));
  }, [salespersons]);

  const handleSelectPerson = (p: Salesperson) => {
    setSelectedPerson(p);
    setPersonOpen(true);
    setTeamOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/10">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link href="/" className="flex items-center gap-3">
            {settings?.logoUrl && (
              <Image
                src={settings.logoUrl}
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
                unoptimized
              />
            )}
            <div>
              <div className="font-bold text-gray-900">
                {settings?.businessName || 'MITC'}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-500">
                {settings?.tagline || 'Mateen IT Corp'}
              </div>
            </div>
          </Link>
        </div>

        {/* CENTER (PC ONLY) */}
        <div className="hidden lg:flex gap-10">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* CONNECT — NOW VISIBLE ON MOBILE + DESKTOP */}
          {!isAdmin && (
            <button
              onClick={() => setTeamOpen(true)}
              className="
                px-4 lg:px-5
                h-10 lg:h-11
                rounded-full
                bg-blue-50 text-blue-700
                font-bold
                border border-blue-100
                hover:bg-blue-100
                transition
              "
            >
              Connect
            </button>
          )}

          {/* AUTH BUTTONS (DESKTOP ONLY) */}
          {!isLoading && !user && (
            <div className="hidden lg:flex gap-2">
              <Link
                href="/login"
                className="px-4 h-10 flex items-center rounded-lg border bg-white text-gray-900 font-bold"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 h-10 flex items-center rounded-lg bg-black text-white font-bold"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* PROFILE (ONLY IF LOGGED IN) */}
          {user && (
            <Menu as="div" className="relative">
              <MenuButton className="w-10 h-10 rounded-full bg-gray-50 border flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <IconUser />
                )}
              </MenuButton>

              <MenuItems className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border">
                <div className="p-2">
                  <MenuItem>
                    <Link
                      href={isAdmin ? '/dashboard' : '/profile'}
                      className="block px-3 py-2 rounded-lg font-bold hover:bg-gray-50"
                    >
                      {isAdmin ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href="/auth/logout"
                      className="flex items-center gap-2 px-3 py-2 text-red-600 font-bold rounded-lg hover:bg-red-50"
                    >
                      <IconLogout /> Logout
                    </Link>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          )}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <Transition show={menuOpen} as={Fragment}>
        <Dialog onClose={setMenuOpen} className="lg:hidden relative z-[60]">
          <DialogBackdrop className="fixed inset-0 bg-black/40" />

          <DialogPanel className="fixed left-0 top-0 h-full w-[80%] max-w-[300px] bg-white shadow-xl flex flex-col">
            <div className="h-16 px-6 flex items-center justify-between border-b">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Menu</span>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="flex-1 p-4 space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl font-bold text-gray-900 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* MOBILE AUTH FOOTER */}
            {!user && (
              <div
                className="border-t bg-sky-50/60 p-4 space-y-3"
                style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
              >
                <Link
                  href="/login"
                  className="block w-full text-center py-3 rounded-lg border bg-white text-black font-bold"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 rounded-lg bg-black text-white font-bold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </DialogPanel>
        </Dialog>
      </Transition>

      {/* TEAM MODAL */}
      <TeamModal
        isOpen={teamOpen}
        onClose={() => setTeamOpen(false)}
        title="Connect with Our Team"
        subtitle="Choose a specialist and connect instantly."
        salespersons={activeSorted}
        onSelectPerson={handleSelectPerson}
        showViewAllLink
        viewAllHref="/team"
      />

      {/* PERSON MODAL */}
      <SalespersonModal
        isOpen={personOpen}
        salesperson={selectedPerson}
        onClose={() => setPersonOpen(false)}
      />

      <style jsx>{`
        .nav-link {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1d1d1f;
        }
        .nav-link:hover {
          color: #0071e3;
        }
      `}</style>
    </header>
  );
}