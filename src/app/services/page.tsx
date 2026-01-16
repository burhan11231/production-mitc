import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services | Laptop Sales, Repairs & IT Support in Srinagar – MITC',
  description:
    'Explore MITC services in Srinagar: laptop sales, diagnostics, repairs, upgrades, and professional IT support. Transparent guidance and in-store service since 2013.',
  openGraph: {
    title: 'MITC Services – Laptop Sales & Repairs in Srinagar',
    description:
      'Professional laptop sales, repairs, upgrades, and IT support at MITC Srinagar. Transparent diagnostics and expert guidance since 2013.',
    type: 'website',
    url: 'https://mitck.netlify.app/services',
    siteName: 'MITC Srinagar',
    images: [
      {
        url: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
        width: 1200,
        height: 630,
        alt: 'MITC Srinagar Laptop Services',
      },
    ],
  },
};

export default function ServicesPage() {
  return (
    <main className="overflow-x-hidden bg-white">

      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">

        {/* Preload hint for LCP */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dlesei0kn/image/upload/file_00000000fa887209b3d7cd4ca3059587_dxbu8m.png"
        />

        {/* Background image */}
        <div
          className="absolute inset-0 bg-right bg-cover bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dlesei0kn/image/upload/file_00000000fa887209b3d7cd4ca3059587_dxbu8m.png')",
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:96px_96px]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_18%_35%,rgba(0,113,227,0.35),transparent_65%)]" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-36 lg:py-44">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Laptop sales,<br />
              repairs & IT services
            </h1>

            <p className="mt-8 text-lg text-white/75 leading-relaxed max-w-2xl">
              Transparent laptop sales, professional diagnostics, upgrades,
              and long-term IT support — delivered from our physical showroom
              in Srinagar. We explain first. You decide.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a
                href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get directions to MITC Srinagar"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Get directions →
              </a>

              <Link
                href="/team"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-bold hover:bg-white/10 transition"
              >
                Meet our team
              </Link>
            </div>
          </div>
        </div>
      </section>

            {/* ================= SERVICE OVERVIEW ================= */}
<section className="relative py-28 lg:py-36 bg-white">
  <div className="max-w-7xl mx-auto px-6">

    {/* Section header */}
    <div className="max-w-3xl mb-20">
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
        What we actually do
      </h2>
      <p className="mt-5 text-lg text-gray-600 leading-relaxed">
        Practical, in-store services designed around real usage — not upselling.
      </p>
    </div>

    {/* Capability grid */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          title: 'Laptop Sales',
          desc: 'Business-class laptops with verified condition, specs, and upgrade clarity.',
        },
        {
          title: 'Diagnostics & Repair',
          desc: 'Transparent fault analysis before any repair decision is made.',
        },
        {
          title: 'Upgrades',
          desc: 'Performance-focused RAM, SSD, OS, and thermal improvements.',
        },
        {
          title: 'IT Support',
          desc: 'Long-term guidance for professionals and offices.',
        },
      ].map((item, i) => (
        <div
          key={i}
          className="relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-lg"
        >
          <div className="h-1 w-12 bg-blue-600 mb-6 rounded-full" />

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

      {/* ================= LAPTOP SALES ================= */}
<section className="relative py-28 lg:py-36 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">

    <div>
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8">
        Laptop sales — in store
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed mb-10">
        We sell laptops the way we’d recommend to ourselves — verified,
        explainable, and testable before purchase.
      </p>

      <ul className="space-y-4 text-gray-700 text-base">
        <li>• Refurbished & pre-owned business laptops</li>
        <li>• Condition, battery health, and specs explained clearly</li>
        <li>• Upgrade advice before you commit</li>
        <li>• Hands-on testing in-store</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">
        No online checkout. No pressure. Visit, inspect, and decide.
      </p>
    </div>

  </div>
</section>

      {/* ================= REPAIRS & DIAGNOSTICS ================= */}
<section className="relative py-28 lg:py-36 bg-white">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">

    <div>
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8">
        Repairs & diagnostics
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed mb-10">
        We diagnose first. If a repair doesn’t make sense, we say so.
      </p>

      <ul className="space-y-4 text-gray-700">
        <li>• Full hardware diagnostics</li>
        <li>• Chip-level repair (when viable)</li>
        <li>• Screen, battery, keyboard replacement</li>
        <li>• Port, power, and motherboard faults</li>
        <li>• BIOS & firmware issues</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">
        No unnecessary work. No vague answers.
      </p>
    </div>

  </div>
</section>

      {/* ================= UPGRADES ================= */}
<section className="relative py-28 lg:py-36 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">

    <div>
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8">
        Upgrades & performance
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed mb-10">
        Often, a focused upgrade delivers better results than buying new.
      </p>

      <ul className="space-y-4 text-gray-700">
        <li>• RAM expansion</li>
        <li>• SSD upgrades</li>
        <li>• OS installation & tuning</li>
        <li>• Thermal cleaning & servicing</li>
      </ul>
    </div>

  </div>
</section>


{/* ================= BUSINESS IT ================= */}
<section className="relative py-28 lg:py-36 bg-white">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">

    <div>
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8">
        Business & professional IT support
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed mb-10">
        We support professionals and offices that need consistency,
        not one-time fixes.
      </p>

      <ul className="space-y-4 text-gray-700">
        <li>• Office laptop consultation</li>
        <li>• Bulk diagnostics & upgrades</li>
        <li>• Maintenance planning</li>
        <li>• Requirement-based solutions</li>
      </ul>
    </div>

  </div>
</section>

      {/* ================= CTA ================= */}
      <section className="py-24 lg:py-32 px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Need help with a laptop?
          </h2>

          <p className="text-lg text-white/70 mb-10">
            Visit our Srinagar showroom or talk to an expert before deciding.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition"
            >
              Contact MITC
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full border border-white/30 text-white font-bold hover:bg-white/10 transition"
            >
              Learn about MITC
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}