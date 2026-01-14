'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from '@/components/SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg'

export default function AboutClient() {
  const { settings } = useSettings()
  const { salespersons } = useSalespersons()
  const [selected, setSelected] = useState<Salesperson | null>(null)

  const heroImage =
    settings?.featuredImageUrl ||
    settings?.logoUrl ||
    FALLBACK_IMAGE

  const visibleTeam = salespersons
    .filter(p => p.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4)

  return (
    <main className="bg-white overflow-x-hidden">
         {/* ================= HERO ================= */}
      <section className="relative bg-gray-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,113,227,0.25),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 lg:py-36">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase">
            About MITC
          </span>

          <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Trusted laptop showroom in Srinagar
            <span className="block mt-3 text-white/60 text-2xl lg:text-3xl font-medium">
              Serving Kashmir with clarity and confidence since 2013
            </span>
          </h1>

          <p className="mt-8 text-lg text-white/70 max-w-3xl leading-relaxed">
            Mateen IT Corp (MITC) is a professional laptop showroom based in
            Srinagar, Jammu & Kashmir. We help students, professionals, and
            businesses choose the right laptops through transparent information,
            real inventory, and direct expert guidance.
          </p>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Our journey in Kashmir
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MITC started as a physical laptop showroom in Maisuma, Srinagar,
              focused on honest advice and long-term trust rather than quick sales.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Over the years, customers across Kashmir trusted us for laptop
              diagnostics, upgrades, repairs, and guidance. As demand grew,
              we expanded digitally to help people explore options before
              visiting the store.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Today, MITC combines a physical showroom with a digital platform—
              offering clarity, transparency, and confidence at every step.
            </p>
          </div>

          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
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

      {/* ================= VALUE PROPOSITION ================= */}
      <section className="py-24 lg:py-32 px-6 bg-sky-50/60">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Why customers choose MITC
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built for people who value clarity before purchase.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Physical showroom in Srinagar',
                desc:
                  'Visit, test, and understand laptops in person—no blind online purchases.'
              },
              {
                title: 'Expert laptop guidance',
                desc:
                  'Get advice from experienced professionals, not automated recommendations.'
              },
              {
                title: 'Transparent inventory',
                desc:
                  'Every product listed reflects actual showroom stock with clear specifications.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all"
              >
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
        <section className="py-24 lg:py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">

            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Meet our team
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Local experts who understand real-world requirements.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {visibleTeam.map(person => {
                const avatar = person.imageUrl || FALLBACK_IMAGE

                return (
                  <button
                    key={person.id}
                    onClick={() => setSelected(person)}
                    className="text-left group"
                  >
                    <div className="relative h-64 rounded-3xl overflow-hidden bg-gray-100 shadow-lg mb-5">
                      <Image
                        src={avatar}
                        alt={`${person.name} - MITC laptop expert`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {person.name}
                    </h3>
                    <p className="text-gray-500 font-medium">
                      {person.role}
                    </p>
                  </button>
                )
              })}
            </div>

          </div>
        </section>
      )}

      {/* ================= CTA ================= */}
      <section className="py-24 lg:py-32 px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Visit MITC or talk to an expert today
          </h2>

          <p className="text-lg text-white/70 mb-10">
            Explore laptops, ask questions, or visit our Srinagar showroom.
            We help you decide—without pressure.
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