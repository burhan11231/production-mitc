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

import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {    
  collection,    
  addDoc,    
  serverTimestamp,    
  query,    
  where,    
  getCountFromServer,    
} from 'firebase/firestore';
import toast from 'react-hot-toast';

import TopFooter from '@/components/topFooter';

/* ---------------- CONSTANTS ---------------- */

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

const WHY_ACCENT = 'from-[#0071e3]/20 via-white/0 to-emerald-400/20';

const whyChooseUs = [    
  {    
    title: '15-Day Replacement Warranty',    
    desc: 'Added peace of mind with a straightforward replacement policy on eligible devices.',    
    icon: FaShieldAlt,    
    accent: WHY_ACCENT,    
  },    
  {    
    title: 'Fair, Market-Aligned Pricing',    
    desc: 'Prices reflect real market value—no inflated tags, no artificial discounts.',    
    icon: HiOutlineCurrencyRupee,    
    accent: WHY_ACCENT,    
  },    
  {    
    title: 'Diagnostics Done in Front of You',    
    desc: 'Basic checks and demonstrations are performed openly before delivery.',    
    icon: RiEyeLine,    
    accent: WHY_ACCENT,    
  },    
  {    
    title: 'Upgrade-First Mindset',    
    desc: 'We recommend RAM, SSD, or OS upgrades when it makes more sense than replacement.',    
    icon: TbArrowsUpRight,    
    accent: WHY_ACCENT,    
  },    
  {    
    title: 'Transparent Buying Process',    
    desc: 'Specifications, condition, and limitations are clearly explained—no surprises after purchase.',    
    icon: TbChecks,    
    accent: WHY_ACCENT,    
  },    
];

const MAX_MESSAGES_PER_MONTH = 30;

/* ---------------- COMPONENT ---------------- */

export default function HomeClient() {
  /* -------- HERO WORD ROTATION -------- */
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWord = heroWords[currentWordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % heroWords.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  /* -------- AUTH & FORM STATE -------- */
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  /* -------- MESSAGE LIMIT STATE -------- */
  const [messagesUsed, setMessagesUsed] = useState<number | null>(null);
  const messagesLeft =
    messagesUsed !== null
      ? Math.max(0, MAX_MESSAGES_PER_MONTH - messagesUsed)
      : null;

  /* -------- AUTO-FILL USER DATA -------- */
  useEffect(() => {
    if (!user) return;

    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  /* -------- LOAD MONTHLY MESSAGE COUNT -------- */
  useEffect(() => {
    if (!user) {
      setMessagesUsed(null);
      return;
    }

    const loadMessageUsage = async () => {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const q = query(
          collection(db, 'leads'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', monthStart)
        );

        const snap = await getCountFromServer(q);
        setMessagesUsed(snap.data().count);
      } catch {
        setMessagesUsed(null);
      }
    };

    loadMessageUsage();
  }, [user]);

  /* -------- FORM HANDLERS -------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messagesLeft !== null && messagesLeft <= 0) {
      toast.error(
        'You have reached your monthly message limit. Please try again next month.'
      );
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsLoading(true);

    try {
      await addDoc(collection(db, 'leads'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        userId: user?.uid || null,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Message sent successfully');
      setFormData(prev => ({
        ...prev,
        phone: user?.phone || '',
        message: '',
      }));
      setMessagesUsed(prev => prev === null ? null : prev + 1);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI STARTS BELOW ---------------- */
  return (
    <main className="overflow-x-hidden">
      {/* 1. HERO SECTION - SEO: Added Srinagar/Kashmir local intent */}
      <section
        id="home"
        className="relative min-h-[70vh] lg:min-h-[85vh] overflow-hidden flex flex-col justify-center bg-[#000] py-10"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2400"
            alt="MITC Srinagar premium laptops showroom"
            className="h-full w-full object-cover object-center opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,113,227,0.2),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-[#0071e3] shadow-[0_0_10px_#0071e3] animate-pulse" />
            <span className="text-[10px] lg:text-[11px] font-bold text-white tracking-[0.15em] uppercase">
              Kashmir's Tech Authority Since 2013 - Srinagar Showroom
            </span>
          </div>

          <h1 className="mt-8 text-2xl sm:text-3xl lg:text-[2.75rem] xl:text-5xl font-bold tracking-tight text-white leading-tight">
            Commercial-grade laptops, <span className="text-white/70">built for</span>{' '}
            <span className="text-[#0071e3] inline-flex border-r-4 border-[#0071e3] pr-2">
              {currentWord}
            </span>
          </h1>

          <div className="mt-4">
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
                    Based in Srinagar, MITC has served professionals, students, and businesses across Kashmir since 2013. 
                    Specializing in commercial-grade laptops and precision repairs at our Gaw Kadal showroom.
                  </p>
                </div>
                <div className="lg:col-span-2 relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1600"
                    alt="MITC Srinagar workspace with tested laptops"
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

      {/* 2. ABOUT US SECTION - SEO: Added /about link */}
      <section id="about" className="relative bg-sky-50/60 overflow-hidden py-20">
        <div className="absolute inset-x-0 -top-24 h-24 bg-white">
          <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[3rem] bg-sky-50/60" />
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
                Founded in 2013, Mateen IT Corp is Srinagar's trusted destination for
                premium laptops and professional IT services. We focus on transparent
                guidance and service standards aligned with modern commercial hardware.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0071e3] hover:underline hover:text-[#005bb5] transition-colors"
              >
                Learn more about MITC →
              </Link>
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
        </div>
      </section>

      {/* 3. INVENTORY STATEMENT SECTION - SEO: Added showroom disclaimer */}
      <section className="relative py-20 px-6 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
  Hardware We Work With
</p>

<h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-gray-900">
  Standards-driven systems.
</h2>

<p className="mt-8 text-lg text-gray-600 max-w-3xl">
  Brands and categories typically available at our Srinagar showroom.
  Contact us for current configurations and diagnostics.
</p>
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

      {/* 4. WHY CHOOSE US SECTION */}
      <section
        id="why-choose-us"
        className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-sky-50/60 overflow-hidden"
      >
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
              confidence—especially when you're buying premium, commercial hardware in Srinagar.
            </p>
          </div>

          <div className="mt-16 lg:mt-20">
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
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
                      <div className="relative h-14 w-14 lg:h-16 lg:w-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-gray-900 to-black grid place-items-center shadow-xl ring-4 ring-white/50">
                        <Icon className="text-white text-2xl lg:text-3xl" />
                        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                          {title}
                        </h3>
                        <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-4xl">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONFIDENCE & CONTACT SECTION */}
      <section className="relative py-24 bg-gradient-to-br from-gray-950 via-black to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(0,113,227,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_80%_80%,rgba(16,185,129,0.15),transparent_60%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="h-[2px] w-8 bg-[#0071e3]" />
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/60">
                    Built for confidence
                  </p>
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Evaluated in person.
                  <span className="block text-white/50 mt-2">Trusted by choice.</span>
                </h3>
                <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
                  Walk in. Test the device. Watch diagnostics live. Understand every detail before you buy.
                  No pressure. No surprises. Just clarity at our Srinagar showroom.
                </p>
              </div>

              <div className="py-6">
                <TopFooter />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-10">
              <h4 className="text-2xl font-bold text-gray-900 mb-1">
                Send an Inquiry
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Tell us what you need. Our team responds within working hours.
              </p>

              {messagesLeft !== null && (
                <div
                  className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between ${
                    messagesLeft > 5
                      ? 'bg-emerald-50 text-emerald-700'
                      : messagesLeft > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span>Monthly message quota</span>
                  <span>
                    {messagesLeft} / {MAX_MESSAGES_PER_MONTH}
                  </span>
                </div>
              )}

              {messagesLeft === 0 && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 leading-relaxed">
                  You've reached your monthly inquiry limit.
                  <br />
                  Please try again next month or visit us in store for immediate assistance.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="field-label mb-1.5 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="input h-12"
                    disabled={isLoading || messagesLeft === 0}
                  />
                </div>

                <div>
                  <label className="field-label mb-1.5 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="input h-12"
                    disabled={isLoading || messagesLeft === 0}
                  />
                </div>

                <div>
                  <label className="field-label mb-1.5 block">
                    Phone <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 7006 XXX XXX"
                    className="input h-12"
                    disabled={isLoading || messagesLeft === 0}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Used only for this inquiry. Not saved to your profile.
                  </p>
                </div>

                <div>
                  <label className="field-label mb-1.5 block">
                    How can we help? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Laptop model, specifications, or any questions you have..."
                    className="input py-4 resize-none"
                    disabled={isLoading || messagesLeft === 0}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || messagesLeft === 0}
                  className="submit-btn h-12 text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                      Sending…
                    </div>
                  ) : messagesLeft === 0 ? (
                    'Monthly Limit Reached'
                  ) : (
                    'Send Message ↗'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cap-marquee { display: flex; width: max-content; gap: 1.5rem; animation: cap-scroll 25s linear infinite; will-change: transform; }
        .cap-track { display: flex; gap: 1.5rem; }
        .cap-card { flex: 0 0 auto; min-width: 220px; max-width: 260px; height: 180px; border-radius: 2rem; border: 1px solid rgb(229 231 235); background: white; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; }
        .cap-card:hover { box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15); transform: translateY(-8px) scale(1.02); }
        @keyframes cap-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (min-width: 640px) { .cap-card { min-width: 240px; max-width: 280px; } }
        @media (min-width: 1024px) { .cap-card { min-width: 260px; max-width: 300px; height: 200px; } }
        @media (min-width: 1280px) { .cap-card { min-width: 280px; max-width: 320px; } }

        .field-label { font-size: 13px; font-weight: 600; color: #374151; }
        .input { width: 100%; padding: 0 16px; border-radius: 12px; border: 2px solid #e5e7eb; background: #ffffff; font-size: 14px; transition: all 0.2s ease; }
        .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .submit-btn { background: #111827; color: white; border-radius: 9999px; font-weight: 700; transition: all 0.3s ease; width: 100%; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: #000; }
      `}</style>
    </main>
  );
}