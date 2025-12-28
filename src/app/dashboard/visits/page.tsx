'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Visit {
  id: string;
  timestamp: any;
  path: string;
}

export default function VisitsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stats, setStats] = useState({ total: 0, unique: 0, popular: '' });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVisits();
    }
  }, [user]);

  const fetchVisits = async () => {
    try {
      const q = query(collection(db, 'siteVisits'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const visitsData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Visit[];
      
      setVisits(visitsData);
      
      // Calculate stats
      const total = visitsData.length;
      const paths = visitsData.map(v => v.path);
      const pathCounts = paths.reduce((acc, path) => {
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popular = Object.entries(pathCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '/';
      
      setStats({
        total,
        unique: paths.length,
        popular
      });
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Failed to load visits');
    } finally {
      setVisitsLoading(false);
    }
  };

  const filterByDate = () => {
    if (!fromDate || !toDate) return;
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    const filtered = visits.filter(visit => {
      const visitDate = visit.timestamp?.toDate?.() || new Date(visit.timestamp);
      return visitDate >= from && visitDate <= to;
    });
    
    setFilteredVisits(filtered);
  };

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setFilteredVisits([]);
  };

  const displayVisits = filteredVisits.length > 0 ? filteredVisits : visits;

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
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Site Analytics</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">Total Visits</div>
            <div className="text-4xl font-bold text-primary-600 mt-2">{stats.total}</div>
          </div>
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">Unique Pages</div>
            <div className="text-4xl font-bold text-blue-600 mt-2">{stats.unique}</div>
          </div>
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">Most Popular</div>
            <div className="text-2xl font-bold text-green-600 mt-2 truncate">{stats.popular}</div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Date</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={filterByDate} className="btn-primary flex-1">
                Filter
              </button>
              <button onClick={resetFilters} className="btn-outline flex-1">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Visits Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Visits {filteredVisits.length > 0 && `(${filteredVisits.length})`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Page</th>
                </tr>
              </thead>
              <tbody>
                {visitsLoading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="inline-block">
                        <div className="spinner" />
                      </div>
                    </td>
                  </tr>
                ) : displayVisits.length > 0 ? (
                  displayVisits.slice(0, 100).map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(visit.timestamp?.toDate?.() || visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{visit.path}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-gray-600">
                      No visits found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Analytics Information</h4>
          <p className="text-sm text-blue-800">
            Visit tracking is automatic for all pages. Each page load creates a record in the <code className="bg-blue-100 px-2 py-1 rounded">siteVisits</code> collection.
            Filter by date to analyze traffic patterns. Data is stored indefinitely for historical analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
