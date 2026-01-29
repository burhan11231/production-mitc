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
  return (phone || '').replace(/\D/g, '')
}

function toWaLink(phone?: string) {
  const digits = toDigits(phone)
  return digits ? `https://wa.me/${digits}` : ''
}

function initials(name?: string) {
  return (name || '')
    .trim()
    .split(/\s+/)
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
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* ============ HEADER ============ */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white shadow-md">
                    {salesperson.imageUrl ? (
                      <Image
                        src={salesperson.imageUrl}
                        alt={salesperson.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white font-bold text-xl">
                        {initials(salesperson.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {salesperson.name}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600">
                      {salesperson.role}
                    </p>
                  </div>
                </div>

                <button onClick={onClose} className="p-2 hover:bg-white rounded-full">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* ============ BODY ============ */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* Bio */}
              {salesperson.bio && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Bio
                  </h3>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border">
                    <p className="text-gray-700 leading-relaxed italic">
                      {salesperson.bio}
                    </p>
                  </div>
                </section>
              )}

              {/* Specializations */}
              {salesperson.specializations.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Areas of Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {salesperson.specializations.map(spec => (
                      <span
                        key={spec}
                        className="px-3.5 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg border"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Status */}
              {salesperson.isActive === false && (
                <div className="p-4 rounded-xl bg-amber-50 border text-amber-800 text-sm font-medium flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Currently away from desk</span>
                </div>
              )}
            </div>

            {/* ============ FOOTER ============ */}
<div className="bg-gray-50 border-t px-6 py-5">
  <div className="flex items-center justify-between w-full">

    {/* Call */}
    <button
      onClick={() => tel && (window.location.href = `tel:${tel}`)}
      disabled={!tel}
      title="Call"
      className="p-3 rounded-full hover:bg-gray-100 active:scale-95 transition"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/16076/16076069.png"
        alt="Call"
        className="h-7 w-7"
      />
    </button>

    {/* WhatsApp */}
    <button
      onClick={() => wa && window.open(wa, '_blank')}
      disabled={!wa}
      title="WhatsApp"
      className="p-3 rounded-full hover:bg-gray-100 active:scale-95 transition"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/3536/3536445.png"
        alt="WhatsApp"
        className="h-7 w-7"
      />
    </button>

    {/* Gmail */}
    <button
      onClick={() => window.open(`mailto:${salesperson.email}`, '_blank')}
      title="Gmail"
      className="p-3 rounded-full hover:bg-gray-100 active:scale-95 transition"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/732/732200.png"
        alt="Gmail"
        className="h-7 w-7"
      />
    </button>

  </div>
</div>

          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}
