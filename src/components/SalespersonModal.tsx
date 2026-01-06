'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react'
import { Salesperson } from '@/lib/firestore-models'

type Props = {
  isOpen: boolean
  salesperson: Salesperson | null
  onClose: () => void
}

/* ---------------- Utils ---------------- */

function toDigits(phone?: string) {
  return (phone || '').replace(/D/g, '')
}

function toWaLink(phone?: string) {
  const digits = toDigits(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

function initials(name?: string) {
  return (name || '')
    .trim()
    .split(/s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')
}

/* ---------------- Component ---------------- */

export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {
  if (!salesperson) return null

  const tel = toDigits(salesperson.phone)
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone)

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300" />

        <div className="fixed inset-0 z-[81] flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
          <DialogPanel className="
            relative w-full max-w-5xl mx-auto
            transform rounded-3xl bg-white/95 backdrop-blur-xl
            shadow-2xl ring-1 ring-black/10/90
            transition-all duration-300 ease-out
            sm:max-w-6xl lg:max-w-7xl
            max-h-[95vh] overflow-hidden
          ">
            {/* Header with Close Button */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-white/95 to-transparent backdrop-blur-sm border-b border-gray-100/50 px-6 py-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10 ring-2 ring-blue-500/20">
                    {salesperson.imageUrl ? (
                      <Image
                        src={salesperson.imageUrl}
                        alt={salesperson.name || 'Team member'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs lg:text-sm tracking-tight">
                        {initials(salesperson.name) || 'TM'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight truncate">
                      {salesperson.name}
                    </h2>
                    <p className="text-sm lg:text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {salesperson.role || 'Team Specialist'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="
                    group relative p-2.5 rounded-2xl bg-white/80 hover:bg-white/95
                    ring-1 ring-gray-200/50 hover:ring-gray-300/75
                    transition-all duration-200 hover:scale-105 active:scale-95
                    shadow-lg backdrop-blur-sm
                  "
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-[340px_1fr] gap-6 lg:gap-8 p-6 lg:p-8 xl:p-10 pb-10 lg:pb-12">
              
              {/* LEFT – Profile Sidebar */}
              <aside className="
                lg:col-span-1 xl:col-span-1 order-2 lg:order-1
                rounded-3xl bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-indigo-50/60
                backdrop-blur-md border border-white/50 ring-1 ring-white/30/75 shadow-xl
                p-6 lg:p-8 sticky lg:top-8 lg:max-h-[calc(95vh-8rem)] overflow-y-auto
              ">
                {salesperson.bio && (
                  <div className="space-y-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        About {salesperson.name.split(' ')[0]}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-700 line-clamp-6">
                        {salesperson.bio}
                      </p>
                    </div>
                  </div>
                )}
              </aside>

              {/* RIGHT – Main Content */}
              <section className="lg:col-span-2 order-1">
                
                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
                  <div className="
                    group relative rounded-3xl p-7 lg:p-8
                    bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30
                    border border-white/50 ring-1 ring-blue-500/10 hover:ring-blue-500/20
                    backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300
                    hover:-translate-y-1
                  ">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex items-start gap-4">
                      <div className="
                        relative h-14 w-14 flex items-center justify-center
                        rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
                        shadow-lg ring-1 ring-white/30
                      ">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      
                      <div className="min-w-0 flex-1 pt-1">
                        {tel ? (
                          <a
                            href={`tel:${tel}`}
                            className="
                              block font-bold text-xl lg:text-2xl text-gray-900
                              hover:text-blue-600 transition-colors duration-200
                              group-hover:translate-x-1
                            "
                          >
                            Call Now
                          </a>
                        ) : (
                          <div className="font-bold text-xl lg:text-2xl text-gray-500">
                            Call Unavailable
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {tel ? `+${tel}` : 'Phone number not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="
                    group relative rounded-3xl p-7 lg:p-8
                    bg-gradient-to-br from-white via-emerald-50/50 to-green-50/30
                    border border-white/50 ring-1 ring-emerald-500/10 hover:ring-emerald-500/20
                    backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300
                    hover:-translate-y-1
                  ">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex items-start gap-4">
                      <div className="
                        relative h-14 w-14 flex items-center justify-center
                        rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600
                        shadow-lg ring-1 ring-white/30
                      ">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M18.685 19.097A2.25 2.25 0 0020.25 16.5V9.75a2.25 2.25 0 00-1.565-2.153l-7.541-4.037a2.25 2.25 0 00-2.628 0l-7.541 4.037A2.25 2.25 0 003.75 9.75v6.75a2.25 2.25 0 001.565 2.153l7.541 4.037a2.25 2.25 0 002.628 0l7.541-4.037zM12 10.5a3.75 3.75 0 013.75-3.75h.5A.75.75 0 0117 7.5v1.5a.75.75 0 01-.75.75h-.5A3.75 3.75 0 0112 13.25v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5A3.75 3.75 0 019.25 10.5h-.5A.75.75 0 018 9.75V7.5a.75.75 0 01.75-.75h.5A3.75 3.75 0 0112 10.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      <div className="min-w-0 flex-1 pt-1">
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              block font-bold text-xl lg:text-2xl text-gray-900
                              hover:text-emerald-600 transition-colors duration-200
                              group-hover:translate-x-1
                            "
                          >
                            Message Now
                          </a>
                        ) : (
                          <div className="font-bold text-xl lg:text-2xl text-gray-500">
                            WhatsApp Unavailable
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Instant messaging
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                {salesperson.isActive === false && (
                  <div className="
                    rounded-3xl border-2 border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/60
                    p-6 lg:p-8 backdrop-blur-md shadow-xl ring-1 ring-amber-200/50
                  ">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg lg:text-xl text-amber-900 mb-1">
                          Team member currently unavailable
                        </h3>
                        <p className="text-sm lg:text-base text-amber-900/80 leading-relaxed">
                          This specialist is temporarily inactive. 
                          <br className="hidden sm:inline" />
                          Please select another team member from the list.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}