'use client';

import { FaShieldAlt, FaTools, FaMicrochip, FaStar } from 'react-icons/fa';
import { MdStorage } from 'react-icons/md';

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] lg:min-h-screen overflow-hidden flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.08),transparent_55%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-4xl pt-20 lg:pt-32">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 border border-white/50 backdrop-blur-xl shadow-xl">
              <span className="flex h-3 w-3 rounded-full bg-[#0071e3] animate-pulse shadow-lg" />
              <span className="text-sm lg:text-base font-bold text-gray-900 tracking-widest uppercase">
                Our Story
              </span>
            </div>

            <h1 className="mt-12 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 leading-[0.95] bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent">
              11+ Years
              <span className="block mt-4 text-3xl sm:text-5xl lg:text-6xl font-light text-gray-600">
                Building Trust in Kashmir
              </span>
            </h1>

            <div className="mt-16 lg:mt-24">
              <div className="rounded-3xl overflow-hidden border border-gray-200/50 bg-white/70 backdrop-blur-xl shadow-2xl">
                <div className="p-8 lg:p-12">
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">
                    From a single workshop in 2013 to serving 5,000+ customers across two branches.
                    <span className="block mt-4 font-semibold text-2xl text-gray-900">Every device tells a story.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="relative py-32 px-6 bg-white">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
              Our Process
            </p>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Precision at every step
            </h2>
          </div>

          <div className="space-y-20">
            {/* Timeline Items */}
            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="group relative rounded-3xl border border-gray-200 bg-white p-10 lg:p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xl shadow-2xl">
                      01
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-gray-300" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Diagnostics</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    45-minute comprehensive hardware scan using OEM diagnostic tools. Full transparency—results shown live before any work begins.
                  </p>
                </div>
              </div>
              
              <div className="relative order-1 md:order-2 before:absolute before:left-full before:top-1/2 before:transform before:-translate-y-1/2 before:w-24 before:h-px before:bg-gradient-to-r before:from-gray-200 before:to-transparent md:before:hidden">
                <img
                  src="https://images.unsplash.com/photo-1558618047-3c8c76bbb17e?auto=format&fit=crop&q=85&w=1400"
                  alt="Advanced diagnostics station"
                  className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>

            <div className="relative grid md:grid-cols-2 gap-12 items-center md:grid-cols-2-reverse">
              <img
                src="https://images.unsplash.com/photo-1517437814251-b4ca3b1e2529?auto=format&fit=crop&q=85&w=1400"
                alt="Chip-level repair precision"
                className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />
              
              <div>
                <div className="group relative rounded-3xl border border-gray-200 bg-white p-10 lg:p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xl shadow-2xl">
                      02
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-gray-300" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Repairs</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Chip-level motherboard repair, SSD/RAM upgrades, screen replacements. OEM-equivalent parts with 90-day service warranty.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="group relative rounded-3xl border border-gray-200 bg-white p-10 lg:p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-xl shadow-2xl">
                      03
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-gray-300" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Quality Check</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    24-hour stress testing + customer verification. Every device leaves with full diagnostic report and performance benchmarks.
                  </p>
                </div>
              </div>
              
              <div className="relative order-1 md:order-2 before:absolute before:right-full before:top-1/2 before:transform before:-translate-y-1/2 before:w-24 before:h-px before:bg-gradient-to-l before:from-gray-200 before:to-transparent md:before:hidden">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=85&w=1400"
                  alt="Final quality assurance"
                  className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-2xl font-bold text-gray-900 mb-8">What Sets Us Apart</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: FaShieldAlt,
                title: "No Surprises",
                desc: "Fixed pricing before work begins. Full transparency on parts and labor."
              },
              {
                icon: MdStorage,
                title: "Data Protection",
                desc: "Your data stays untouched. Secure wipe option only with explicit consent."
              },
              {
                icon: FaTools,
                title: "OEM Standards",
                desc: "Commercial-grade tools and genuine-equivalent parts. No shortcuts."
              }
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group relative p-10 rounded-3xl border border-gray-200 bg-white hover:shadow-[0_35px_90px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Icon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION FOOTER */}
      <section className="relative py-24 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl mb-8">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">Find Us</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Gaw Kadal, Maisuma
            <br />
            <span className="text-2xl font-light text-white/80">Srinagar, J&K — 190001</span>
          </h2>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="tel:+918082754459"
              className="group inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Call Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-5 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold text-lg hover:border-white hover:bg-white/20 transition-all duration-300"
            >
              View on Maps →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
