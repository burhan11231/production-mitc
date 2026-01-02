// src/app/team/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSalespersons } from '@/hooks/useSalespersons';
import SalespersonModal from '@/components/SalespersonModal';
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog';
import { Salesperson } from '@/lib/firestore-models';
import Link from 'next/link';

export default function TeamPage() {
  const { salespersons, isLoading, indexError } = useSalespersons();
  const [selectedPerson, setSelectedPerson] = useState<Salesperson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const activeSalespersons = salespersons.filter((p) => p.isActive);

  // Auto-open error dialog when indexError occurs
  useEffect(() => {
    if (indexError) {
      setShowErrorDialog(true);
    }
  }, [indexError]);

  const handleCardClick = (person: Salesperson) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION */}
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

            <div className="mt-16 lg:mt-24">
              <div className="rounded-3xl overflow-hidden border border-gray-200/50 bg-white/70 backdrop-blur-xl shadow-2xl">
                <div className="p-8 lg:p-12">
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">
                    Dedicated professionals ready to help you find the perfect solutions for your IT needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM GRID */}
      <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* ERROR BANNER */}
          {indexError && (
            <div className="mb-12 bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h3 className="font-bold text-red-900 text-2xl mb-3 flex items-center gap-2">
                    ⚠️ Database Index Required
                  </h3>
                  <p className="text-red-800 text-lg">
                    A Firestore composite index is required to load the team members. Click the button to create it in Firebase Console.
                  </p>
                </div>
                <button
                  onClick={() => setShowErrorDialog(true)}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  🔧 Create Index
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Loading team...</p>
            </div>
          ) : activeSalespersons.length === 0 && !indexError ? (
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

                    {person.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {person.bio}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={`tel:${person.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Call"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>

                      <a
                        href={`mailto:${person.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Email"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>

                      <a
                        href={`https://wa.me/${person.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </a>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        Click to view details →
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-24 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to work with us?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Reach out to any team member directly or contact us through our main contact form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      <SalespersonModal isOpen={modalOpen} salesperson={selectedPerson} onClose={() => setModalOpen(false)} />
      
      <FirestoreErrorDialog
        error={indexError}
        projectId={projectId}
        isOpen={showErrorDialog}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </main>
  );
}
