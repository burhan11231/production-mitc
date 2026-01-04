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

function toDigits(phone: string) {
  return (phone || '').replace(/D/g, '')
}

function toWaLink(phone: string) {
  const digits = toDigits(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {
  if (!salesperson) return null

  const tel = toDigits(salesperson.phone || '')
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone || '')

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <DialogPanel className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Top */}
              <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-6 p-6 sm:p-8">
                {/* Left */}
                <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-white ring-1 ring-black/5">
                      {salesperson.imageUrl ? (
                        <Image
                          src={salesperson.imageUrl}
                          alt={salesperson.name || 'Team member'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">{salesperson.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 truncate">
                        {salesperson.role || 'Team'}
                      </p>
                    </div>
                  </div>

                  {salesperson.bio && (
                    <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                      {salesperson.bio}
                    </p>
                  )}
                </div>

                {/* Right */}
                <div className="space-y-3">
                  <div className="rounded-3xl border border-gray-200 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={tel ? `tel:${tel}` : '#'}
                        className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 text-center transition"
                        onClick={(e) => {
                          if (!tel) e.preventDefault()
                        }}
                      >
                        Call
                      </a>

                      <a
                        href={wa || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm py-3 text-center transition"
                        onClick={(e) => {
                          if (!wa) e.preventDefault()
                        }}
                      >
                        WhatsApp
                      </a>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 font-semibold">Phone</p>
                        <p className="mt-1 font-bold text-gray-900 break-all">
                          {salesperson.phone || '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 font-semibold">WhatsApp</p>
                        <p className="mt-1 font-bold text-gray-900 break-all">
                          {salesperson.whatsapp || salesperson.phone || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {salesperson.isActive === false && (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                      <p className="font-bold text-amber-900">This team member is currently inactive.</p>
                      <p className="text-sm text-amber-900/80 mt-1">Please choose another specialist from the team list.</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}