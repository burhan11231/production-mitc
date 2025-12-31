import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About MITC | Mateen IT Corp – Kashmir's Tech Authority Since 2013",
  description:
    "MITC (Mateen IT Corp) is a premium laptop sales and technical services company based in Srinagar, serving students, professionals, offices, and institutions with transparency, precision, and long-term trust.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION - Updated with Description as Main Heading */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] to-[#e8f0fe] overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0071e3]/5 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0071e3]/5 rounded-full blur-xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          {/* Tag - Fixed Positioning */}
          <div className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-white/60 mb-6 lg:mb-8 shadow-lg w-fit mx-auto">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-gray-600">
              About Mateen IT Corp
            </p>
          </div>

          {/* Hero Description as Main Heading - Same Design/Sizing */}
          <h1 className="mt-6 lg:mt-8 max-w-2xl sm:max-w-3xl mx-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] lg:leading-[1.05] mb-6 lg:mb-8 px-2 bg-gradient-to-r from-gray-900 via-gray-800 to-[#0071e3] bg-clip-text">
            MITC (Mateen IT Corp) is a premium laptop sales and technical services
            <br className="hidden lg:block" />
            company based in Srinagar, serving students, professionals, offices,
            <br className="hidden lg:block" />
            and institutions with transparency, precision, and long-term trust.
          </h1>
        </div>
      </section>

      {/* STORY + TIMELINE - Desktop First */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-24 xl:gap-32 items-start lg:space-y-0 space-y-16">
          
          {/* STORY */}
          <div className="space-y-6 lg:space-y-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight inline-flex items-center gap-3 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-[#0071e3]/10 to-[#00aaff]/10 rounded-2xl border border-[#0071e3]/20 w-fit">
              <span className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-full shadow-lg" />
              Our journey.
            </h2>

            <div className="space-y-6 lg:space-y-8">
              <p className="text-gray-700 text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-lg font-medium">
                Founded in 2013, Mateen IT Corp began as a focused effort to bring
                reliable laptops and honest technical guidance to customers in
                Kashmir. At a time when quality hardware and trustworthy service
                were difficult to access, MITC set out to change expectations.
              </p>
              <p className="text-gray-700 text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-lg font-medium">
                Over the years, we expanded from a single retail outlet into a
                trusted technology partner for individuals, businesses, and
                institutions—handling everything from laptop procurement to
                diagnostics, upgrades, and advanced logic-board repairs.
              </p>
              <p className="text-gray-700 text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-lg font-medium">
                Today, MITC stands for clean devices, clear guidance, and confident
                purchases—supported by process, not promises.
              </p>
            </div>
          </div>

          {/* TIMELINE - Enhanced Desktop Design */}
          <div className="relative lg:pl-16 space-y-8 lg:space-y-16 sticky lg:top-20 self-start">
            <div className="border-l-4 border-gradient-to-b from-[#0071e3] to-[#00aaff] pl-8 lg:pl-12">
              {[
                { year: "2013", title: "Foundation", desc: "MITC was established in Srinagar with a focus on quality laptops and honest service." },
                { year: "2016", title: "Commercial Focus", desc: "Shift toward business-grade and enterprise laptops for offices and professionals." },
                { year: "2019", title: "Advanced Repairs", desc: "Introduced chip-level diagnostics, board repair, and structured service timelines." },
                { year: "2022", title: "Process-Driven Sales", desc: "Standardized testing, pricing transparency, and customer verification checks." },
                { year: "2025", title: "Second Branch", desc: "Expansion with an additional branch to support growing demand across Kashmir." },
              ].map((item, index) => (
                <div 
                  key={item.year} 
                  className="group relative pb-12 lg:pb-16 last:pb-0 hover:scale-[1.02] transition-all duration-500 origin-left"
                >
                  <div className="absolute -left-8 lg:-left-10 top-6 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-[#0071e3] to-[#00aaff] rounded-2xl border-4 border-white shadow-xl group-hover:scale-125 transition-all duration-400 z-10" />
                  <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-gray-100/50 shadow-2xl hover:shadow-3xl hover:-translate-y-4 hover:border-[#0071e3]/40 transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3]/5 to-[#00aaff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="relative z-10 text-3xl lg:text-4xl xl:text-5xl font-black text-[#0071e3] mb-4 tracking-tight group-hover:text-[#00aaff]">
                      {item.year}
                    </p>
                    <h3 className="relative z-10 text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 leading-tight">
                      {item.title}
                    </h3>
                    <p className="relative z-10 text-gray-700 text-lg lg:text-xl leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY MITC - Updated Background */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f3f7fb] via-[#e8f0fe] to-[#d4e4fc] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#0071e3]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#00aaff]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h2 className="text-center text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-20 lg:mb-24 tracking-tight px-2">
            Why customers choose MITC.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
                className="group relative flex items-start gap-6 p-8 lg:p-10 rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/60 hover:shadow-3xl hover:-translate-y-4 hover:scale-[1.02] hover:border-[#0071e3]/40 transition-all duration-700 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 via-transparent to-[#00aaff]/5 -skew-x-3 -skew-y-2 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="flex-shrink-0 mt-2 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-r from-[#0071e3] to-[#00aaff] shadow-xl group-hover:scale-150 transition-all duration-500 z-10 relative" />
                <p className="relative z-10 text-gray-800 font-bold text-lg lg:text-xl xl:text-2xl leading-relaxed group-hover:text-gray-900 tracking-tight">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GET IN TOUCH - Completely Redesigned */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3] via-[#005bb5] to-[#003d82]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_30%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto text-center text-white z-10">
          
          {/* Decorative Elements */}
          <div className="absolute top-16 lg:top-24 left-8 lg:left-16 w-32 h-32 bg-white/10 rounded-3xl blur-xl animate-pulse" />
          <div className="absolute bottom-16 lg:bottom-24 right-8 lg:right-16 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />

          <div className="inline-flex items-center gap-4 px-8 lg:px-12 py-6 lg:py-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl mb-12 lg:mb-16 mx-auto max-w-2xl">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-white to-[#00aaff] rounded-full shadow-lg animate-ping" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-gray-100 to-[#e0f2fe] bg-clip-text text-transparent tracking-tight">
              Get in touch with MITC.
            </h2>
          </div>
          
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-200/90 mb-12 lg:mb-16 font-medium leading-relaxed max-w-3xl mx-auto px-4">
            Find our showroom location, business hours, contact numbers, and a direct enquiry form—all in one place. 
            Connect with our team for sales, service, or technical guidance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center max-w-md mx-auto">
            <a
              href="/contact"
              className="group relative px-10 lg:px-12 py-5 lg:py-6 rounded-3xl bg-white text-[#0071e3] font-black text-lg lg:text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 overflow-hidden flex-1 text-center min-w-[220px]"
            >
              <span className="relative z-10 tracking-wide">Contact Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3] to-[#00aaff] opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </a>
            <a
              href="/#locations"
              className="group px-10 lg:px-12 py-5 lg:py-6 rounded-3xl border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold text-lg lg:text-xl hover:bg-white/20 hover:border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex-1 text-center min-w-[220px]"
            >
              View Locations
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
