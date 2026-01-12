// src/app/about/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShieldAlt, FaUsers, FaStore, FaHandshake } from 'react-icons/fa';
import { useSettings } from '@/hooks/useSettings';
import { useSalespersons } from '@/hooks/useSalespersons';
import SalespersonModal from '@/components/SalespersonModal';

export default function AboutPage() {
  const { settings } = useSettings();
  const { salespersons, isLoading: salespersonsLoading } = useSalespersons();
  
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeSalespersons = salespersons.filter(p => p.isActive).slice(0, 8);

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
                Our Vision
              </span>
            </div>

            <h1 className="mt-12 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 leading-[0.95] bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent">
              Transparent
              <span className="block mt-4 text-3xl sm:text-5xl lg:text-6xl font-light text-gray-600">
                Laptop Showroom Experience
              </span>
            </h1>

            <div className="mt-16 lg:mt-24">
              <div className="rounded-3xl overflow-hidden border border-gray-200/50 bg-white/70 backdrop-blur-xl shadow-2xl">
                <div className="p-8 lg:p-12">
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">
                    Built in Maisuma, Srinagar to make choosing the right laptop personal and trustworthy—both online and offline.
                    <span className="block mt-4 font-semibold text-2xl text-gray-900">A showroom, not an e-commerce store.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="relative py-32 px-6 bg-white">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
              Our Journey
            </p>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              From Physical Showroom to Digital Transparency
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-8">
              <div className="group relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl p-10 lg:p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-bold mb-6 shadow-lg">
                  <FaStore className="w-4 h-4" />
                  Started 2013
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Physical Showroom</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Began as a trusted laptop showroom in Maisuma, Srinagar, serving local customers who valued honest guidance over aggressive sales.
                </p>
              </div>

              <div className="group relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl p-10 lg:p-12 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold mb-6 shadow-lg">
                  <FaHandshake className="w-4 h-4" />
                  Digital Evolution
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Online Showroom</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Evolved into a digital platform where customers explore real stock, compare specs, read reviews, and connect directly with our team.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=85&w=1400"
                alt="MITC Showroom Experience"
                className="w-full h-[500px] lg:h-[600px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-2xl font-bold text-gray-900 mb-8">What Makes MITC Different</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="group relative p-10 rounded-3xl border border-gray-200 bg-white hover:shadow-[0_35px_90px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">Showroom, Not E-commerce</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  No carts, no instant checkouts, no misleading pricing. Focus on guided discovery and informed decisions.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="group relative p-10 rounded-3xl border border-gray-200 bg-white hover:shadow-[0_35px_90px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FaUsers />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">Direct Human Communication</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Contact multiple salespersons directly. Real people answer queries about availability, conditions, and upgrades.
                </p>
              </div>

              <div className="group relative p-10 rounded-3xl border border-gray-200 bg-white hover:shadow-[0_35px_90px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FaStore />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">Physical Store Assurance</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Visit our Maisuma showroom to inspect products in person and build confidence before deciding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET OUR TEAM */}
      <section className="relative py-32 px-6 bg-white">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
              Our Experts
            </p>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Meet Your Sales Team
            </h2>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              Connect directly with knowledgeable salespersons who understand your needs
            </p>
          </div>

          {salespersonsLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading team...</p>
            </div>
          ) : activeSalespersons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
              {activeSalespersons.map((person) => (
                <div
                  key={person.id}
                  className="group relative w-full max-w-sm hover:shadow-[0_35px_90px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => {
                    setSelectedSalesperson(person);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 hover:border-indigo-300 transition-all duration-300 overflow-hidden">
                    {/* Image/Avatar */}
                    <div className="relative mb-6 mx-auto">
                      <div className="relative h-32 w-32 mx-auto rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50 group-hover:ring-indigo-200/50 transition-all duration-300">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-2xl shadow-2xl">
                            {person.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                        {person.role}
                      </p>
                      {person.likesCount || person.dislikesCount ? (
                        <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
                          <span className="text-green-600 font-semibold">★ {person.likesCount || 0}</span>
                          {person.dislikesCount > 0 && (
                            <span className="text-gray-400">({person.dislikesCount})</span>
                          )}
                        </p>
                      ) : null}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                      <span className="text-white font-bold text-sm uppercase tracking-wider">Click to connect</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold mx-auto mb-6 shadow-2xl">
                <FaUsers className="w-5 h-5" />
                Team coming soon
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our expert sales team will be available here soon. 
                <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold ml-1">
                  Contact us now →
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-24 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xl mb-8">
            <span className="flex h-3 w-3 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">Ready to get started?</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Find Your Perfect Laptop
          </h2>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white text-indigo-600 font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1 w-full sm:w-auto justify-center"
            >
              Get Expert Advice
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/laptops"
              className="inline-flex items-center justify-center px-8 py-5 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold text-lg hover:border-white hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
            >
              Explore Laptops →
            </Link>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <SalespersonModal
          isOpen={isModalOpen}
          salesperson={selectedSalesperson}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSalesperson(null);
          }}
        />
      )}
    </main>
  );
}