'use client'

import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from '@/components/SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

/* ------------------------------------
   CONSTANTS
------------------------------------ */

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg'

/* ------------------------------------
   COMPONENT
------------------------------------ */

export default function AboutClient() {
  /* ------------------------------------
     ONE-TIME DATA READS (GUARDED)
  ------------------------------------ */

  // Prevent re-reads across re-renders
  const settingsFetchedRef = useRef(false)
  const salesFetchedRef = useRef(false)

  const settingsHook = useSettings()
  const salesHook = useSalespersons()

  const settings = useMemo(() => {
    if (settingsFetchedRef.current) return settingsHook.settings
    settingsFetchedRef.current = true
    return settingsHook.settings
  }, [settingsHook.settings])

  const salespersons = useMemo(() => {
    if (salesFetchedRef.current) return salesHook.salespersons
    salesFetchedRef.current = true
    return salesHook.salespersons
  }, [salesHook.salespersons])

  /* ------------------------------------
     UI STATE
  ------------------------------------ */

  const [selected, setSelected] = useState<Salesperson | null>(null)

  /* ------------------------------------
     MEMOIZED DERIVED DATA
  ------------------------------------ */

  const heroImage = useMemo(
    () =>
      settings?.featuredImageUrl ||
      settings?.logoUrl ||
      FALLBACK_IMAGE,
    [settings]
  )

  const visibleTeam = useMemo(
    () =>
      salespersons
        .filter(p => p.isActive)
        .sort((a, b) => a.order - b.order)
        .slice(0, 4),
    [salespersons]
  )

  /* ------------------------------------
     RENDER
  ------------------------------------ */

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,113,227,0.35),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-40">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            A laptop showroom built on trust
            <span className="block mt-4 text-white/60 text-2xl lg:text-3xl font-medium">
              Serving Kashmir with clarity and expertise since 2013
            </span>
          </h1>

          <p className="mt-10 text-lg text-white/75 max-w-3xl leading-relaxed">
            MITC (Mateen IT Corp) is a physical laptop showroom in Srinagar.
            We help customers understand laptops before buying — through
            real inventory, transparent explanations, and experienced guidance.
          </p>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-28 lg:py-36 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              Built in Srinagar. Trusted across Kashmir.
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MITC started in Maisuma, Srinagar, with one principle:
              customers deserve clarity before spending their money.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Over the years, students, professionals, and offices relied on us
              not just to buy laptops — but to understand diagnostics, upgrades,
              repair risks, and long-term decisions.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Today, MITC combines a physical showroom with a digital platform
              so customers can explore confidently before visiting.
            </p>
          </div>

          <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={heroImage}
              alt="MITC laptop showroom in Srinagar"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </section>

      {/* ================= PRINCIPLES ================= */}
      <section className="py-28 lg:py-36 px-6 bg-sky-50/60">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              How MITC works
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              Clear principles that guide every recommendation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Physical-first decisions',
                desc: 'Laptops should be tested and explained — not guessed from listings.',
              },
              {
                title: 'Advice before sales',
                desc: 'We recommend what fits your needs, not what sells fastest.',
              },
              {
                title: 'Real inventory',
                desc: 'Every product reflects actual showroom stock.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-1 w-12 bg-blue-600 rounded-full mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= TEAM ================= */}
      {visibleTeam.length > 0 && (
        <section className="py-28 lg:py-36 px-6 bg-white">
          <div className="max-w-7xl mx-auto">

            <div className="max-w-3xl mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                The people behind MITC
              </h2>
              <p className="mt-5 text-lg text-gray-600">
                Professionals who work directly with customers every day.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {visibleTeam.map(person => {
                const avatar = person.imageUrl || FALLBACK_IMAGE

                return (
                  <button
                    key={person.id}
                    onClick={() => setSelected(person)}
                    className="group text-left"
                  >
                    <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg mb-6">
                      <Image
                        src={avatar}
                        alt={`${person.name} – MITC specialist`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
                      {person.name}
                    </h3>

                    <p className="text-sm font-semibold text-gray-600">
                      {person.role}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Sales • diagnostics • customer guidance
                    </p>
                  </button>
                )
              })}
            </div>

          </div>
        </section>
      )}

      {/* ================= CTA ================= */}
      <section className="py-28 lg:py-36 px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Visit MITC. Ask questions. Decide with confidence.
          </h2>

          <p className="text-lg text-white/70 mb-10">
            Explore laptops or visit our Srinagar showroom — no pressure.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition"
          >
            Contact MITC
          </Link>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      <SalespersonModal
        isOpen={!!selected}
        salesperson={selected}
        onClose={() => setSelected(null)}
      />

    </main>
  )
}