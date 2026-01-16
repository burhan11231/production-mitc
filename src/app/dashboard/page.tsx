'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Stats {
  unreadLeads: number;
  visits24h: number;
  ratings30d: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    unreadLeads: 0,
    visits24h: 0,
    ratings30d: 0,
    totalUsers: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  /* ──────────────────────────
     AUTH GUARD
  ────────────────────────── */
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchStats();
  }, [user]);

  /* ──────────────────────────
     DATA
  ────────────────────────── */
  const fetchStats = async () => {
    try {
      const now = new Date();

      const unreadLeadsSnap = await getDocs(
        query(collection(db, 'leads'), where('read', '==', false))
      );

      const visitsSnap = await getDocs(
        query(
          collection(db, 'siteVisits'),
          where(
            'timestamp',
            '>=',
            Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))
          )
        )
      );

      const ratingsSnap = await getDocs(
        query(
          collection(db, 'reviews'),
          where(
            'createdAt',
            '>=',
            Timestamp.fromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
          )
        )
      );

      const usersSnap = await getDocs(collection(db, 'users'));

      setStats({
        unreadLeads: unreadLeadsSnap.size,
        visits24h: visitsSnap.size,
        ratings30d: ratingsSnap.size,
        totalUsers: usersSnap.size,
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading || user?.role !== 'admin') return null;

  /* ──────────────────────────
     UI
  ────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 px-safe py-safe">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* STATS */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Unread Leads"
              value={stats.unreadLeads}
              loading={statsLoading}
              href="/dashboard/leads"
              accent="text-blue-600"
            />
            <StatCard
              title="Site Visits (24h)"
              value={stats.visits24h}
              loading={statsLoading}
              href="/dashboard/visits"
              accent="text-indigo-600"
            />
            <StatCard
              title="Ratings (30d)"
              value={stats.ratings30d}
              loading={statsLoading}
              href="/dashboard/ratings"
              accent="text-yellow-500"
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              loading={statsLoading}
              href="/dashboard/users"
              accent="text-green-600"
            />
          </div>
        </section>

        {/* MANAGEMENT */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NavCard
              title="Business Settings"
              description="Business details and working hours"
              href="/dashboard/settings"
            />

            <NavCard
  title="Team & Founder"
  description="Manage founder profile and team members"
  href="/dashboard/team"
/>
          </div>
        </section>

        
      </main>
    </div>
  );
}

/* ──────────────────────────
   COMPONENTS
────────────────────────── */

function StatCard({
  title,
  value,
  loading,
  href,
  accent,
}: {
  title: string;
  value: number;
  loading: boolean;
  href: string;
  accent: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
        <p className="text-sm text-gray-600">{title}</p>
        <div className={`text-3xl font-bold mt-2 ${accent}`}>
          {loading ? '—' : value}
        </div>
      </div>
    </Link>
  );
}

function NavCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}