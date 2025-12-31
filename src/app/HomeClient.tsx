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
        className="relative pt-0 lg:pt-0 min-h-[60vh] lg:min-h-screen overflow-hidden flex flex-col justify-center"
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

            <div className="mt-12 lg:mt-16">
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

            {/* RATINGS BADGE */}
            {!isStatsLoading && (
              <div className="mt-10 lg:mt-12 flex flex-wrap items-center gap-5 lg:gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= Math.round(ratingStats.avg) ? 'text-yellow-400' : 'text-white/20'}
                        size={18}
                      />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">{ratingStats.avg}</span>
                    <span className="text-sm text-white/50 font-medium">({ratingStats.count} reviews)</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-white/20 hidden sm:block" />

                <Link
                  href="/ratings"
                  className="group flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <span className="text-xs font-bold uppercase tracking-wider border-b border-white/30 group-hover:border-white pb-0.5">
                    Write a review
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. TECHNICAL CAPABILITIES STRIP (FIXED) */}
      <section className="relative bg-white py-20 overflow-hidden border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
              Technical Capabilities
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Precision service. Proven expertise.
            </h2>
          </div>

          {/* Marquee */}
          <div className="relative overflow-hidden">
            {/* optional edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />

            {/* IMPORTANT:
               - Two identical tracks for seamless looping
               - Pause on hover using animation-play-state
            */}
            <div className="cap-marquee hover:pause-marquee motion-reduce:animate-none">
              <div className="cap-track">
                {capabilities.map(({ label, icon: Icon }) => (
                  <div key={`a-${label}`} className="cap-card">
                    <div className="text-center px-3 sm:px-6">
                      <div className="mx-auto mb-3 sm:mb-6 h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gray-900/5 flex items-center justify-center">
                        <Icon className="text-gray-900 text-xl sm:text-2xl" />
                      </div>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{label}</p>
                      <p className="mt-1 text-[11px] sm:text-xs text-gray-500 font-medium">In-house service</p>
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
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{label}</p>
                      <p className="mt-1 text-[11px] sm:text-xs text-gray-500 font-medium">In-house service</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          /* wrapper moves left continuously */
          .cap-marquee {
            display: flex;
            width: max-content;
            gap: 1rem;
            animation: cap-scroll 18s linear infinite;
            will-change: transform;
          }

          /* each track is one full set */
          .cap-track {
            display: flex;
            gap: 1rem;
            padding-right: 1rem;
          }

          /* card sizing: smaller on mobile */
          .cap-card {
            flex: 0 0 auto;
            width: 56vw;           /* mobile smaller than your 70% + better fit */
            max-width: 260px;
            height: 120px;         /* smaller on mobile */
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

          /* seamless loop: move exactly one track width */
          @keyframes cap-scroll {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-100%);
            }
          }

          /* pause on hover (no jump) */
          .pause-marquee {
            animation-play-state: paused;
          }

          /* responsive sizing */
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
              animation-duration: 22s; /* slightly calmer on large screens */
            }
            .cap-card {
              width: 23vw;
              max-width: 380px;
              height: 220px;
            }
          }
        `}</style>
      </section>

      {/* INVENTORY STATEMENT SECTION */}
      <section className="relative py-36 px-6 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_8%,rgba(0,113,227,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl mb-28">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500">Inventory</p>
            <h2 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-gray-900">
              Hardware that<br className="hidden sm:block" />
              meets standards.
            </h2>
          </div>

          <div className="space-y-24">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Laptops</div>
              <div className="lg:col-span-4 space-y-8">
                <div className="text-2xl lg:text-3xl font-semibold">Dell Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold">HP Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold">Acer Laptops</div>
                <div className="text-2xl lg:text-3xl font-semibold">Lenovo ThinkPad</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-10 items-start border-t pt-16">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Systems</div>
              <div className="lg:col-span-4 space-y-8">
                <div className="text-2xl lg:text-3xl font-semibold">All-in-One PC</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-10 items-start border-t pt-16">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Accessories</div>
              <div className="lg:col-span-4 space-y-8">
                <div className="text-xl lg:text-2xl font-medium">Keyboard</div>
                <div className="text-xl lg:text-2xl font-medium">Mouse</div>
                <div className="text-xl lg:text-2xl font-medium">HDMI Cable</div>
                <div className="text-xl lg:text-2xl font-medium">Wi-Fi Dongle</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="py-28 bg-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              Technical <span className="text-blue-600">Excellence.</span>
            </h2>
            <p className="text-gray-600 text-lg mb-12">
              Since 2013, Mateen IT Corp has built a reputation for transparency, reliability, and uncompromising quality in hardware and services.
            </p>
            <div className="flex gap-16 border-t pt-10">
              <div>
                <div className="text-4xl font-bold">11+</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Years Expertise</div>
              </div>
              <div>
                <div className="text-4xl font-bold">5k+</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Premium Clients</div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1200"
              alt="MITC Interior"
              className="w-full h-[420px] lg:h-[560px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. TRUST PILLARS SECTION */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-y py-16">
          {[
            {
              title: '15-Day Replacement Warranty',
              text: 'Every laptop includes a 15-day replacement warranty with basic testing done in front of the customer.',
            },
            {
              title: 'Fair Market Pricing',
              text: 'Prices adjusted based on market conditions to ensure best value on imported and open-box laptops.',
            },
            {
              title: 'Experience & Trust',
              text: 'Established in 2013 and expanded with a second branch in 2025, trusted across Kashmir.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-bold text-lg mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LOCATION SECTION */}
      <section id="location" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden border shadow-xl grid lg:grid-cols-2">
          <div className="p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-8">Visit Our Showroom</h2>
            <p className="text-gray-600 mb-4">Gaw Kadal, Maisuma, Srinagar, J&amp;K 190001</p>
            <p className="font-bold text-lg mb-8">+91 80827 54459</p>
            <a
              href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
              target="_blank"
              className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition"
            >
              Open in Google Maps
            </a>
          </div>
          <iframe
            className="w-full h-[400px] lg:h-full border-0 grayscale hover:grayscale-0 transition"
            loading="lazy"
            src="https://www.google.com/maps?q=Gaw%20Kadal%20Maisuma%20Srinagar&output=embed"
          />
        </div>
      </section>
    </main>
  );
}
