import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About MITC | Mateen IT Corp – Kashmir's Tech Authority Since 2013",
  description:
    "Learn about MITC (Mateen IT Corp), Kashmir’s trusted laptop sales and IT services provider since 2013. Discover our journey, values, and commitment to quality technology.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION - Dynamic Gradient + Parallax */}
      <section className="relative py-32 px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] via-[#e8f0fe] to-[#d4e4fc] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0071e3]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0071e3]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="inline-block px-6 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/50 mb-8 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-gray-600">
              About Mateen IT Corp
            </p>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 leading-[1.05] mb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-[#0071e3] bg-clip-text">
            Kashmir's Tech Authority,
            <br className="hidden lg:block" />
            <span className="text-transparent bg-gradient-to-r from-[#0071e3] to-[#00aaff]">built since 2013.</span>
          </h1>

          <p className="mt-8 max-w-4xl mx-auto text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
            MITC (Mateen IT Corp) is a premium laptop sales and technical services
            company based in Srinagar, serving students, professionals, offices,
            and institutions with transparency, precision, and long-term trust.
          </p>
        </div>
      </section>

      {/* STORY + TIMELINE - Modern Grid Layout */}
      <section className="relative py-32 px-6 lg:px-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-2 gap-20 xl:gap-32 items-start">
          {/* STORY */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-[#0071e3]/10 to-[#00aaff]/10 rounded-2xl border border-[#0071e3]/20">
              <div className="w-3 h-3 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full shadow-lg" />
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight">
                Our journey.
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 text-lg lg:text-xl leading-relaxed font-medium max-w-lg">
                Founded in 2013, Mateen IT Corp began as a focused effort to bring
                reliable laptops and honest technical guidance to customers in
                Kashmir. At a time when quality hardware and trustworthy service
                were difficult to access, MITC set out to change expectations.
              </p>

              <p className="text-gray-700 text-lg lg:text-xl leading-relaxed font-medium max-w-lg">
                Over the years, we expanded from a single retail outlet into a
                trusted technology partner for individuals, businesses, and
                institutions—handling everything from laptop procurement to
                diagnostics, upgrades, and advanced logic-board repairs.
              </p>

              <p className="text-gray-700 text-lg lg:text-xl leading-relaxed font-medium max-w-lg">
                Today, MITC stands for clean devices, clear guidance, and confident
                purchases—supported by process, not promises.
              </p>
            </div>
          </div>

          {/* TIMELINE - Enhanced Design */}
          <div className="relative">
            <div className="sticky top-20 self-start">
              <div className="pl-12 lg:pl-16 border-l-4 border-gradient-to-b from-[#0071e3] to-[#00aaff] space-y-12">
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
                ].map((item, index) => (
                  <div 
                    key={item.year} 
                    className="group relative pb-12 last:pb-0 hover:scale-[1.02] transition-all duration-500"
                  >
                    <div className="absolute -left-7 top-2 w-5 h-5 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-2xl shadow-xl border-4 border-white group-hover:scale-125 transition-all duration-300" />
                    <div className="pl-10 bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:bg-white">
                      <p className="text-2xl lg:text-3xl font-black text-[#0071e3] mb-2 tracking-tight group-hover:text-[#00aaff]">
                        {item.year}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES - Glassmorphism Cards */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-[#0071e3]/20 to-[#00aaff]/20 backdrop-blur-md rounded-3xl border border-[#0071e3]/30 mb-8">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full shadow-lg" />
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
                What we stand for.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
            ].map((value, index) => (
              <div
                key={value.title}
                className="group relative rounded-3xl p-10 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-4 hover:scale-[1.02] transition-all duration-700 hover:bg-white overflow-hidden"
              >
                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-[#0071e3]/10 to-[#00aaff]/10 rounded-2xl blur-xl group-hover:scale-110 transition-transform duration-500" />
                
                <h3 className="relative z-10 text-2xl lg:text-2xl font-black text-gray-900 mb-4 group-hover:text-[#0071e3] transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="relative z-10 text-gray-700 leading-relaxed font-medium text-base lg:text-lg">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY MITC - Feature Cards */}
      <section className="relative py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Why customers choose MITC.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              "11+ years of proven local expertise",
              "Business-grade and commercial laptops",
              "15-day replacement warranty on eligible devices",
              "Transparent, market-aligned pricing",
              "Advanced repairs with realistic timelines",
              "Store sales and service under one roof",
            ].map((point, index) => (
              <div
                key={point}
                className="group flex items-start gap-4 p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-[#0071e3]/30"
              >
                <div className="flex-shrink-0 mt-1 w-3 h-3 rounded-full bg-gradient-to-r from-[#0071e3] to-[#00aaff] shadow-lg group-hover:scale-125 transition-transform duration-300" />
                <p className="text-gray-800 font-semibold text-base lg:text-lg leading-relaxed group-hover:text-gray-900">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Enhanced Dark Section */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-12 shadow-2xl">
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-tight">
              Experience MITC.
            </h2>
          </div>
          
          <p className="text-gray-300 text-xl lg:text-2xl mb-12 lg:mb-16 font-medium leading-relaxed max-w-2xl mx-auto">
            Visit our showroom or speak with our team to experience a more
            transparent way to buy and service technology.
          </p>
          
          <a
            href="/contact"
            className="group relative inline-flex items-center justify-center px-12 py-6 rounded-3xl bg-gradient-to-r from-white to-gray-100 text-gray-900 font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:from-gray-50 hover:to-white transition-all duration-500 overflow-hidden"
          >
            <span className="relative z-10 tracking-wide">Contact MITC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3] to-[#00aaff] opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500" />
          </a>
        </div>
      </section>
    </main>
  );
}
