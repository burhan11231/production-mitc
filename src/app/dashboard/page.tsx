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
  orderBy,
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

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch unread leads
      const leadsSnap = await getDocs(
        query(collection(db, 'leads'), where('read', '==', false))
      );
      const unreadLeads = leadsSnap.size;

      // Fetch visits in last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const visitsSnap = await getDocs(
        query(
          collection(db, 'siteVisits'),
          where('timestamp', '>=', Timestamp.fromDate(yesterday))
        )
      );
      const visits24h = visitsSnap.size;

      // Fetch ratings in last 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ratingsSnap = await getDocs(
        query(
          collection(db, 'reviews'),
          where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
        )
      );
      const ratings30d = ratingsSnap.size;

      // Fetch total users
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;

      setStats({
        unreadLeads,
        visits24h,
        ratings30d,
        totalUsers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Unread Leads Card */}
          <Link href="/dashboard/leads">
            <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Unread Leads</p>
                  <div className="text-4xl font-bold text-primary-600 mt-3">
                    {statsLoading ? '-' : stats.unreadLeads}
                  </div>
                </div>
                <div className="text-3xl">✉️</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Click to view all leads</p>
            </div>
          </Link>

          {/* Site Visits Card */}
          <Link href="/dashboard/visits">
            <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Site Visits (24h)</p>
                  <div className="text-4xl font-bold text-blue-600 mt-3">
                    {statsLoading ? '-' : stats.visits24h}
                  </div>
                </div>
                <div className="text-3xl">👁️</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Click to view analytics</p>
            </div>
          </Link>

          {/* Ratings Card */}
          <Link href="/dashboard/ratings">
            <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Ratings (30d)</p>
                  <div className="text-4xl font-bold text-yellow-500 mt-3">
                    {statsLoading ? '-' : stats.ratings30d}
                  </div>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Click to moderate</p>
            </div>
          </Link>

          {/* Users Card */}
          <Link href="/dashboard/users">
            <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <div className="text-4xl font-bold text-green-600 mt-3">
                    {statsLoading ? '-' : stats.totalUsers}
                  </div>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Click to manage users</p>
            </div>
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram Gallery */}
            <Link href="/dashboard/instagram">
              <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="text-xl font-bold text-gray-900">Instagram Gallery</h3>
                <p className="text-gray-600 text-sm mt-2">Manage embedded Instagram posts</p>
                <div className="mt-4 text-primary-600 font-medium text-sm">→ Manage</div>
              </div>
            </Link>

            {/* Settings */}
            <Link href="/dashboard/settings">
              <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-xl font-bold text-gray-900">Settings</h3>
                <p className="text-gray-600 text-sm mt-2">Configure SEO, business details, hours</p>
                <div className="mt-4 text-primary-600 font-medium text-sm">→ Configure</div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href="/dashboard/visits">
              <div className="card p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-gray-900">Analytics</h3>
                <p className="text-gray-600 text-sm mt-2">View detailed site analytics and reports</p>
                <div className="mt-4 text-primary-600 font-medium text-sm">→ View</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📖 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">First Steps</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Update your business details in Settings</li>
                <li>✓ Configure SEO metadata for your site</li>
                <li>✓ Set your working hours and contact info</li>
                <li>✓ Add Instagram posts to gallery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Daily Tasks</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Check unread leads and respond</li>
                <li>✓ Review new ratings and feedback</li>
                <li>✓ Monitor site visits and traffic</li>
                <li>✓ Manage user inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
