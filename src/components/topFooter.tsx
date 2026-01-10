'use client';

import Link from 'next/link';

export default function TopFooter() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">
            Store Location
          </p>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            Gaw Kadal, Maisuma
          </h3>
          <p className="text-sm text-gray-500">
            Srinagar, J&K — 190001
          </p>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="my-6 h-px bg-gray-200" />

      {/* FOOT ACTION ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <a
          href="https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-900 hover:underline"
        >
          Get Directions →
        </a>
      </div>
    </div>
  );
}