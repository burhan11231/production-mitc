import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About MITC | Mateen IT Corp – Kashmir's Tech Authority Since 2013",
  description:
    "Learn about MITC (Mateen IT Corp), Kashmir's trusted laptop sales and IT services provider since 2013. Discover our journey, values, and commitment to quality technology.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe] overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0071e3]/5 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0071e3]/5 rounded-full blur-xl" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-white/60 mb-6 md:mb-8 shadow-lg w-fit mx-auto">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-600">
              About Mateen IT Corp
            </p>
          </div>

          {/* HERO HEADING (UPDATED) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] md:leading-[1.05] mb-6 md:mb-8">
            <span className="block">About MITC</span>
            <span className="block bg-gradient-to-r from-[#0071e3] via-[#0071e3] to-[#00aaff] bg-clip-text text-transparent">
              Built on trust, expertise, and transparent technology.
            </span>
          </h1>

          {/* Hero Description */}
          <p className="mt-6 md:mt-8 max-w-2xl sm:max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-2">
            MITC (Mateen IT Corp) is a premium laptop sales and technical services
            company based in Srinagar, serving students, professionals, offices,
            and institutions with precision, honesty, and long-term reliability.
          </p>
        </div>
      </section>

      {/* STORY + TIMELINE */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto space-y-16 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-start">
          {/* STORY */}
          <div className="space-y-6 lg:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#0071e3]/10 to-[#00aaff]/10 rounded-2xl border border-[#0071e3]/20">
              <span className="w-2 h-2 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full" />
              Our journey.
            </h2>

            <div className="space-y-5 md:space-y-6">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-lg">
                Founded in 2013, Mateen IT Corp began with a simple goal: make
                reliable laptops and honest technical guidance accessible in
                Kashmir when quality hardware was hard to find.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-lg">
                From a single outlet, MITC evolved into a trusted technology
                partner for individuals, businesses, and institutions—covering
                procurement, diagnostics, upgrades, and advanced logic-board
                repairs.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-lg">
                Today, our reputation is built on clean devices, clear guidance,
                and confidence backed by process—not promises.
              </p>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="relative space-y-8 lg:space-y-12">
            <div className="lg:pl-12 border-l lg:border-l-4 border-gray-200">
              {[
                { year: "2013", title: "Foundation", desc: "MITC was established in Srinagar with a focus on quality laptops and honest service." },
                { year: "2016", title: "Commercial Focus", desc: "Shift toward business-grade and enterprise laptops for offices and professionals." },
                { year: "2019", title: "Advanced Repairs", desc: "Introduced chip-level diagnostics and structured service timelines." },
                { year: "2022", title: "Process-Driven Sales", desc: "Standardized testing, pricing transparency, and verification checks." },
                { year: "2025", title: "Expansion", desc: "Second branch opened to support growing demand across Kashmir." },
              ].map((item) => (
                <div key={item.year} className="relative pb-8 lg:pb-12 last:pb-0">
                  <div className="absolute left-0 lg:-left-7 top-4 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full border-4 border-white shadow-lg z-10" />
                  <div className="lg:pl-10 bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-lg">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0071e3] mb-2">
                      {item.year}
                    </p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
              What we stand for.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {[
              { title: "Integrity", desc: "Transparent pricing and honest condition disclosure." },
              { title: "Quality", desc: "Only devices that pass strict diagnostics." },
              { title: "Expertise", desc: "Decade-long experience with commercial hardware." },
              { title: "Trust", desc: "Long-term relationships over quick sales." },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-3xl p-6 md:p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-white/60"
              >
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            Experience MITC.
          </h2>
          <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Visit our showroom or speak with our team to experience a clearer,
            more dependable way to buy and service technology.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-5 rounded-3xl bg-white text-gray-900 font-bold shadow-xl hover:-translate-y-1 transition"
          >
            Contact MITC
          </a>
        </div>
      </section>
    </main>
  );
}
