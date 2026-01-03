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
  const activeSalespersons = salespersons;

  useEffect(() => {
    if (indexError) setShowErrorDialog(true);
  }, [indexError]);

  const handleCardClick = (person: Salesperson) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden bg-white">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.08),transparent_55%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 border border-white/50 backdrop-blur-xl shadow-md">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#0071e3] animate-pulse" />
              <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                Our People
              </span>
            </div>

            <h1 className="mt-10 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-tight">
              Meet the team
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Our sales and support specialists are here to guide you, answer questions,
              and help you choose the right solution with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section className="relative py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Error */}
          {indexError && (
            <div className="mb-10 rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-bold text-red-900">Failed to load team members.</p>
                <p className="text-sm text-red-800">
                  This usually indicates missing Firestore indexes or permission issues.
                </p>
              </div>
              <button
                onClick={() => setShowErrorDialog(true)}
                className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                View error details
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="py-24 text-center text-gray-600 text-lg">
              Loading team…
            </div>
          ) : activeSalespersons.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-600 text-lg">
                No team members available at the moment.
              </p>
              <Link
                href="/contact"
                className="inline-block mt-4 font-semibold text-blue-600 hover:text-blue-700"
              >
                Contact us →
              </Link>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {activeSalespersons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleCardClick(person)}
                    className="group text-left rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5">
                      {person.imageUrl ? (
                        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gray-200" />
                      )}

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {person.role}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>View profile</span>
                      <span className="text-blue-600 font-medium">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ================= MODAL ================= */}
      <SalespersonModal
        isOpen={modalOpen}
        salesperson={selectedPerson}
        onClose={() => setModalOpen(false)}
      />

      {/* ================= ERROR DIALOG ================= */}
      <FirestoreErrorDialog
        error={indexError}
        projectId={projectId}
        isOpen={showErrorDialog}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </main>
  );
}