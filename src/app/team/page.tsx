'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSalespersons } from '@/hooks/useSalespersons';
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog';
import SalespersonModal from '@/components/SalespersonModal';
import { Salesperson } from '@/lib/firestore-models';

type ViewMode = 'grid' | 'list';

export default function TeamPage() {
  const { salespersons, isLoading, indexError } = useSalespersons();

  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    if (indexError) setShowErrorDialog(true);
  }, [indexError]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    salespersons.forEach(p => p.role && set.add(p.role));
    return Array.from(set);
  }, [salespersons]);

  const filteredTeam = useMemo(() => {
    return salespersons.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.role || '').toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'all' || p.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [salespersons, search, roleFilter]);

  const handleCardClick = (person: Salesperson) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[55vh] flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.08),transparent_55%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 backdrop-blur font-bold tracking-widest uppercase text-sm text-gray-900">
              Our Team
            </p>

            <h1 className="mt-10 text-5xl sm:text-7xl font-black tracking-tight text-gray-900 leading-[0.95]">
              Experts you can<br />
              <span className="text-gray-600 font-light">
                talk to directly
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ================= CONTROLS ================= */}
      <section className="relative py-10 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:max-w-sm rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white"
            >
              <option value="all">All roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex rounded-xl border border-gray-300 overflow-hidden">
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
      </section>

      {/* ================= TEAM RESULTS ================= */}
      <section className="relative py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-center text-gray-600 py-20">
              Loading team…
            </p>
          ) : filteredTeam.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">
                No matching team members found.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-block text-blue-600 font-medium"
              >
                Contact us instead →
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeam.map(person => (
                <button
                  key={person.id}
                  onClick={() => handleCardClick(person)}
                  className="group rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all hover:-translate-y-1 text-left"
                >
                  {person.imageUrl && (
                    <div className="relative h-56 overflow-hidden rounded-t-2xl">
                      <Image
                        src={person.imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                      {person.name}
                    </h3>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mt-1">
                      {person.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeam.map(person => (
                <button
                  key={person.id}
                  onClick={() => handleCardClick(person)}
                  className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition text-left"
                >
                  {person.imageUrl && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full flex-shrink-0">
                      <Image
                        src={person.imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">
                      {person.name}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 uppercase">
                      {person.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= MODALS ================= */}
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