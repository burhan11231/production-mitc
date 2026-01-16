'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useSettings } from '@/hooks/useSettings'
import { useSalespersons } from '@/hooks/useSalespersons'
import { useReviewStats } from '@/hooks/useReviewStats'

import SalespersonModal from '@/components/SalespersonModal'
import StarRating from '@/components/StarRating'

import { Salesperson } from '@/lib/firestore-models'

/* ------------------------------------
   CONSTANTS
------------------------------------ */

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg'

const HERO_BG_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/AQMnry9yB4_29R_DPax5V1H2ceUilGvhceaQmiQctsDphQW7m3QahYtL79BgRsuXVsdthOQUvBi9_00UpP4O32Si_ptttc1.jpg'

/* ------------------------------------
   COMPONENT
------------------------------------ */

export default function AboutClient() {
  /* ------------------------------------
     DATA (CACHED BY HOOKS)
  ------------------------------------ */

  const { settings } = useSettings()
  const { salespersons } = useSalespersons()
  const { stats: reviewStats } = useReviewStats()

  /* ------------------------------------
     UI STATE
  ------------------------------------ */

  const [selected, setSelected] = useState<Salesperson | null>(null)

  /* ------------------------------------
     DERIVED DATA
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
      <section className="relative isolate overflow-hidden text-white">

        {/* Background */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={HERO_BG_IMAGE}
            alt="MITC laptop showroom background"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 -z-10 bg-black/70 lg:bg-black/60" />

        {/* Glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,113,227,0.35),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-40">

          {/* Rating badge */}
          {reviewStats && (
            <Link
              href="/ratings"
              className="inline-flex items-center gap-3 mb-10
                         px-5 py-2.5 rounded-full
                         bg-white/10 backdrop-blur
                         border border-white/20
                         hover:bg-white/15 transition"
            >
              <StarRating rating={reviewStats.averageRating} size={16} />
              <span className="text-sm font-semibold">
                {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews})
              </span>
            </Link>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            A laptop showroom built on trust
            <span className="block mt-4 text-white/70 text-2xl lg:text-3xl font-medium">
              Serving Kashmir with clarity and expertise since 2013
            </span>
          </h1>

          <p className="mt-10 text-lg text-white/80 max-w-3xl leading-relaxed">
            MITC (Mateen IT Corp) is a physical laptop showroom in Srinagar.
            We help customers understand laptops before buying through
            real inventory, transparent explanations, and experienced guidance.
          </p>

        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-28 lg:py-36 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-10">
              Built in Srinagar. Trusted across Kashmir.
            </h2>

            <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={heroImage}
                alt="MITC showroom"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:pt-16">
            <p className="text-lg text-gray-700 mb-6">
              MITC started in Maisuma, Srinagar, with one belief:
              customers deserve clarity before spending their money.
            </p>

            <p className="text-lg text-gray-700 mb-6">
              Over the years, students, professionals, and offices relied on us
              to understand diagnostics, upgrades, repairs, and long-term value.
            </p>

            <p className="text-lg text-gray-700">
              Today, MITC combines a physical showroom with a digital platform
              so customers can explore confidently before visiting.
            </p>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleTeam.map(person => {
                const initials = person.name
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)

                const bioWords = person.bio.split(' ')
                const shortBio =
                  bioWords.length > 15
                    ? bioWords.slice(0, 15).join(' ') + '…'
                    : person.bio

                return (
                  <div
                    key={person.id}
                    className="rounded-2xl border p-6 hover:shadow-xl transition"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                        {person.imageUrl ? (
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

                      <div>
                        <p className="font-bold text-gray-900">{person.name}</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {person.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {shortBio}
                    </p>

                    <button
                      onClick={() => setSelected(person)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Learn more →
                    </button>
                  </div>
                )
              })}
            </div>

          </div>
        </section>
      )}

      {/* ================= MODAL ================= */}
      <SalespersonModal
        isOpen={!!selected}
        salesperson={selected}
        onClose={() => setSelected(null)}
      />

    </main>
  )
}