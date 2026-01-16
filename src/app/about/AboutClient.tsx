'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useSalespersons } from '@/hooks/useSalespersons'
// Removed: useReviewStats hook

import SalespersonModal from '@/components/SalespersonModal'


import { Salesperson } from '@/lib/firestore-models'

/* ------------------------------------
   CONSTANTS
------------------------------------ */

export const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg'

export const HERO_BG_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/AQMnry9yB4_29R_DPax5V1H2ceUilGvhceaQmiQctsDphQW7m3QahYtL79BgRsuXVsdthOQUvBi9_00UpP4O32Si_ptttc1.jpg'

/* ------------------------------------
   COMPONENT
------------------------------------ */

export default function AboutClient() {
  /* ------------------------------------
     DATA (CACHED AT HOOK LEVEL)
  ------------------------------------ */

  
  const { salespersons } = useSalespersons()
  // Removed: stats / reviewStats

  /* ------------------------------------
     UI STATE
  ------------------------------------ */

  const [selected, setSelected] = useState<Salesperson | null>(null)

  /* ------------------------------------
     DERIVED DATA (MEMOIZED)
  ------------------------------------ */

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
      <section className="relative isolate overflow-hidden text-white">

        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={HERO_BG_IMAGE}
            alt="MITC laptop showroom background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 -z-10 bg-black/70 lg:bg-black/60" />

        {/* Accent glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,113,227,0.35),transparent_60%)]" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-40">

          {/* NEW H2: About Us Heading */}
          <h2 className="text-blue-400 font-bold tracking-widest uppercase mb-4 text-sm sm:text-base">
            About Us
          </h2>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            A laptop showroom built on trust
            <span className="block mt-4 text-white/70 text-2xl lg:text-3xl font-medium">
              Serving Kashmir with clarity and expertise since 2013
            </span>
          </h1>

          <p className="mt-10 text-lg text-white/80 max-w-3xl leading-relaxed">
            MITC (Mateen IT Corp) is a physical laptop showroom in Srinagar.
            We help customers understand laptops before buying — through
            real inventory, transparent explanations, and experienced guidance.
          </p>

        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-28 lg:py-36 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">

          {/* LEFT: HEADING + IMAGE */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-10">
              Built in Srinagar. Trusted across Kashmir.
            </h2>

            <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://res.cloudinary.com/dlesei0kn/image/upload/file_000000002c007206b899c1acafc49775_usxp0l.png"
                alt="Stylized Srinagar illustration with circuit-board river and streets"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* RIGHT: DETAILS TEXT */}
          <div className="lg:pt-16">
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
        // Added id="team" for scroll anchoring
        <section id="team" className="py-28 lg:py-36 px-6 bg-white">
          <div className="max-w-7xl mx-auto">

            {/* SECTION HEADER */}
            <div className="max-w-3xl mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                The people behind MITC
              </h2>
              <p className="mt-5 text-lg text-gray-600">
                Professionals who work directly with customers every day.
              </p>
            </div>

            {/* TEAM GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleTeam.map(person => {
                const hasImage = !!person.imageUrl

                const initials = person.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                const bioWords = person.bio?.split(' ') || []
                const shortBio =
                  bioWords.length > 15
                    ? bioWords.slice(0, 15).join(' ') + '…'
                    : person.bio

                return (
                  <div
                    key={person.id}
                    className="group rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl transition"
                  >
                    {/* TOP ROW */}
                    <div className="flex items-center gap-4 mb-4">
                      {/* AVATAR */}
                      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {hasImage ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* NAME + ROLE */}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 leading-tight truncate">
                          {person.name}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 truncate">
                          {person.role}
                        </p>
                      </div>
                    </div>

                    {/* BIO */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 text-left">
                      {shortBio}
                    </p>

                    {/* ACTION */}
                    <button
                      onClick={() => setSelected(person)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Learn more
                      <span aria-hidden>→</span>
                    </button>
                  </div>
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* 1. Contact Button */}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition min-w-[200px]"
            >
              Contact Us
            </Link>

            {/* 2. Meet the Team Button (Scrolls to Team section) */}
            <Link
              href="#team"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-transparent border border-white/30 text-white font-bold hover:bg-white/10 transition min-w-[200px]"
            >
              Meet the Team
            </Link>
          </div>
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