'use client'

import { Fragment, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react'
import { Salesperson } from '@/lib/firestore-models'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  salespersons: Salesperson[]
  maxVisible?: number
  showViewAllLink?: boolean
  onSelectPerson?: (p: Salesperson) => void
  viewAllHref?: string
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
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

/* ---------------- Component ---------------- */

export default function TeamModal({
  isOpen,
  onClose,
  title = 'Connect with Our Team',
  subtitle = 'Choose a specialist and connect instantly via call or WhatsApp.',
  salespersons,
  maxVisible = 4,
  showViewAllLink = true,
  onSelectPerson,
  viewAllHref = '/team',
}: Props) {

  const list = useMemo(() => {
    const sorted = [...(salespersons || [])].sort(
      (a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999)
    )
    return sorted.slice(0, maxVisible)
  }, [salespersons, maxVisible])

  const totalCount = salespersons?.length || 0

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[70]">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <DialogPanel className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-5 border-b border-black/5 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>

                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto bg-sky-50/60">
                <p className="mb-5 text-sm text-gray-600">{subtitle}</p>

                {list.length === 0 ? (
                  <div className="py-10 text-center text-gray-600">
                    No team member found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {list.map(p => {
                      const wa = toWaLink(p.whatsapp || p.phone)
                      const tel = toDigits(p.phone)

                      return (
                        <div
                          key={p.id}
                          className="rounded-3xl border border-gray-200 bg-white p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-2xl overflow-hidden
  bg-gradient-to-br from-blue-400 to-cyan-400
  border border-white shadow-sm
">
  {p.imageUrl ? (
    <Image
      src={p.imageUrl}
      alt={p.name || 'Team member'}
      fill
      className="object-cover"
      unoptimized
    />
  ) : (
    <div className="h-full w-full flex items-center justify-center
      text-white font-bold text-sm
    ">
      {initials(p.name) || 'TM'}
    </div>
  )}
</div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs font-semibold text-blue-600 uppercase truncate">
                                {p.role || 'Team'}
                              </p>
                            </div>

                            <span
                              className={`h-2 w-2 rounded-full ${
                                p.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              title={p.isActive ? 'Active' : 'Inactive'}
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <a
                              href={tel ? `tel:${tel}` : '#'}
                              onClick={e => !tel && e.preventDefault()}
                              className="text-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 transition"
                            >
                              Call
                            </a>

                            <a
                              href={wa || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => !wa && e.preventDefault()}
                              className="text-center rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 transition"
                            >
                              WhatsApp
                            </a>

                            <button
                              onClick={() => onSelectPerson?.(p)}
                              className="rounded-2xl border border-gray-200 hover:bg-blue-50 transition flex items-center justify-center"
                              title="View details"
                            >
                              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {showViewAllLink && totalCount > maxVisible && (
                <div className="px-6 py-4 border-t border-black/5 bg-white">
                  <Link
                    href={viewAllHref}
                    onClick={onClose}
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
  )
}