'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'
import { useSalespersons } from '@/hooks/useSalespersons'
import SalespersonModal from '@/components/SalespersonModal'
import { Salesperson } from '@/lib/firestore-models'

export default function AboutPage() {
  const { settings } = useSettings()
  const { salespersons } = useSalespersons()

  const [selected, setSelected] = useState<Salesperson | null>(null)

  const visibleTeam = salespersons
    .filter(p => p.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4)

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.08),transparent_55%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 border backdrop-blur shadow">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-bold tracking-widest uppercase">
                About MITC
              </span>
            </span>

            <h1 className="mt-10 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900">
              A Digital Showroom
              <span className="block mt-4 text-3xl lg:text-4xl font-light text-gray-600">
                Built on Trust, Not Transactions
              </span>
            </h1>

            <p className="mt-10 text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl">
              MITC (Mateen IT Corp) was created to bring transparency, clarity,
              and human guidance back into laptop buying—online and offline.
              We are not an e-commerce store. We are a showroom experience.
            </p>
          </div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Our Story
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MITC began as a physical laptop showroom in Maisuma, Srinagar,
              serving customers who valued honest advice over aggressive sales.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              As demand grew, we saw the same need online—buyers wanted clarity
              before stepping into a store. That led to our digital showroom:
              explore stock, compare specifications, read real reviews, and
              contact real people directly.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Today, MITC blends physical presence with digital transparency.
              One platform for discovery. One showroom for assurance.
            </p>
          </div>

          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={settings?.featuredImageUrl || settings?.logoUrl}
              alt="MITC Showroom"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================= WHAT MAKES US DIFFERENT ================= */}
      <section className="py-28 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            What Makes MITC Different
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
          {[
            {
              title: 'A Showroom, Not E-commerce',
              desc:
                'No carts. No instant checkout. No misleading urgency. Customers explore, compare, and then talk to experts.'
            },
            {
              title: 'Direct Human Communication',
              desc:
                'Contact multiple salespersons directly. Faster answers. Better guidance. Real conversations.'
            },
            {
              title: 'Built on Trust',
              desc:
                'Every product reflects actual showroom stock. No automated listings. No hidden conditions.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="p-10 bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TEAM ================= */}
      {visibleTeam.length > 0 && (
        <section className="py-28 px-6 bg-white">
          <div className="max-w-6xl mx-auto text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Real people. Real guidance. No scripts.
            </p>
          </div>

          <div
            className={`max-w-6xl mx-auto flex flex-wrap justify-between gap-10 ${
              visibleTeam.length === 1 ? 'justify-center' : ''
            }`}
          >
            {visibleTeam.map(person => (
              <button
                key={person.id}
                onClick={() => setSelected(person)}
                className="group w-full sm:w-[48%] lg:w-[22%] text-center"
              >
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg mb-6 bg-slate-100">
                  <Image
                    src={person.imageUrl}
                    alt={person.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {person.name}
                </h3>
                <p className="text-gray-500 font-medium mt-1">
                  {person.role}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================= CONTACT CTA ================= */}
      <section className="py-28 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Need Help Choosing the Right Laptop?
          </h2>
          <p className="text-lg text-white/80 mb-12">
            Explore options, ask questions, or visit our showroom.
            We’re here to help—without pressure.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Contact Us
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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