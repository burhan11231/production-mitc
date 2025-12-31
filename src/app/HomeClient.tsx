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
  FaStar,
  FaShieldAlt,
} from 'react-icons/fa';
import { MdStorage } from 'react-icons/md';
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
        className="relative min-h-[60vh] lg:min-h-screen overflow-hidden flex flex-col justify-center"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2400"
            alt="MITC premium laptops and service"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-white/10" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,113,227,0.45),transparent_55%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-4xl pt-10 lg:pt-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#0071e3] animate-pulse" />
              <span className="text-[10px] lg:text-[11px] font-bold text-white/90 tracking-widest uppercase">
                Kashmir&apos;s Tech Authority Since 2013
              </span>
            </div>

            <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Premium laptops, built for
              <span className="block mt-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                  <span className="relative text-white whitespace-nowrap border-r-2 border-white/80 pr-2">
                    {currentWord}
                  </span>
                </span>
              </span>
            </h1>

            <div className="mt-12 lg:mt-16 mb-6">
              <div className="rounded-[1.75rem] lg:rounded-[2.5rem] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="grid lg:grid-cols-3">
                  <div className="lg:col-span-2 p-6 lg:p-10">
                    <p className="text-white/70 text-xs lg:text-sm font-bold uppercase tracking-[0.25em]">
                      What you get
                    </p>
                    <p className="mt-3 text-white text-xl lg:text-3xl font-bold tracking-tight">
                      Clean devices. Clear guidance. Confident purchase.
                    </p>
                    <p className="mt-3 text-white/75 text-sm lg:text-base leading-relaxed">
                      Commercial laptops, accessories, and upgrades—plus straightforward service timelines
                      for advanced repairs.
                    </p>
                  </div>
                  <div className="relative h-44 sm:h-56 lg:h-auto">
                    <img
                      src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1600"
                      alt="Laptop workspace"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </section>



{/* 2. INVENTORY STATEMENT SECTION (NOW BELOW ABOUT) */}
<section className="relative py-20 sm:py-24 lg:py-28 px-6 overflow-hidden bg-white">
  <div className="max-w-7xl mx-auto px-6 mb-28">

    {/* Marquee */}
    <div className="relative overflow-hidden">
      <div className="cap-marquee hover:pause-marquee motion-reduce:animate-none">
        <div className="cap-track">
          {capabilities.map(({ label, icon: Icon }) => (
            <div key={`a-${label}`} className="cap-card">
              <div className="text-center px-3 sm:px-6">
                <div className="mx-auto mb-3 sm:mb-6 h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gray-900/5 flex items-center justify-center">
                  <Icon className="text-gray-900 text-xl sm:text-2xl" />
                </div>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="cap-track" aria-hidden="true">
          {capabilities.map(({ label, icon: Icon }) => (
            <div key={`b-${label}`} className="cap-card">
              <div className="text-center px-4 sm:px-6">
                <div className="mx-auto mb-4 sm:mb-6 h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-gray-900/5 flex items-center justify-center">
                  <Icon className="text-gray-900 text-xl sm:text-2xl" />
                </div>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Styles */}
  <style jsx>{`
    .cap-marquee {
      display: flex;
      width: max-content;
      gap: 1rem;
      animation: cap-scroll 18s linear infinite;
      will-change: transform;
    }

    .cap-track {
      display: flex;
      gap: 1rem;
      padding-right: 1rem;
    }

    .cap-card {
      flex: 0 0 auto;
      width: 56vw;
      max-width: 260px;
      height: 120px;
      border-radius: 1.5rem;
      border: 1px solid rgb(229 231 235);
      background: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: transform 250ms ease, box-shadow 250ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cap-card:hover {
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    @keyframes cap-scroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-100%);
      }
    }

    .pause-marquee {
      animation-play-state: paused;
    }

    @media (min-width: 640px) {
      .cap-card {
        width: 44vw;
        max-width: 360px;
        height: 180px;
      }
    }

    @media (min-width: 768px) {
      .cap-card {
        width: 30vw;
        max-width: 360px;
        height: 200px;
      }
    }

    @media (min-width: 1024px) {
      .cap-marquee {
        animation-duration: 22s;
      }
      .cap-card {
        width: 23vw;
        max-width: 380px;
        height: 220px;
      }
    }
  `}</style>

  {/* Inventory Content */}
  <div className="relative max-w-7xl mx-auto">
    <div className="max-w-4xl mb-14">
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">
        Inventory
      </p>
      <h2 className="mt-3 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-gray-900">
        Hardware that
        <br className="hidden sm:block" />
        meets standards.
      </h2>
    </div>

    <div className="space-y-20 sm:space-y-24">
      <div className="grid lg:grid-cols-5 gap-10 items-start">
        <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Laptops
        </div>
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="text-2xl lg:text-3xl font-semibold">Dell Laptops</div>
          <div className="text-2xl lg:text-3xl font-semibold">HP Laptops</div>
          <div className="text-2xl lg:text-3xl font-semibold">Acer Laptops</div>
          <div className="text-2xl lg:text-3xl font-semibold">Lenovo ThinkPad</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 items-start border-t pt-16">
        <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Systems
        </div>
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="text-2xl lg:text-3xl font-semibold">All-in-One PC</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 items-start border-t pt-16">
        <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Accessories
        </div>
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="text-xl lg:text-2xl font-medium">Keyboard</div>
          <div className="text-xl lg:text-2xl font-medium">Mouse</div>
          <div className="text-xl lg:text-2xl font-medium">HDMI Cable</div>
          <div className="text-xl lg:text-2xl font-medium">Wi-Fi Dongle</div>
        </div>
      </div>
    </div>
  </div>
</section>


        
      
      
      {/* 3. WHY CHOOSE US / TRUST PILLARS */}
<section className="relative py-28 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <div className="max-w-3xl mb-20">
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">
        Why Choose MITC
      </p>
      <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
        Trusted by design.<br className="hidden sm:block" />
        Proven in practice.
      </h2>
    </div>

    {/* Pillars */}
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Pillar 1 – Warranty */}
<div className="group relative rounded-3xl border border-gray-200 bg-white p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
  <div className="mb-6 flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-900 text-white">
    <FaShieldAlt className="text-xl" />
  </div>

  <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
    15-Day Replacement Warranty
  </h3>

  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
    Every laptop is covered with a 15-day replacement warranty. Basic
    diagnostics and functionality checks are performed transparently in
    front of the customer before delivery.
  </p>
</div>


      {/* Pillar 2 */}
      <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
        <div className="mb-6 flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-100 text-gray-900 text-xl font-bold">
          ₹
        </div>
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
          Fair Market Pricing
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
          Pricing is aligned with real-time market conditions. We focus on value,
          not inflated margins—ensuring competitive rates across imported,
          open-box, and commercial-grade devices.
        </p>
      </div>

      
    </div>
  </div>
</section>



{/* 4. ABOUT SECTION (MOVED ABOVE INVENTORY + CLEAN / NO GRADIENTS) */}
<section
  id="about"
  className="relative py-28 px-6 bg-white overflow-hidden"
>
  {/* REMOVED: all radial / gradient background layers */}

  <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-16 lg:gap-24 items-center">
    {/* Left content */}
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 mb-6">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
        <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gray-500">
          About Mateen IT Corp
        </span>
      </div>

      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
        Technical Excellence.
      </h2>

      <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
        Since 2013, Mateen IT Corp has built a reputation for transparent guidance,
        reliable inventory, and service standards that match modern commercial
        hardware. Every laptop goes through strict checks so customers know exactly
        what they are buying.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8 max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-[0.24em] uppercase text-gray-500 mb-2">
            Years of Expertise
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">
            11+
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Consistently serving businesses, students, and creators across Kashmir.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-[0.24em] uppercase text-gray-500 mb-2">
            Premium Clients
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">
            5k+
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Repeat buyers who trust MITC for upgrades, replacements, and fleet refresh.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Store & service under one roof
        </span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
          Imported, open-box & commercial-grade laptops
        </span>
      </div>
    </div>

    {/* Right visual / stacked cards */}
    <div className="relative">
      {/* REMOVED: blur glow circles */}

      <div className="relative grid gap-4">
        <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <img
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1200"
            alt="MITC Interior"
            className="w-full h-[260px] sm:h-[320px] lg:h-[360px] object-cover"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-gray-500 mb-2">
              Branches
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Established in 2013 with a second branch added in 2025 to handle
              growing demand.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-900 p-4 sm:p-5 text-white">
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/60 mb-2">
              What MITC Stands For
            </p>
            <p className="text-sm sm:text-base text-white/90">
              Clean devices, clear guidance, and confident purchases—for
              first-time buyers and seasoned professionals alike.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      

      {/* 5. LOCATION / SHOWROOM SECTION */}
<section
  id="location"
  className="relative py-28 px-6 bg-white"
>
  <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <div className="max-w-3xl mb-20">
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">
        Location
      </p>
      <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
        Visit our showroom.<br className="hidden sm:block" />
        Experience it in person.
      </h2>
    </div>

    {/* Content */}
    <div className="grid lg:grid-cols-2 gap-12 items-stretch">
      {/* Left: Address & Actions */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 lg:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-4">
            Mateen IT Corp
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Srinagar Showroom
          </h3>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md">
            Gaw Kadal, Maisuma,<br />
            Srinagar, Jammu &amp; Kashmir — 190001
          </p>

          <div className="mt-6 text-sm sm:text-base">
            <p className="text-gray-500">Phone</p>
            <p className="font-semibold text-gray-900">
              +91 80827 54459
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-gray-900 text-white font-semibold text-sm sm:text-base hover:bg-gray-800 transition"
          >
            Open in Google Maps
          </a>

          <a
            href="tel:+918082754459"
            className="inline-flex items-center justify-center px-7 py-4 rounded-xl border border-gray-300 text-gray-900 font-semibold text-sm sm:text-base hover:border-gray-900 transition"
          >
            Call Showroom
          </a>
        </div>
      </div>

      {/* Right: Map */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-200">
        <iframe
          className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition duration-500"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3304.8450556905805!2d74.809277!3d34.073485999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDA0JzI0LjYiTiA3NMKwNDgnMzMuNCJF!5e0!3m2!1sen!2sin!4v1767205829652!5m2!1sen!2sin"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gray-200" />
      </div>
    </div>
  </div>
</section>

    </main>
  );
}
