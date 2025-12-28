import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MITC | Mateen IT Corp – Premium Laptop & IT Solutions Srinagar',
  description:
    "Kashmir's Tech Authority Since 2013. Professional laptop sales, repairs, and technical services in Srinagar.",
};

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* HERO */}
      <section className="relative pt-28 lg:pt-36 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-800">
              Kashmir&apos;s Tech Authority Since 2013
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Quality Laptops.
            <br />
            <span className="text-gray-500">Local Service.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base lg:text-xl text-gray-600 mb-10">
            From students to businesses, MITC delivers tested laptops, practical pricing,
            and reliable technical support across Srinagar.
          </p>

          <div className="flex justify-center">
            <Link
              href="/services"
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
            >
              Explore Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST PILLARS */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-y py-16">
          {[
            {
              title: '15-Day Replacement Warranty',
              text:
                'Every laptop includes a 15-day replacement warranty with basic testing done in front of the customer.',
            },
            {
              title: 'Fair Market Pricing',
              text:
                'Prices adjusted based on market conditions to ensure best value on imported and open-box laptops.',
            },
            {
              title: 'Experience & Trust',
              text:
                'Established in 2013 and expanded with a second branch in 2025, trusted across Kashmir.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-bold text-lg mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-6xl font-bold mb-16">
            Sales, service, and performance.
          </h2>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-3xl border hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-4">Laptop Inventory & Accessories</h3>
              <p className="text-gray-600 mb-8">
                Business-grade laptops and essential accessories for students,
                professionals, offices, and bulk buyers.
              </p>
              <ul className="grid grid-cols-2 gap-3 text-sm font-semibold">
                <li>Dell Laptops</li>
                <li>HP Laptops</li>
                <li>Acer Laptops</li>
                <li>Lenovo ThinkPad</li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-4">Repair, Service & Upgrades</h3>
              <p className="text-gray-600 mb-8">
                Diagnostics, repairs, SSD & RAM upgrades, and advanced logic-board
                servicing with 5–15 day turnaround.
              </p>
              <ul className="grid grid-cols-2 gap-3 text-sm font-semibold">
                <li>Laptop Repair</li>
                <li>SSD Upgrade</li>
                <li>RAM Upgrade</li>
                <li>Screen Replacement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-28 bg-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              Technical <span className="text-blue-600">Excellence.</span>
            </h2>
            <p className="text-gray-600 text-lg mb-12">
              Since 2013, Mateen IT Corp has built a reputation for transparency,
              reliability, and uncompromising quality in hardware and services.
            </p>

            <div className="flex gap-16 border-t pt-10">
              <div>
                <div className="text-4xl font-bold">11+</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">
                  Years Expertise
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold">5k+</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">
                  Premium Clients
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1200"
              alt="MITC Interior"
              className="w-full h-[420px] lg:h-[560px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="location" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden border shadow-xl grid lg:grid-cols-2">
          <div className="p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-8">Visit Our Showroom</h2>

            <p className="text-gray-600 mb-4">
              Gaw Kadal, Maisuma, Srinagar, J&amp;K 190001
            </p>
            <p className="font-bold text-lg mb-8">+91 80827 54459</p>

            <a
              href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
              target="_blank"
              className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition"
            >
              Open in Google Maps
            </a>
          </div>

          <iframe
            className="w-full h-[400px] lg:h-full border-0 grayscale hover:grayscale-0 transition"
            loading="lazy"
            src="https://www.google.com/maps?q=Gaw%20Kadal%20Maisuma%20Srinagar&output=embed"
          />
        </div>
      </section>
    </main>
  );
}
