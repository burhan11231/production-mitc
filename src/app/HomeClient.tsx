'use client';
import { useEffect, useState } from 'react';
import {
  FaTools,
  FaMicrochip,
  FaDesktop,
  FaBatteryHalf,
  FaWindows,
  FaServer,
  FaMemory,
  FaShieldAlt,
} from 'react-icons/fa';
import { MdStorage } from 'react-icons/md';
import { HiOutlineCurrencyRupee, HiOutlineSparkles } from 'react-icons/hi2';
import { RiEyeLine } from 'react-icons/ri';
import { TbArrowsUpRight, TbChecks } from 'react-icons/tb';
import Link from 'next/link';

const heroWords = ['Students', 'Businesses', 'Creators', 'Developers', 'Offices'];

const capabilities = [
  { label: 'Diagnostics', icon: FaTools },
  { label: 'Chip-Level Repair', icon: FaMicrochip },
  { label: 'Screen Replacement', icon: FaDesktop },
  { label: 'Battery Replacement', icon: FaBatteryHalf },
  { label: 'OS Installation', icon: FaWindows },
  { label: 'BIOS Update', icon: FaServer },
  { label: 'RAM Upgrade', icon: FaMemory },
  { label: 'SSD Upgrade', icon: MdStorage },
];

const whyChooseUs = [
  {
    title: '15-Day Replacement Warranty',
    desc: 'Added peace of mind with a straightforward replacement policy on eligible devices.',
    icon: FaShieldAlt,
    accent: 'from-[#0071e3]/20 via-white/0 to-emerald-400/20',
  },
  {
    title: 'Fair, Market-Aligned Pricing',
    desc: 'Prices reflect real market value—no inflated tags, no artificial discounts.',
    icon: HiOutlineCurrencyRupee,
    accent: 'from-emerald-400/20 via-white/0 to-[#0071e3]/20',
  },
  {
    title: 'Diagnostics Done in Front of You',
    desc: 'Basic checks and demonstrations are performed openly before delivery.',
    icon: RiEyeLine,
    accent: 'from-[#0071e3]/20 via-white/0 to-white/0',
  },
  {
    title: 'Upgrade-First Mindset',
    desc: 'We recommend RAM, SSD, or OS upgrades when it makes more sense than replacement.',
    icon: TbArrowsUpRight,
    accent: 'from-white/0 via-white/0 to-emerald-400/20',
  },
  {
    title: 'Transparent Buying Process',
    desc: 'Specifications, condition, and limitations are clearly explained—no surprises after purchase.',
    icon: TbChecks,
    accent: 'from-emerald-400/20 via-white/0 to-white/0',
  },
];

export default function HomeClient() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWord = heroWords[currentWordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section
        id="home"
        className="relative min-h-[70vh] lg:min-h-[85vh] overflow-hidden flex flex-col justify-center bg-[#000] py-10"
      >
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2400"
            alt="MITC premium laptops"
            className="h-full w-full object-cover object-center opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,113,227,0.2),transparent_50%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-[#0071e3] shadow-[0_0_10px_#0071e3] animate-pulse" />
            <span className="text-[10px] lg:text-[11px] font-bold text-white tracking-[0.15em] uppercase">
              Kashmir&apos;s Tech Authority Since 2013
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mt-8 text-3xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold tracking-tight text-white leading-tight">
            Premium laptops, <span className="text-white/70">built for</span>{' '}
            <span className="text-[#0071e3] inline-flex border-r-4 border-[#0071e3] pr-2">
              {currentWord}
            </span>
          </h1>

          {/* Info Card */}
          <div className="mt-10">
            <div className="group rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] transition-all hover:border-white/20">
              <div className="grid lg:grid-cols-5 items-stretch">
                <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-[1px] w-8 bg-[#0071e3]" />
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                      The MITC Standard
                    </p>
                  </div>
                  <p className="text-white text-2xl lg:text-4xl font-semibold tracking-tight leading-tight">
                    Clean devices. Clear guidance. <br className="hidden lg:block" />
                    <span className="text-white/40">Confident purchase.</span>
                  </p>
                  <p className="mt-6 text-white/50 text-base lg:text-lg leading-relaxed max-w-xl">
                    Specializing in commercial-grade laptops and precision repairs.
                    We bridge the gap between high-end tech and straightforward service.
                  </p>
                </div>
                <div className="lg:col-span-2 relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1600"
                    alt="Workspace"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent lg:from-black/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about" className="relative bg-[#f3f7fb] overflow-hidden py-20">
        <div className="absolute inset-x-0 -top-24 h-24 bg-white">
          <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[3rem] bg-[#f3f7fb]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
                <span className="text-[10px] lg:text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500">
                  About Mateen IT Corp
                </span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Technical excellence,
                <span className="block text-gray-400">built on trust.</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Founded in 2013, Mateen IT Corp is Kashmir's trusted destination for
                premium laptops and professional IT services. We focus on transparent
                guidance and service standards aligned with modern commercial hardware.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 lg:mt-0">
              <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0071e3] mb-3">
                  Experience
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">11+ Years</div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Serving professionals and businesses across Kashmir.
                </p>
              </div>
              <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0071e3] mb-3">
                  Customers
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">5,000+</div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Repeat clients who trust MITC for long-term support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Marquee */}
        <div className="relative mt-10 lg:-mx-8 lg:px-8">
          <div className="max-w-none lg:max-w-none">
            <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-0">
              <div className="cap-marquee hover:pause-marquee motion-reduce:animate-none">
                <div className="cap-track">
                  {capabilities.map(({ label, icon: Icon }) => (
                    <div key={`a-${label}`} className="cap-card">
                      <div className="text-center px-6 lg:px-8 py-6 h-full flex flex-col items-center justify-center">
                        <div className="mx-auto mb-6 h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-gray-900/5 to-gray-100 flex items-center justify-center shadow-lg">
                          <Icon className="text-gray-900 text-2xl lg:text-3xl" />
                        </div>
                        <p className="text-base lg:text-lg font-semibold text-gray-900 leading-tight px-2">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cap-track" aria-hidden="true">
                  {capabilities.map(({ label, icon: Icon }) => (
                    <div key={`b-${label}`} className="cap-card">
                      <div className="text-center px-6 lg:px-8 py-6 h-full flex flex-col items-center justify-center">
                        <div className="mx-auto mb-6 h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-gray-900/5 to-gray-100 flex items-center justify-center shadow-lg">
                          <Icon className="text-gray-900 text-2xl lg:text-3xl" />
                        </div>
                        <p className="text-base lg:text-lg font-semibold text-gray-900 leading-tight px-2">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            .cap-marquee {
              display: flex;
              width: max-content;
              gap: 1.5rem;
              animation: cap-scroll 25s linear infinite;
              will-change: transform;
            }
            .cap-track {
              display: flex;
              gap: 1.5rem;
            }
            .cap-card {
              flex: 0 0 auto;
              min-width: 220px;
              max-width: 260px;
              height: 180px;
              border-radius: 2rem;
              border: 1px solid rgb(229 231 235);
              background: white;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
              transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .cap-card:hover {
              box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
              transform: translateY(-8px) scale(1.02);
            }
            @keyframes cap-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @media (min-width: 640px) { .cap-card { min-width: 240px; max-width: 280px; } }
            @media (min-width: 1024px) { .cap-card { min-width: 260px; max-width: 300px; height: 200px; } }
            @media (min-width: 1280px) { .cap-card { min-width: 280px; max-width: 320px; } }
          `}</style>
        </div>
      </section>

      {/* 3. INVENTORY STATEMENT SECTION */}
      <section className="relative py-20 px-6 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
              Inventory
            </p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-gray-900">
              Hardware that
              <br className="hidden sm:block" />
              meets standards.
            </h2>
          </div>
          <div className="space-y-24 sm:space-y-28">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Laptops
              </div>
              <div className="lg:col-span-4 space-y-7 sm:space-y-9">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">Dell Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">HP Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">Acer Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">Lenovo ThinkPad</div>
              </div>
            </div>
            <div className="grid lg:grid-cols-5 gap-12 items-start border-t border-gray-200 pt-20">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Systems
              </div>
              <div className="lg:col-span-4 space-y-7 sm:space-y-9">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">All-in-One PC</div>
              </div>
            </div>
            <div className="grid lg:grid-cols-5 gap-12 items-start border-t border-gray-200 pt-20">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Accessories
              </div>
              <div className="lg:col-span-4 space-y-5 sm:space-y-7">
                <div className="text-xl lg:text-2xl font-medium text-gray-900">Keyboard</div>
                <div className="text-xl lg:text-2xl font-medium text-gray-900">Mouse</div>
                <div className="text-xl lg:text-2xl font-medium text-gray-900">HDMI Cable</div>
                <div className="text-xl lg:text-2xl font-medium text-gray-900">Wi‑Fi Dongle</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION (Modern & Dynamic) */}
      <section
        id="why-choose-us"
        className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#f3f7fb] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(0,113,227,0.15),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_70%)] blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-5 py-2.5 shadow-sm">
              <HiOutlineSparkles className="text-[#0071e3] text-lg" />
              <span className="text-xs lg:text-[11px] font-semibold tracking-[0.28em] uppercase text-gray-600">
                Why choose us
              </span>
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.06]">
              A purchase that feels
              <span className="block">clear, fair, and secure.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl">
              Every device is sold with transparent checks, practical guidance, and policies designed for
              confidence—especially when you're buying premium, commercial hardware.
            </p>
          </div>

          <div className="mt-16 lg:mt-20 grid gap-8 lg:gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {whyChooseUs.map(({ title, desc, icon: Icon, accent }) => (
                <div
                  key={title}
                  className="group relative rounded-3xl overflow-hidden bg-white border border-gray-200/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  />
                  <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">
                    <div className="flex items-start gap-5">
                      <div className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black grid place-items-center shadow-xl ring-4 ring-white/50">
                        <Icon className="text-white text-2xl lg:text-3xl" />
                        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                          {title}
                        </h3>
                        <p className="mt-3 text-base text-gray-600 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-300 via-gray-200 to-transparent" />
                      <span className="ml-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-400">
                        MITC Standard
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-gray-300 via-gray-200 to-transparent" />
                    </div>
                  </div>
                  <div className="absolute inset-0 scale-95 group-hover:scale-100 transition-transform duration-700 rounded-3xl bg-white/50 opacity-0 group-hover:opacity-100 pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="relative h-full min-h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 p-10 lg:p-12 shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_30%_20%,rgba(0,113,227,0.4),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_70%_80%,rgba(16,185,129,0.25),transparent_60%)]" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/60">
                      Built for confidence
                    </p>
                    <h3 className="mt-5 text-3xl lg:text-4xl font-bold text-white leading-tight">
                      Evaluated in person.
                      <span className="block text-white/80">Trusted by choice.</span>
                    </h3>
                    <p className="mt-6 text-base lg:text-lg text-white/80 leading-relaxed">
                      Walk in. Test the device. Watch diagnostics live. Understand every detail before you buy.
                      No pressure. No surprises. Just clarity.
                    </p>
                    
                  <div className="mt-12">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center w-full rounded-full bg-white text-gray-900 px-8 py-4 text-base font-bold shadow-xl hover:shadow-white/30 hover:bg-white/95 transition-all duration-300"
                    >
                      Visit us today
                    </Link>
                    <p className="mt-6 text-xs text-white/50 text-center leading-relaxed">
                      Warranty applies to eligible devices • Replacement policy in place
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
