'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from '@/components/SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

type ViewMode = 'grid' | 'list'
type SortMode = 'recommended' | 'name-asc'

function toDigits(phone?: string) {
  return (phone || '').replace(/\D/g, '')
}

function toWaLink(phone?: string) {
  const digits = toDigits(phone)
  return digits ? `https://wa.me/${digits}` : ''
}

export default function TeamPage() {
  const { salespersons, isLoading } = useSalespersons()

  const [selected, setSelected] = useState<Salesperson | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [activeOnly, setActiveOnly] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const roles = useMemo(() => {
    const s = new Set<string>()
    salespersons.forEach(p => p.role && s.add(p.role))
    return Array.from(s).sort()
  }, [salespersons])

  const team = useMemo(() => {
    const q = search.trim().toLowerCase()

    let list = salespersons.filter(p => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q)

      const matchRole = roleFilter === 'all' || p.role === roleFilter
      const matchActive = !activeOnly || p.isActive

      return matchSearch && matchRole && matchActive
    })

    if (sortMode === 'name-asc') {
      list = list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else {
      list = list.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    }

    return list
  }, [salespersons, search, roleFilter, activeOnly, sortMode])

  return (
    <main className="bg-white overflow-x-hidden">
      {/* HERO */}
      <section className="relative isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.12),transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 lg:py-36">
          <p className="inline-flex px-4 py-2 rounded-xl bg-white/80 border backdrop-blur text-xs font-bold tracking-widest uppercase">
            Team
          </p>
          <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-gray-900">
            Talk to a real person.
            <span className="block font-light text-gray-600 mt-3">
              Close faster.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-700 leading-relaxed">
            Find the right specialist and connect instantly via call or WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Contact MITC
            </Link>
            <a
              href="#team"
              className="px-6 py-3 rounded-xl bg-white/80 border backdrop-blur font-semibold text-gray-900 hover:bg-white transition"
            >
              Browse team
            </a>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section
        id="team"
        className="sticky top-16 lg:top-20 z-40 bg-white/90 backdrop-blur-xl border-y border-black/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or role…"
                  className="w-full rounded-2xl border px-4 py-3 pl-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {isLoading ? 'Loading…' : `${team.length} member(s)`}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="rounded-2xl border px-4 pr-10 py-3 text-sm bg-white"
              >
                <option value="all">All roles</option>
                {roles.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={e => setActiveOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                Active only
              </label>

              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                className="rounded-2xl border px-4 pr-10 py-3 text-sm bg-white"
              >
                <option value="recommended">Recommended</option>
                <option value="name-asc">Name A–Z</option>
              </select>

              <div className="flex rounded-2xl border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 text-sm font-semibold ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 text-sm font-semibold ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-center py-24 text-gray-600">Loading team…</p>
          ) : team.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-600">No matching team members.</p>
              <Link href="/contact" className="text-blue-600 font-medium mt-4 inline-block">
                Contact us →
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map(p => (
                <div
                  key={p.id}
                  className="group rounded-3xl border bg-white hover:shadow-xl transition overflow-hidden"
                >
                  <button
                    onClick={() => setSelected(p)}
                    className="w-full text-left"
                  >
                    <div className="relative h-56 bg-gray-50">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold uppercase text-blue-600">
                        {p.role}
                      </p>
                      {p.bio && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {p.bio}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="px-6 pb-6 flex gap-3">
                    <a
                      href={toDigits(p.phone) ? `tel:${toDigits(p.phone)}` : '#'}
                      className="flex-1 text-center rounded-2xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700"
                    >
                      Call
                    </a>
                    <a
                      href={toWaLink(p.whatsapp || p.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-2xl bg-green-50 text-green-700 py-3 text-sm font-semibold hover:bg-green-100"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {team.map(p => (
                <div
                  key={p.id}
                  className="rounded-3xl border bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition"
                >
                  <button
                    onClick={() => setSelected(p)}
                    className="flex items-center gap-4 text-left flex-1"
                  >
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100">
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs font-semibold uppercase text-blue-600 truncate">
                        {p.role}
                      </p>
                    </div>
                  </button>

                  <div className="flex gap-3">
                    <a
                      href={toDigits(p.phone) ? `tel:${toDigits(p.phone)}` : '#'}
                      className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      Call
                    </a>
                    <a
                      href={toWaLink(p.whatsapp || p.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SalespersonModal
        isOpen={!!selected}
        salesperson={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}