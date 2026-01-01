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
        className="relative min-h-[65vh] lg:min-h-screen overflow-hidden flex flex-col justify-center"
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
          <div className="max-w-4xl pt-12 lg:pt-20">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#0071e3] animate-pulse" />
              <span className="text-[10px] lg:text-[11px] font-bold text-white/90 tracking-widest uppercase">
                Kashmir&apos;s Tech Authority Since 2013
              </span>
            </div>

            <h1 className="mt-10 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Premium laptops, built for
              <span className="block mt-3">
                <span className="inline-grid place-items-center px-5 h-[1.25em] lg:h-[1.15em] rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                  <span className="flex items-center text-white whitespace-nowrap leading-none border-r-2 border-white/80 pr-2 animate-pulse">
                    {currentWord}
                  </span>
                </span>
              </span>
            </h1>

            <div className="mt-14 lg:mt-20 mb-8">
              <div className="rounded-[2rem] lg:rounded-[2.75rem] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="grid lg:grid-cols-3">
                  <div className="lg:col-span-2 p-8 lg:p-12">
                    <p className="text-white/70 text-xs lg:text-sm font-bold uppercase tracking-[0.25em]">
                      What you get
                    </p>
                    <p className="mt-4 text-white text-xl lg:text-3xl font-bold tracking-tight leading-snug">
                      Clean devices. Clear guidance. Confident purchase.
                    </p>
                    <p className="mt-4 text-white/75 text-base lg:text-lg leading-relaxed">
                      Commercial laptops, accessories, and upgrades—plus straightforward service timelines
                      for advanced repairs.
                    </p>
                  </div>
                  <div className="relative h-48 sm:h-64 lg:h-auto">
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

      {/* 2. INVENTORY STATEMENT SECTION */}
      <section className="relative py-24 sm:py-28 lg:py-32 px-6 overflow-hidden bg-white">

        {/* Inventory Content */}
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
                <div className="text-xl lg:text-2xl font-medium text-gray-900">Wi-Fi Dongle</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION */}
      <section
        id="about"
        className="relative py-32 px-6 bg-[#f3f7fb] overflow-hidden"
      >
        {/* Soft curved separator */}
        <div className="absolute inset-x-0 -top-24 h-24 bg-white">
          <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[3rem] bg-[#f3f7fb]" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-20 lg:gap-28 items-center">
          {/* LEFT CONTENT */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2 mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
              <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gray-500">
                About Mateen IT Corp
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08] mb-7">
              Technical excellence,
              <br className="hidden sm:block" />
              built on trust.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              Founded in 2013, Mateen IT Corp is Kashmir's trusted destination for
              premium laptops and professional IT services. We focus on transparent
              guidance, reliable inventory, and service standards aligned with modern
              commercial hardware—so customers always know exactly what they are
              buying.
            </p>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-2 gap-7 sm:gap-9 max-w-md">
              <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="text-xs font-semibold tracking-[0.24em] uppercase text-gray-500 mb-3">
                  Experience
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  11+ Years
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Serving students, professionals, and businesses across Kashmir.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="text-xs font-semibold tracking-[0.24em] uppercase text-gray-500 mb-3">
                  Clients Served
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  5,000+
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Repeat customers who trust MITC for upgrades and replacements.
                </p>
              </div>
            </div>

            {/* Pills */}
            <div className="mt-12 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gray-900 text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Store & service under one roof
              </span>
              <span className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600">
                Imported, open-box & commercial-grade laptops
              </span>
            </div>
          </div>

          {/* RIGHT VISUAL CONTENT */}
          <div className="relative">
            <div className="relative grid gap-5">
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1400"
                  alt="MITC Showroom Interior"
                  className="w-full h-[280px] sm:h-[340px] lg:h-[380px] object-cover"
                />
              </div>

              {/* Info Cards */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-gray-500 mb-3">
                    Growth
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Started in 2013 with a second branch added in 2025 to support
                    increasing demand and faster service turnaround.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white">
                  <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/60 mb-3">
                    Our Promise
                  </p>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                    Clean devices, clear guidance, and confident purchases—without
                    pressure or hidden trade-offs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOCATION / SHOWROOM SECTION */}
      <section
        id="location"
        className="relative py-32 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-24">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-5">
              Location
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08]">
              Visit our showroom.<br className="hidden sm:block" />
              Experience it in person.
            </h2>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-2 gap-14 items-stretch">
            {/* Left: Address & Actions */}
            <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-10 sm:p-12 lg:p-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 mb-5">
                  Mateen IT Corp
                </p>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-7">
                  Srinagar Showroom
                </h3>

                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md">
                  Gaw Kadal, Maisuma,<br />
                  Srinagar, Jammu &amp; Kashmir — 190001
                </p>

                <div className="mt-7 text-base sm:text-lg">
                  <p className="text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">
                    +91 80827 54459
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-12 flex flex-wrap gap-5">
                <a
                  href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 transition"
                >
                  Open in Google Maps
                </a>

                <a
                  href="tel:+918082754459"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-gray-300 text-gray-900 font-semibold text-base hover:border-gray-900 transition"
                >
                  Call Showroom
                </a>
              </div>
            </div>

            {/* Right: Map */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 h-[450px] sm:h-[500px] lg:h-[550px]">
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3304.8450556905805!2d74.809277!3d34.073485999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDA0JzI0LjYiTiA3NMKwNDgnMzMuNCJF!5e0!3m2!1sen!2sin!4v1767205829652!5m2!1sen!2sin"
                  title="MITC Srinagar Showroom Location"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gray-200" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
