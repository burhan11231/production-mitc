import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About MITC | Mateen IT Corp – Kashmir's Tech Authority Since 2013",
  description:
    "Learn about MITC (Mateen IT Corp), Kashmir’s trusted laptop sales and IT services provider since 2013. Discover our journey, values, and commitment to quality technology.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">

      {/* HERO / INTRO */}
      <section className="relative py-28 px-6 bg-[#f3f7fb]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
            About Mateen IT Corp
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05]">
            Kashmir’s Tech Authority,
            <br className="hidden sm:block" />
            built since 2013.
          </h1>

          <p className="mt-8 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
            MITC (Mateen IT Corp) is a premium laptop sales and technical services
            company based in Srinagar, serving students, professionals, offices,
            and institutions with transparency, precision, and long-term trust.
          </p>
        </div>
      </section>

      {/* STORY + TIMELINE */}
      <section className="relative py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          {/* STORY */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Our journey.
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
              Founded in 2013, Mateen IT Corp began as a focused effort to bring
              reliable laptops and honest technical guidance to customers in
              Kashmir. At a time when quality hardware and trustworthy service
              were difficult to access, MITC set out to change expectations.
            </p>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
              Over the years, we expanded from a single retail outlet into a
              trusted technology partner for individuals, businesses, and
              institutions—handling everything from laptop procurement to
              diagnostics, upgrades, and advanced logic-board repairs.
            </p>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Today, MITC stands for clean devices, clear guidance, and confident
              purchases—supported by process, not promises.
            </p>
          </div>

          {/* TIMELINE */}
          <div className="relative pl-6 border-l border-gray-200 space-y-12">

            {[
              {
                year: "2013",
                title: "Foundation",
                desc: "MITC was established in Srinagar with a focus on quality laptops and honest service.",
              },
              {
                year: "2016",
                title: "Commercial Focus",
                desc: "Shift toward business-grade and enterprise laptops for offices and professionals.",
              },
              {
                year: "2019",
                title: "Advanced Repairs",
                desc: "Introduced chip-level diagnostics, board repair, and structured service timelines.",
              },
              {
                year: "2022",
                title: "Process-Driven Sales",
                desc: "Standardized testing, pricing transparency, and customer verification checks.",
              },
              {
                year: "2025",
                title: "Second Branch",
                desc: "Expansion with an additional branch to support growing demand across Kashmir.",
              },
            ].map((item) => (
              <div key={item.year} className="relative">
                <span className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full bg-white border-4 border-[#0071e3]" />
                <div>
                  <p className="text-sm font-bold text-[#0071e3] mb-1">
                    {item.year}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative py-28 px-6 bg-[#f3f7fb]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            What we stand for.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Integrity",
                desc: "Transparent pricing, clear condition disclosure, and no hidden trade-offs.",
              },
              {
                title: "Quality",
                desc: "Only devices that pass strict diagnostics and usability checks.",
              },
              {
                title: "Expertise",
                desc: "Over a decade of hands-on experience with modern commercial hardware.",
              },
              {
                title: "Customer Trust",
                desc: "Long-term relationships over short-term sales.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY MITC */}
      <section className="relative py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-16">
            Why customers choose MITC.
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              "11+ years of proven local expertise",
              "Business-grade and commercial laptops",
              "15-day replacement warranty on eligible devices",
              "Transparent, market-aligned pricing",
              "Advanced repairs with realistic timelines",
              "Store sales and service under one roof",
            ].map((point) => (
              <div
                key={point}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0071e3]" />
                <p className="text-gray-700 text-sm sm:text-base">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Experience MITC.
          </h2>
          <p className="text-gray-300 text-lg sm:text-xl mb-10">
            Visit our showroom or speak with our team to experience a more
            transparent way to buy and service technology.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 transition"
          >
            Contact MITC
          </a>
        </div>
      </section>

    </main>
  );
}
