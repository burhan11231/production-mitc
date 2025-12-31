import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About MITC | Mateen IT Corp – Kashmir's Tech Authority Since 2013",
  description:
    "Learn about MITC (Mateen IT Corp), Kashmir's trusted laptop sales and IT services provider since 2013. Discover our journey, values, and commitment to quality technology.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION - Fixed Mobile Layout */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe] overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0071e3]/5 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0071e3]/5 rounded-full blur-xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          {/* Tag - Fixed Positioning */}
          <div className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-white/60 mb-6 md:mb-8 shadow-lg w-fit mx-auto">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-600">
              About Mateen IT Corp
            </p>
          </div>

          {/* Hero Title - Fixed Breakpoints */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] md:leading-[1.05] mb-6 md:mb-8">
            <span className="block">Kashmir's Tech Authority,</span>
            <span className="block md:inline bg-gradient-to-r from-[#0071e3] via-[#0071e3] to-[#00aaff] bg-clip-text text-transparent">
              built since 2013.
            </span>
          </h1>

          {/* Hero Description - Proper Mobile Width */}
          <p className="mt-6 md:mt-8 max-w-2xl sm:max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-2">
            MITC (Mateen IT Corp) is a premium laptop sales and technical services
            company based in Srinagar, serving students, professionals, offices,
            and institutions with transparency, precision, and long-term trust.
          </p>
        </div>
      </section>

      {/* STORY + TIMELINE - Mobile Stacked */}
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
                Founded in 2013, Mateen IT Corp began as a focused effort to bring
                reliable laptops and honest technical guidance to customers in
                Kashmir. At a time when quality hardware and trustworthy service
                were difficult to access, MITC set out to change expectations.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-lg">
                Over the years, we expanded from a single retail outlet into a
                trusted technology partner for individuals, businesses, and
                institutions—handling everything from laptop procurement to
                diagnostics, upgrades, and advanced logic-board repairs.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-lg">
                Today, MITC stands for clean devices, clear guidance, and confident
                purchases—supported by process, not promises.
              </p>
            </div>
          </div>

          {/* TIMELINE - Mobile Vertical Stack */}
          <div className="relative space-y-8 lg:space-y-12">
            <div className="lg:pl-12 border-l lg:border-l-4 border-gray-200 lg:border-gradient-to-b from-[#0071e3] to-[#00aaff]">
              {[
                { year: "2013", title: "Foundation", desc: "MITC was established in Srinagar with a focus on quality laptops and honest service." },
                { year: "2016", title: "Commercial Focus", desc: "Shift toward business-grade and enterprise laptops for offices and professionals." },
                { year: "2019", title: "Advanced Repairs", desc: "Introduced chip-level diagnostics, board repair, and structured service timelines." },
                { year: "2022", title: "Process-Driven Sales", desc: "Standardized testing, pricing transparency, and customer verification checks." },
                { year: "2025", title: "Second Branch", desc: "Expansion with an additional branch to support growing demand across Kashmir." },
              ].map((item, index) => (
                <div 
                  key={item.year} 
                  className="group relative pb-8 lg:pb-12 last:pb-0 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="absolute left-0 lg:-left-7 top-4 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full border-4 border-white shadow-lg group-hover:scale-110 lg:group-hover:scale-125 transition-all duration-300 z-10" />
                  <div className="ml-0 lg:ml-0 lg:pl-10 bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-2 hover:border-[#0071e3]/30 transition-all duration-400">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0071e3] mb-2 tracking-tight group-hover:text-[#00aaff]">
                      {item.year}
                    </p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
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

      {/* VALUES - Fixed Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl mx-auto mb-6 md:mb-8">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full shadow-lg" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
                What we stand for.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {[
              { title: "Integrity", desc: "Transparent pricing, clear condition disclosure, and no hidden trade-offs." },
              { title: "Quality", desc: "Only devices that pass strict diagnostics and usability checks." },
              { title: "Expertise", desc: "Over a decade of hands-on experience with modern commercial hardware." },
              { title: "Customer Trust", desc: "Long-term relationships over short-term sales." },
            ].map((value) => (
              <div
                key={value.title}
                className="group relative rounded-3xl p-6 md:p-8 lg:p-10 bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 hover:bg-white hover:border-[#0071e3]/30"
              >
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 group-hover:text-[#0071e3] transition-colors duration-300 leading-tight">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed font-medium text-sm sm:text-base">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY MITC - Better Mobile Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-16 md:mb-20 tracking-tight">
            Why customers choose MITC.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
                className="group flex items-start gap-4 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0071e3]/30 transition-all duration-400"
              >
                <div className="flex-shrink-0 mt-2 w-3 h-3 rounded-full bg-gradient-to-r from-[#0071e3] to-[#00aaff] shadow-lg group-hover:scale-125 transition-transform duration-300" />
                <p className="text-gray-800 font-semibold text-sm sm:text-base leading-relaxed group-hover:text-gray-900">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Fixed Mobile Centering */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-10 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2">
            Experience MITC.
          </h2>
          
          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 lg:mb-16 font-medium leading-relaxed max-w-2xl mx-auto px-2">
            Visit our showroom or speak with our team to experience a more
            transparent way to buy and service technology.
          </p>
          
          <a
            href="/contact"
            className="group inline-flex items-center justify-center px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl bg-white text-gray-900 font-bold text-base md:text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:bg-gray-50 transition-all duration-500 min-w-[200px] md:min-w-[240px]"
          >
            <span className="tracking-wide">Contact MITC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3]/20 to-[#00aaff]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </a>
        </div>
      </section>
    </main>
  );
}
