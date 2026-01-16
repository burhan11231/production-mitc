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

  {/* BACKGROUND IMAGE (RIGHT-FOCUSED) */}
  <div
    className="absolute inset-0 bg-right bg-cover bg-no-repeat"
    style={{
      backgroundImage:
        "url('https://res.cloudinary.com/dlesei0kn/image/upload/file_00000000fa887209b3d7cd4ca3059587_dxbu8m.png')",
    }}
  />

  {/* LEFT DEPTH MASK */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />

  {/* TOP / BOTTOM FADE */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

  {/* STRUCTURE GRID (VERY SUBTLE) */}
  <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:96px_96px]" />

  {/* ACCENT GLOW */}
  <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_18%_35%,rgba(0,113,227,0.35),transparent_65%)]" />

  {/* CONTENT */}
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

      {/* CTA */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <a
          href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition shadow-lg"
        >
          Get directions →
        </a>

        <a
          href="/team"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-bold hover:bg-white/10 transition"
        >
          Meet our team
        </a>
      </div>

    </div>
  </div>
</section>

      {/* ================= SERVICE OVERVIEW ================= */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              What we help you with
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Practical services designed for students, professionals, and businesses.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Laptop Sales',
                desc: 'Commercial-grade laptops with verified condition and specifications.',
              },
              {
                title: 'Repairs & Diagnostics',
                desc: 'Honest diagnostics performed transparently, often in front of you.',
              },
              {
                title: 'Upgrades & Performance',
                desc: 'RAM, SSD, OS, and thermal upgrades to extend device lifespan.',
              },
              {
                title: 'Business IT Support',
                desc: 'Guidance and maintenance support for offices and professionals.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all"
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

      {/* ================= LAPTOP SALES ================= */}
      <section className="py-24 lg:py-32 px-6 bg-sky-50/60">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Laptop sales (in-store)
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MITC specializes in commercial-grade laptops suitable for
              students, professionals, and office environments.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• Refurbished and pre-owned business laptops</li>
              <li>• Clear specifications and condition disclosure</li>
              <li>• Upgrade recommendations before purchase</li>
              <li>• Physical testing before you decide</li>
            </ul>

            <p className="mt-6 text-sm text-gray-500">
              No online checkout. Visit, test, and choose with confidence.
            </p>
          </div>

        </div>
      </section>

      {/* ================= REPAIRS & DIAGNOSTICS ================= */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Repairs & diagnostics
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We believe in diagnosing first, repairing only when it makes sense.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• Hardware diagnostics</li>
              <li>• Chip-level repair</li>
              <li>• Screen and battery replacement</li>
              <li>• Keyboard, ports, and motherboard fixes</li>
              <li>• BIOS and firmware issues</li>
            </ul>

            <p className="mt-6 text-sm text-gray-500">
              If repair is not worth it, we tell you upfront.
            </p>
          </div>

        </div>
      </section>

      {/* ================= UPGRADES ================= */}
      <section className="py-24 lg:py-32 px-6 bg-sky-50/60">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Upgrades & performance optimization
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Often, a smart upgrade delivers better value than replacement.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• RAM upgrades</li>
              <li>• SSD upgrades</li>
              <li>• OS installation and optimization</li>
              <li>• Thermal servicing and cleaning</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= BUSINESS IT ================= */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Business & professional IT support
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              MITC works with offices and professionals who need reliable,
              long-term IT support.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• Office laptop consultation</li>
              <li>• Bulk diagnostics and upgrades</li>
              <li>• Maintenance and support guidance</li>
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