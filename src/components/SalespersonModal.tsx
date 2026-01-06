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
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

function initials(name?: string) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')
}

export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {
  if (!salesperson) return null

  const tel = toDigits(salesperson.phone)
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone)

  // TODO: replace with real counts from Firestore
  const likesCount = 23
  const dislikesCount = 2
  const userReaction: 'like' | 'dislike' | null = null // derive from logged-in user state

  const handleLike = () => {
    // TODO:
    // - if no user => open login
    // - if already liked => remove like
    // - if disliked => switch to like
  }

  const handleDislike = () => {
    // TODO:
    // - if no user => open login
    // - if already disliked => remove dislike
    // - if liked => switch to dislike
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300" />

        {/* Center container */}
        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <DialogPanel
            className="
              relative w-full max-w-5xl mx-auto
              h-[80vh] flex flex-col
              transform rounded-3xl bg-white/95 backdrop-blur-xl
              shadow-2xl ring-1 ring-black/10
              transition-all duration-300 ease-out
              overflow-hidden
            "
          >
            {/* 1. FIXED HEADER */}
            <div className="flex-shrink-0 bg-white/95 border-b border-gray-100/50 px-6 py-6 lg:px-8">
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
                  className="p-2.5 rounded-2xl bg-white/80 hover:bg-white/95 ring-1 ring-gray-200/50 hover:ring-gray-300/75 transition-all duration-200 shadow-lg"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6 6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-28 lg:px-8 lg:pt-5 lg:pb-32 space-y-6 lg:space-y-8">
              {/* SPECIALIZATIONS - "Can Help With" */}
              {salesperson.specializations && salesperson.specializations.length > 0 && (
                <section className="rounded-2xl bg-slate-50/80 border border-slate-100/80 px-4 py-4 lg:px-5 lg:py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Can Help With
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {salesperson.specializations.map(spec => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 text-xs font-medium"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {spec}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* CONTACT CARDS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Phone Card */}
                <div className="group relative rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 border border-white/50 ring-1 ring-blue-500/10 shadow-xl">
                  <div className="relative flex items-center gap-5">
                    <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      {tel ? (
                        <a
                          href={`tel:${tel}`}
                          className="block font-bold text-xl lg:text-2xl text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          Call Now
                        </a>
                      ) : (
                        <div className="font-bold text-xl lg:text-2xl text-gray-400">Unavailable</div>
                      )}
                      <p className="text-sm text-gray-500 font-medium">
                        {tel ? `+${tel}` : 'No phone'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="group relative rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-white via-emerald-50/50 to-green-50/30 border border-white/50 ring-1 ring-emerald-500/10 shadow-xl">
                  <div className="relative flex items-center gap-5">
                    <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-2xl bg-[#25D366] shadow-lg">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.439 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block font-bold text-xl lg:text-2xl text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          Message
                        </a>
                      ) : (
                        <div className="font-bold text-xl lg:text-2xl text-gray-400">Unavailable</div>
                      )}
                      <p className="text-sm text-gray-500 font-medium">WhatsApp</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ABOUT SECTION */}
              {salesperson.bio && (
                <div className="w-full rounded-3xl bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-indigo-50/60 backdrop-blur-md border border-white/50 ring-1 ring-white/30 shadow-xl p-6 lg:p-8">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-lg lg:text-xl">
                      About {salesperson.name.split(' ')[0]}
                    </h3>
                    <p className="text-base leading-relaxed text-gray-700">{salesperson.bio}</p>
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              {salesperson.isActive === false && (
                <div className="rounded-3xl border-2 border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/60 p-6 lg:p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="font-bold text-amber-900">Unavailable</h3>
                  </div>
                </div>
              )}
            </div>

            {/* 3. FIXED FOOTER */}
            <div className="flex-shrink-0 bg-white/95 border-t border-gray-100/60 px-4 lg:px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* LEFT: icon-only CTAs */}
                <div className="flex items-center gap-2">
                  {/* Call icon button */}
                  <button
                    type="button"
                    disabled={!tel}
                    onClick={() => {
                      if (!tel) return
                      window.location.href = `tel:${tel}`
                    }}
                    className={`
                      inline-flex items-center justify-center h-10 w-10 rounded-full
                      border transition-all
                      ${tel
                        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-md'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                    aria-label="Call"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>

                  {/* WhatsApp icon button */}
                  <button
                    type="button"
                    disabled={!wa}
                    onClick={() => {
                      if (!wa) return
                      window.open(wa, '_blank', 'noopener,noreferrer')
                    }}
                    className={`
                      inline-flex items-center justify-center h-10 w-10 rounded-full
                      border transition-all
                      ${wa
                        ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600 shadow-md'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                    aria-label="WhatsApp"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                  </button>
                </div>

                {/* RIGHT: like / dislike with counts */}
                <div className="flex items-center gap-3">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border
                      transition-all
                      ${userReaction === 'like'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}
                    `}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill={userReaction === 'like' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M7 11.5V20H4.5A1.5 1.5 0 013 18.5v-6A1.5 1.5 0 014.5 11H7zm0 0l4.29-7.16A1 1 0 0112.17 3H13a2 2 0 012 2v3h3.28a2 2 0 011.96 2.39l-1.2 6A2 2 0 0117.09 19H7"
                      />
                    </svg>
                    <span>{likesCount}</span>
                  </button>

                  {/* Dislike */}
                  <button
                    type="button"
                    onClick={handleDislike}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border
                      transition-all
                      ${userReaction === 'dislike'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}
                    `}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill={userReaction === 'dislike' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M7 12.5V4H4.5A1.5 1.5 0 003 5.5v6A1.5 1.5 0 004.5 13H7zm0 0l4.29 7.16A1 1 0 0012.17 21H13a2 2 0 002-2v-3h3.28a2 2 0 001.96-2.39l-1.2-6A2 2 0 0017.09 5H7"
                      />
                    </svg>
                    <span>{dislikesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </Dialog>
    </Transition>
  )
}
