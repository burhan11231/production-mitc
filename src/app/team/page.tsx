'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSalespersons } from '@/hooks/useSalespersons';
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog';
import SalespersonModal from '@/components/SalespersonModal';
import { Salesperson } from '@/lib/firestore-models';

type ViewMode = 'grid' | 'list';
type SortMode = 'recommended' | 'az';

function cleanPhoneForWa(phone: string) {
  return phone.replace(/D/g, '');
}

function toWhatsAppLink(person: Salesperson) {
  const raw = person.whatsapp || person.phone || '';
  if (!raw) return '';
  if (raw.includes('wa.me')) return raw;
  return `https://wa.me/${cleanPhoneForWa(raw)}`;
}

export default function TeamPage() {
  const { salespersons, isLoading, indexError } = useSalespersons();

  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    if (indexError) setShowErrorDialog(true);
  }, [indexError]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    salespersons.forEach((p) => p.role && set.add(p.role));
    return Array.from(set);
  }, [salespersons]);

  const filteredTeam = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = salespersons.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.role || '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const matchesActive = !activeOnly || !!p.isActive;

      return matchesSearch && matchesRole && matchesActive;
    });

    const sorted = [...base].sort((a, b) => {
      if (sortMode === 'az') return a.name.localeCompare(b.name);
      // recommended: active first, then order asc
      const aActive = a.isActive ? 0 : 1;
      const bActive = b.isActive ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (a.order ?? 9999) - (b.order ?? 9999);
    });

    return sorted;
  }, [salespersons, search, roleFilter, activeOnly, sortMode]);

  const handleOpen = (person: Salesperson) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden bg-white">
      {/* HERO */}
      <section className="relative min-h-[58vh] flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.10),transparent_55%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-12">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 backdrop-blur font-bold tracking-widest uppercase text-sm text-gray-900">
              Team Directory
            </p>

            <h1 className="mt-8 text-5xl sm:text-7xl font-black tracking-tight text-gray-900 leading-[0.95]">
              Talk to the right expert,
              <br />
              <span className="text-gray-600 font-light">in one click</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-700 max-w-2xl">
              Choose Sales, Support, or Management and contact instantly via Call, WhatsApp, or Email.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-white/80 border border-white/60 text-xs font-semibold text-gray-700">
                Direct calling
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/80 border border-white/60 text-xs font-semibold text-gray-700">
                WhatsApp chat
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/80 border border-white/60 text-xs font-semibold text-gray-700">
                Verified contacts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="relative py-8 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search by name or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:max-w-lg rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Active only
              </label>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white"
              >
                <option value="recommended">Recommended</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between lg:justify-end">
            <div className="text-sm text-gray-500">
              {isLoading ? 'Loading…' : `${filteredTeam.length} members`}
            </div>

            <div className="flex rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 text-sm font-semibold ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 text-sm font-semibold ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                List
              </button>
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
              <p className="text-gray-900 font-bold text-xl">No matching team members.</p>
              <p className="text-gray-600 mt-2">
                Try removing filters, or contact the company directly.
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">
                Contact us
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredTeam.map((person) => {
                const wa = toWhatsAppLink(person);
                const hasPhone = !!person.phone;
                const hasEmail = !!person.email;

                return (
                  <div
                    key={person.id}
                    className="group rounded-3xl border border-gray-200 bg-white overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <button
                      onClick={() => handleOpen(person)}
                      className="w-full text-left"
                      aria-label={`Open ${person.name} details`}
                    >
                      <div className="relative h-56 bg-gray-100">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            No photo
                          </div>
                        )}

                        {!person.isActive && (
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white">
                            Offline
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-black tracking-tight text-gray-900 group-hover:text-blue-700">
                          {person.name}
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mt-1">
                          {person.role}
                        </p>

                        {person.bio && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Quick actions */}
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={hasPhone ? `tel:${person.phone}` : '#'}
                          aria-disabled={!hasPhone}
                          className={`rounded-2xl px-3 py-2 text-sm font-bold text-center transition ${
                            hasPhone
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                          }`}
                        >
                          Call
                        </a>

                        <a
                          href={wa || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!wa}
                          className={`rounded-2xl px-3 py-2 text-sm font-bold text-center transition ${
                            wa
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                          }`}
                        >
                          WhatsApp
                        </a>

                        <a
                          href={hasEmail ? `mailto:${person.email}` : '#'}
                          aria-disabled={!hasEmail}
                          className={`rounded-2xl px-3 py-2 text-sm font-bold text-center transition ${
                            hasEmail
                              ? 'bg-gray-900 text-white hover:bg-black'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                          }`}
                        >
                          Email
                        </a>
                      </div>

                      <button
                        onClick={() => handleOpen(person)}
                        className="mt-3 w-full rounded-2xl px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 text-gray-800"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeam.map((person) => {
                const wa = toWhatsAppLink(person);
                return (
                  <div
                    key={person.id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpen(person)}
                        className="flex items-center gap-4 text-left flex-1"
                      >
                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {person.imageUrl ? (
                            <Image src={person.imageUrl} alt={person.name} fill className="object-cover" unoptimized />
                          ) : null}
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-gray-900 truncate">{person.name}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mt-1">
                            {person.role}
                          </p>
                        </div>
                      </button>

                      <div className="hidden sm:flex items-center gap-2">
                        <a className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-bold hover:bg-blue-700" href={`tel:${person.phone}`}>
                          Call
                        </a>
                        <a className="rounded-xl bg-green-600 text-white px-3 py-2 text-sm font-bold hover:bg-green-700" href={wa} target="_blank" rel="noopener noreferrer">
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="sm:hidden grid grid-cols-3 gap-2 mt-4">
                      <a className="rounded-2xl bg-blue-600 text-white px-3 py-2 text-sm font-bold text-center" href={`tel:${person.phone}`}>
                        Call
                      </a>
                      <a className="rounded-2xl bg-green-600 text-white px-3 py-2 text-sm font-bold text-center" href={wa} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                      <button onClick={() => handleOpen(person)} className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-bold text-center">
                        Details
                      </button>
                    </div>
                  </div>
                );
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

      <FirestoreErrorDialog
        error={indexError}
        projectId={projectId}
        isOpen={showErrorDialog}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </main>
  );
}