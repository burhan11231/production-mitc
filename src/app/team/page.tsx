'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from '@/components/SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

type ViewMode = 'grid' | 'list'
type SortMode = 'recommended' | 'name-asc'

function toDigits(phone: string) {
  return (phone || '').replace(/\D/g, '')
}

function toWaLink(phone: string) {
  const digits = toDigits(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

export default function TeamPage() {
  const { salespersons, isLoading } = useSalespersons()

  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeOnly, setActiveOnly] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  

  const roles = useMemo(() => {
    const set = new Set<string>()
    salespersons.forEach(p => p.role && set.add(p.role))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [salespersons])

  const filteredTeam = useMemo(() => {
    const q = search.trim().toLowerCase()

    const list = salespersons.filter(p => {
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.role || '').toLowerCase().includes(q)

      const matchesRole = roleFilter === 'all' || p.role === roleFilter
      const matchesActive = !activeOnly || !!p.isActive

      return matchesSearch && matchesRole && matchesActive
    })

    if (sortMode === 'name-asc') {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return list.sort((a, b) => {
      const ao = Number.isFinite(a.order) ? (a.order as number) : 9999
      const bo = Number.isFinite(b.order) ? (b.order as number) : 9999
      if (ao !== bo) return ao - bo
      return (a.name || '').localeCompare(b.name || '')
    })
  }, [salespersons, search, roleFilter, activeOnly, sortMode])

  const handleCardClick = (person: Salesperson) => {
    setSelectedPerson(person)
    setModalOpen(true)
  }

  const resultsLabel = isLoading ? 'Loading…' : `${filteredTeam.length} team member(s)`

  return (
    <main className="overflow-x-hidden bg-white">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.10),transparent_55%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-10">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 backdrop-blur font-bold tracking-widest uppercase text-xs text-gray-900">
              Team
            </p>

            <h1 className="mt-8 text-5xl sm:text-7xl font-black tracking-tight text-gray-900 leading-[0.95]">
              Talk to a real person.
              <br />
              <span className="text-gray-600 font-light">Close faster.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-700 max-w-2xl leading-relaxed">
              Find the right point of contact by role, then call or WhatsApp instantly—no forms, no delays.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Talk to sales
              </Link>
              <a
                href="#team"
                className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-gray-900 font-semibold border border-white/60 backdrop-blur transition"
              >
                Browse team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section id="team" className="sticky top-16 lg:top-20 z-40 bg-white/85 backdrop-blur-xl border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="Search name, role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />

                {search && (
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
              <p className="mt-2 text-xs text-gray-500">{resultsLabel}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white"
              >
                <option value="all">All roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Active only
              </label>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="name-asc">Sort: Name A–Z</option>
              </select>

              <div className="flex rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 text-sm font-semibold ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 text-sm font-semibold ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="relative py-12 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-center text-gray-600 py-20">Loading team…</p>
          ) : filteredTeam.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">No matching team members found.</p>
              <Link href="/contact" className="mt-4 inline-block text-blue-600 font-medium">
                Contact us instead →
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeam.map(person => {
                const wa = toWaLink(person.whatsapp || person.phone || '')
                const tel = toDigits(person.phone || '')

                return (
                  <div
                    key={person.id}
                    className="group rounded-3xl border border-gray-200 bg-white hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                  >
                    <button onClick={() => handleCardClick(person)} className="text-left w-full">
                      <div className="relative h-56 bg-gray-50">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                            No photo
                          </div>
                        )}
                        {person.isActive === false && (
                          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gray-900/70 text-white text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                          {person.name}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mt-1">
                          {person.role}
                        </p>
                        {person.bio && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="px-6 pb-6 flex items-center gap-3">
                      <a
                        href={tel ? `tel:${tel}` : '#'}
                        className="flex-1 text-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition"
                        onClick={(e) => { if (!tel) e.preventDefault() }}
                      >
                        Call
                      </a>

                      <a
                        href={wa || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center rounded-2xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold py-3 transition"
                        onClick={(e) => { if (!wa) e.preventDefault() }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeam.map(person => {
                const wa = toWaLink(person.whatsapp || person.phone || '')
                const tel = toDigits(person.phone || '')

                return (
                  <div
                    key={person.id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <button onClick={() => handleCardClick(person)} className="flex items-center gap-4 text-left flex-1">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-50 flex-shrink-0">
                          {person.imageUrl ? (
                            <Image src={person.imageUrl} alt={person.name} fill className="object-cover" unoptimized />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{person.name}</p>
                          <p className="text-xs font-semibold text-blue-600 uppercase truncate">{person.role}</p>
                          {person.bio && <p className="mt-1 text-sm text-gray-600 line-clamp-1">{person.bio}</p>}
                        </div>
                      </button>

                      <div className="flex gap-3 sm:justify-end">
                        <a
                          href={tel ? `tel:${tel}` : '#'}
                          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                          onClick={(e) => { if (!tel) e.preventDefault() }}
                        >
                          Call
                        </a>
                        <a
                          href={wa || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-2xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold transition"
                          onClick={(e) => { if (!wa) e.preventDefault() }}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODALS */}
      <SalespersonModal
        isOpen={modalOpen}
        salesperson={selectedPerson}
        onClose={() => setModalOpen(false)}
      />

      
    </main>
  )
}