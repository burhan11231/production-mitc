'use client'

import { Fragment, useMemo, useState } from 'react'
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
  maxVisible?: number // default: 6 (header use-case)
  showViewAllLink?: boolean // default: true
  onSelectPerson?: (p: Salesperson) => void // open SalespersonModal from parent
  viewAllHref?: string // default: /team
  initialSearch?: string
}

function toDigits(phone: string) {
  return (phone || '').replace(/D/g, '')
}

function toWaLink(phone: string) {
  const digits = toDigits(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

function initials(name?: string) {
  const parts = (name || '').trim().split(/s+/).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

export default function TeamModal({
  isOpen,
  onClose,
  title = 'Talk to our team',
  subtitle = 'Choose a specialist to assist you.',
  salespersons,
  maxVisible = 6,
  showViewAllLink = true,
  onSelectPerson,
  viewAllHref = '/team',
  initialSearch = '',
}: Props) {
  const [search, setSearch] = useState(initialSearch)

  const list = useMemo(() => {
    const active = (salespersons || []).filter(p => p?.isActive)
    const sorted = active.sort((a, b) => (Number(a.order ?? 9999) - Number(b.order ?? 9999)))
    return sorted
  }, [salespersons])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = !q
      ? list
      : list.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.role || '').toLowerCase().includes(q)
        )
    return base.slice(0, maxVisible)
  }, [list, search, maxVisible])

  const totalActive = useMemo(() => list.length, [list])

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[70]">
        <DialogBackdrop
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <DialogPanel
              className="
                w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl
                ring-1 ring-black/5
              "
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/5 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  </div>

                  <button
                    onClick={onClose}
                    className="shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                      </svg>
                    </span>

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or role…"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {!!search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        aria-label="Clear search"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Showing {filtered.length} of {totalActive} active team member(s)
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-600">No team member found.</p>
                    {showViewAllLink && (
                      <Link onClick={onClose} href={viewAllHref} className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-700">
                        View full team →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((p) => {
                      const wa = toWaLink(p.whatsapp || p.phone || '')
                      const tel = toDigits(p.phone || '')
                      return (
                        <div
                          key={p.id}
                          className="rounded-3xl border border-gray-200 bg-white p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                              {p.imageUrl ? (
                                <Image
                                  src={p.imageUrl}
                                  alt={p.name || 'Team member'}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-500">
                                  {initials(p.name) || 'TM'}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide truncate">
                                {p.role || 'Team'}
                              </p>
                            </div>

                            <span className="h-2 w-2 rounded-full bg-green-500" title="Active" />
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <a
                              href={tel ? `tel:${tel}` : '#'}
                              className="text-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 transition disabled:opacity-50"
                              aria-disabled={!tel}
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
                              className="text-center rounded-2xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-bold py-2 transition"
                              onClick={(e) => {
                                if (!wa) e.preventDefault()
                              }}
                            >
                              WhatsApp
                            </a>

                            <button
                              onClick={() => onSelectPerson?.(p)}
                              className="rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center"
                              title="View details"
                            >
                              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
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
              {showViewAllLink && totalActive > maxVisible && (
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