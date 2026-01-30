'use client'  
  
import Link from 'next/link'  
import Image from 'next/image'  
import { Fragment, useEffect, useMemo, useState } from 'react'  
import { Dialog, DialogBackdrop, DialogPanel, Transition, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'  
import { useAuth } from '@/lib/auth-context'  
import { useSettingsRTDB } from '@/hooks/useSettingsRTDB'  
import { useSalespersons } from '@/hooks/useSalespersons'  
import SalespersonModal from '@/components/SalespersonModal'  
import TeamModal from '@/components/TeamModal'  
import { Salesperson } from '@/lib/firestore-models'  
import toast from 'react-hot-toast'
  
const navItems = [    
  { href: '/services', label: 'Services' },  
  { href: '/about', label: 'About' },  
  { href: '/ratings', label: 'Ratings' },  
  { href: '/contact', label: 'Contact' },    
]  


const FALLBACK_LOGO =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg'
  
const IconPhone = () => (  
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />  
  </svg>  
)  
  
const IconUser = ({ className = 'w-6 h-6' }: { className?: string }) => (  
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">  
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />  
  </svg>  
)  
  
const IconLogout = () => (  
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />  
  </svg>  
)  
  
export default function Header() {  
  const { user, isLoading, logout } = useAuth()  
  const { settings } = useSettingsRTDB()  
  const { salespersons } = useSalespersons()  
  
  const [menuOpen, setMenuOpen] = useState(false)  
  
  const [teamOpen, setTeamOpen] = useState(false)  
  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null)  
  const [personOpen, setPersonOpen] = useState(false)  
  const [logoutOpen, setLogoutOpen] = useState(false)
  const isAdmin = user?.role === 'admin'  
  const showCallButton = !isLoading && !isAdmin  
  
  const activeSorted = useMemo(() => {  
    return (salespersons || [])  
      .filter(p => p?.isActive)  
      .sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999))  
  }, [salespersons])  
  
  const handleSelectPerson = (p: Salesperson) => {  
    setSelectedPerson(p)  
    setPersonOpen(true)  
    setTeamOpen(false)  
  }  
  
  
  
  return (  
<header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/10">  
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between relative">  
        {/* LEFT */}  
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
  
          <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
  <Image
    src={settings.logoUrl || FALLBACK_LOGO}
    alt="Logo"
    width={40}
    height={40}
    className="rounded-lg lg:rounded-xl object-cover shadow-sm
               group-hover:scale-105 transition-transform
               translate-y-[1px]"
    unoptimized
  />

  <div className="flex flex-col justify-center leading-none">
    <div className="text-sm lg:text-xl font-bold tracking-tight text-gray-900">
      {settings?.businessName || 'MITC'}
    </div>
    <div className="text-[8px] lg:text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">
      {settings?.tagline || 'Mateen IT Corp'}
    </div>
  </div>
</Link>  
        </div>  
  
        {/* CENTER */}  
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">  
          {navItems.map((item) => (  
            <Link key={item.href} href={item.href} className="nav-link">  
              {item.label}  
            </Link>  
          ))}  
        </div>  
  
        {/* RIGHT */}  
        <div className="flex items-center gap-2 lg:gap-4">  
  {showCallButton && (  
    <button  
  onClick={() => setTeamOpen(true)}  
  className={`  
    h-10 lg:h-11 px-4 lg:px-5 rounded-full  
    bg-blue-50 hover:bg-blue-100 text-blue-700  
    border border-blue-100  
    transition  
    text-xs font-bold uppercase tracking-wider  
  `}  
>  
  Connect  
</button>  
          )}  
  
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
                {user && (  
                  <div className="px-4 py-4 bg-gray-50/50">  
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>  
                    <p className="text-sm font-bold text-gray-900 truncate">  
  {user.name || 'MITC User'}  
</p>  
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>  
                  </div>  
                )}  
  
                <div className="p-2">  
                  {isLoading ? (  
                    <div className="p-4 flex justify-center">  
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />  
                    </div>  
                  ) : user ? (  
                    <>  
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
    <button
      onClick={() => setLogoutOpen(true)}
      className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'}
        flex w-full items-center gap-2 rounded-xl px-3 py-2.5
        text-sm font-bold transition`}
    >
      <IconLogout /> Logout
    </button>
  )}
</MenuItem>  
                    </>  
                  ) : (  
                    <div className="grid grid-cols-1 gap-1">  
                      <MenuItem>
  {({ active }) => (
    <Link
      href="/login"
      className={`${active ? 'bg-gray-100' : ''} flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 transition`}
    >
      Login
    </Link>
  )}
</MenuItem>

<MenuItem>
  {({ active }) => (
    <Link
      href="/signup"
      className={`
        ${active ? 'bg-black' : 'bg-neutral-900'}
        flex w-full items-center rounded-xl px-3 py-2.5
        text-sm font-bold text-white
        transition hover:bg-black
        shadow-md shadow-black/20
      `}
    >
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
        <Dialog  
  open={menuOpen}  
  onClose={setMenuOpen}  
  className="relative z-[60] lg:hidden"  
  static={false}  
>  
          <DialogBackdrop transition className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 data-[closed]:opacity-0" />  
          <div className="fixed inset-0 overflow-hidden">  
            <div className="absolute inset-0 overflow-hidden">  
              <DialogPanel transition className="absolute left-0 top-0 h-full w-[80%] max-w-[300px] bg-white border-r shadow-2xl duration-300 data-[closed]:-translate-x-full">  
                <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">  
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Menu</span>  
                  <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500" aria-label="Close menu">  
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />  
                    </svg>  
                  </button>  
                </div>  
                <div className="p-4 space-y-1">  
                  {navItems.map((item) => (  
                    <Link  
                      key={item.href}  
                      href={item.href}  
                      onClick={() => setMenuOpen(false)}  
                      className="block px-4 py-3 text-lg font-bold text-gray-900 rounded-xl hover:bg-gray-50 transition"  
                    >  
                      {item.label}  
                    </Link>  
                  ))}  
                </div>  
              </DialogPanel>  
            </div>  
          </div>  
        </Dialog>  
      </Transition>




<Transition show={logoutOpen} as={Fragment}>
  <Dialog
    open={logoutOpen}
    onClose={() => setLogoutOpen(false)}
    className="relative z-[70]"
  >
    <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

    <div className="fixed inset-0 flex items-center justify-center px-4">
      <DialogPanel className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Sign out
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to log out of your account?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setLogoutOpen(false)}
            className="flex-1 h-11 rounded-lg border font-semibold"
          >
            Cancel
          </button>

          <button
  onClick={async () => {
    setLogoutOpen(false)
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (err) {
      console.error('Logout failed:', err)
      toast.error('Failed to log out')
    }
  }}
  className="flex-1 h-11 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
>
  Log out
</button>
        </div>

      </DialogPanel>
    </div>
  </Dialog>
</Transition>

  
      {/* TEAM MODAL */}  
      <TeamModal  
        isOpen={teamOpen}  
        onClose={() => setTeamOpen(false)}  
        title="Connect with Our Team"  
        subtitle="Choose a specialist and connect instantly via call or WhatsApp."  
        salespersons={activeSorted}  
        showViewAllLink  
        onSelectPerson={handleSelectPerson}  
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
          position: relative;  
          font-size: 13px;  
          font-weight: 700;  
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
          height: 2px;  
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
