'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaTools,
  FaMicrochip,
  FaDesktop,
  FaBatteryHalf,
  FaWindows,
  FaServer,
  FaMemory,
  FaShieldAlt,
  FaStar,
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
  const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const currentWord = heroWords[currentWordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 1800);

    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const reviews = querySnapshot.docs.map((doc) => doc.data());

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, curr: any) => acc + (curr.rating || 0), 0);
          setRatingStats({
            avg: Math.round((sum / reviews.length) * 10) / 10,
            count: reviews.length,
          });
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
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

  {/* Content Container - Full Wide max-w-7xl */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
    
    {/* Badge */}
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
      <span className="flex h-2 w-2 rounded-full bg-[#0071e3] shadow-[0_0_10px_#0071e3] animate-pulse" />
      <span className="text-[10px] lg:text-[11px] font-bold text-white tracking-[0.15em] uppercase">
        Kashmir&apos;s Tech Authority Since 2013
      </span>
    </div>

    {/* Main Heading - Sized for single line on PC */}
    <h1 className="mt-8 text-3xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold tracking-tight text-white leading-tight">
      Premium laptops, <span className="text-white/70">built for</span>{' '}
      <span className="text-[#0071e3] inline-flex border-r-4 border-[#0071e3] pr-2">
        {currentWord}
      </span>
    </h1>

    {/* Info Card - Full Wide with Edge-to-Edge Image */}
    <div className="mt-10">
      <div className="group rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] transition-all hover:border-white/20">
        <div className="grid lg:grid-cols-5 items-stretch">
          
          {/* Text Side - 3/5 width */}
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

          {/* Image Side - 2/5 width, Full Edge-to-Edge */}
          <div className="lg:col-span-2 relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1600"
              alt="Workspace"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle Gradient Overlay on image to blend with card */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent lg:from-black/20" />
          </div>

        </div>
      </div>
    </div>
  </div>
</section>

      
{/* 2. ABOUT US SECTION */}
<section
  id="about"
  className="relative bg-[#f3f7fb] overflow-hidden py-10"
>
  {/* Soft curved separator */}
  <div className="absolute inset-x-0 -top-24 h-24 bg-white">
    <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[3rem] bg-[#f3f7fb]" />
  </div>

  <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">
    {/* Layout Grid: Text on Left, Stats on Right (Full Wide) */}
    <div className="grid lg:grid-cols-2 gap-10 items-end">
      
      {/* Left Side: Content */}
      <div className="space-y-6">
        {/* Eyebrow - mt-0 since section has py-10 */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[10px] lg:text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500">
            About Mateen IT Corp
          </span>
        </div>

        {/* Heading - mt-10 limit applied via spacing in grid/flex */}
        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
          Technical excellence,
          <span className="block text-gray-400">built on trust.</span>
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
          Founded in 2013, Mateen IT Corp is Kashmir's trusted destination for
          premium laptops and professional IT services. We focus on transparent
          guidance and service standards aligned with modern commercial hardware.
        </p>
      </div>

      {/* Right Side: Stats Grid (Left aligned within its column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 lg:mt-0">
        
        {/* Experience Card */}
        <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0071e3] mb-3">
            Experience
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            11+ Years
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Serving professionals and businesses across Kashmir.
          </p>
        </div>

        {/* Customers Card */}
        <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0071e3] mb-3">
            Customers
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            5,000+
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Repeat clients who trust MITC for long-term support.
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Capabilities Marquee - Full width on PC - mt-10 applied */}
  <div className="relative mt-10 mb-10 lg:-mx-8 lg:px-8">
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
      <section className="relative py-24 sm:py-28 lg:py-32 px-6 overflow-hidden bg-white">
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

      {/* 4. WHY CHOOSE US SECTION (UPDATED) */}
<section
  id="why-choose-us"
  className="relative py-6 lg:py-12 px-4 sm:px-6 lg:px-8 bg-[#f3f7fb] overflow-hidden"
>
  {/* Background accents */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.18),transparent_60%)] blur-2xl" />
    <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_60%)] blur-2xl" />
  </div>

  <div className="relative max-w-7xl mx-auto">
    {/* Header */}
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-5 py-2.5 shadow-sm">
        <HiOutlineSparkles className="text-[#0071e3]" />
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

    {/* Desktop-first grid */}
    <div className="mt-14 lg:mt-16 grid gap-6 lg:gap-7 lg:grid-cols-12 items-stretch">
      {/* Left: feature cards */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-7">
        {whyChooseUs.map(({ title, desc, icon: Icon, accent }) => (
          <div
            key={title}
            className="group relative rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur p-7 lg:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            <div className="relative z-10 flex items-start gap-4">
              <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl bg-gray-900 text-white grid place-items-center shadow-sm">
                <Icon className="text-xl lg:text-2xl" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 leading-snug">
                  {title}
                </h3>
                <p className="mt-2 text-sm lg:text-base text-gray-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="relative z-10 mt-5 flex flex-col items-center gap-1">
              <span className="text-[11px] lg:text-xs font-semibold tracking-[0.24em] uppercase text-gray-500">
                MITC Standard
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Right: trust panel */}
      <div className="lg:col-span-4">
        <div className="relative h-full rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-900 to-black p-8 lg:p-10 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.35),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_90%,rgba(16,185,129,0.18),transparent_60%)]" />

          <div className="relative z-10 flex flex-col h-full">
            <p className="text-[11px] lg:text-xs font-semibold tracking-[0.28em] uppercase text-white/65">
              Desktop-first experience
            </p>
            <h3 className="mt-4 text-2xl lg:text-3xl font-semibold text-white leading-tight">
              Built to be evaluated.
              <span className="block text-white/80">Not just advertised.</span>
            </h3>

            <p className="mt-5 text-sm lg:text-base text-white/75 leading-relaxed">
              Walk in, check the device, see diagnostics, understand trade-offs, and then decide.
              The process stays clear from shortlist to delivery.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-sm text-white/85">Open checks before delivery</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
                <p className="text-sm text-white/85">Transparent specs & condition</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <p className="text-sm text-white/85">Upgrade-first guidance</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white text-gray-900 px-5 py-3 text-sm font-semibold shadow-sm hover:bg-white/90 transition-colors"
              >
                Talk to us
              </Link>
            </div>

            <div className="mt-10 text-xs text-white/55 leading-relaxed">
              Note: Warranty applies to eligible devices as per replacement policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Ratings – small highlight section */}
<section className="mt-10 flex justify-center">
  <div className="rounded-3xl bg-blue-200/70 px-6 py-4 shadow-sm">
    <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-300/60 bg-white/60 px-4 py-2 backdrop-blur-md">
      <FaStar className="text-amber-400 text-sm" />
      <span className="text-sm font-semibold text-gray-900">
        {isStatsLoading ? 'Loading…' : `${ratingStats.avg} / 5`}
      </span>
      {!isStatsLoading && (
        <span className="text-xs text-gray-700">
          ({ratingStats.count} reviews)
        </span>
      )}
    </div>
  </div>
</section>

    </main>
  );
}
