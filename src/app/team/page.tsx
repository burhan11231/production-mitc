'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSalespersons } from '@/hooks/useSalespersons';
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog';
import SalespersonModal from '@/components/SalespersonModal';
import { Salesperson } from '@/lib/firestore-models';

export default function TeamPage() {
  const { salespersons, isLoading, indexError } = useSalespersons();
  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const activeSalespersons = salespersons.filter((p) => p.isActive);

  useEffect(() => {
    if (indexError) setShowErrorDialog(true);
  }, [indexError]);

  const handleCardClick = (person: Salesperson) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[60vh] overflow-hidden flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.08),transparent_55%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-4xl pt-20 lg:pt-32">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 border border-white/50 backdrop-blur-xl shadow-xl">
              <span className="flex h-3 w-3 rounded-full bg-[#0071e3] animate-pulse shadow-lg" />
              <span className="text-sm lg:text-base font-bold text-gray-900 tracking-widest uppercase">
                Meet Our Team
              </span>
            </div>

            <h1 className="mt-12 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 leading-[0.95] bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent">
              Expert Sales
              <span className="block mt-4 text-3xl sm:text-5xl lg:text-6xl font-light text-gray-600">
                & Support Team
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* TEAM GRID */}
      <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {indexError && (
            <div className="mb-10 bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-bold text-red-900">Failed to load team.</p>
                <p className="text-red-800 text-sm">This is usually Firestore rules or missing index.</p>
              </div>
              <button
                onClick={() => setShowErrorDialog(true)}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                View error details
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Loading team...</p>
            </div>
          ) : activeSalespersons.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No team members available yet</p>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block">
                Contact us anyway →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeSalespersons.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleCardClick(person)}
                  className="group relative rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden text-left"
                >
                  {person.imageUrl && (
                    <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      <Image
                        src={person.imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {person.name}
                    </h3>
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
                      {person.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

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