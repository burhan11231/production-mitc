'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Visit {
  id: string;  // client-only, injected manually
  path: string;
  timestamp: Timestamp;
}

type DateRange = 'today' | '7d' | '30d' | 'custom';

const PAGE_GROUPS: Record<string, string> = {
  '/': 'Home',
  '/ratings': 'Ratings',
  '/contact': 'Contact',
  '/team': 'Team',
};

const getPageGroup = (path: string): string => {
  const normalized = path.split('?')[0].split('#')[0];
  return PAGE_GROUPS[normalized] || 'Other';
};

const getFunnelStep = (path: string): string => {
  const group = getPageGroup(path);
  return group === 'Team' || group === 'Ratings' ? group : 'Other';
};

const formatHour = (hour: number): string => hour.toString().padStart(2, '0') + ':00';

export default function AnalyticsDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const rangeParam = (searchParams.get('range') as DateRange) || '30d';
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const [range, setRange] = useState<DateRange>(rangeParam);
  const [fromDate, setFromDate] = useState(fromParam || '');
  const [toDate, setToDate] = useState(toParam || '');

  // Security check
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchVisits = useCallback(async () => {
    if (user?.role !== 'admin') return;

    try {
      setLoading(true);
      setError(null);

      // Build date range query
      let q = query(
        collection(db, 'siteVisits'),
        orderBy('timestamp', 'desc'),
        limit(5000)
      );

      if (range === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        q = query(
          q,
          where('timestamp', '>=', Timestamp.fromDate(today))
        );
      } else if (range === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        q = query(
          q,
          where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
        );
      } else if (range === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        q = query(
          q,
          where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
        );
      } else if (fromDate && toDate) {
        const from = Timestamp.fromDate(new Date(fromDate));
        const to = Timestamp.fromDate(new Date(toDate));
        q = query(q, where('timestamp', '>=', from), where('timestamp', '<=', to));
      }

      const snapshot = await getDocs(q);

      // ✅ FIXED: Proper TypeScript mapping with Omit
      const data: Visit[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Visit, 'id'>),
      }));

      setVisits(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user, range, fromDate, toDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (range !== '30d') params.set('range', range);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [range, fromDate, toDate, router]);

  // Computed analytics
  const analytics = useMemo(() => {
    if (!visits.length) return null;

    const now = new Date();
    const filteredVisits = visits.filter(visit => {
      const visitDate = visit.timestamp.toDate();
      if (range === 'today') {
        return visitDate.toDateString() === now.toDateString();
      }
      if (range === '7d') {
        return visitDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (range === '30d') {
        return visitDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        return visitDate >= from && visitDate <= to;
      }
      return true;
    });

    // Basic stats
    const totalVisits = filteredVisits.length;
    const uniquePages = new Set(filteredVisits.map(v => v.path)).size;
    const pageCounts = filteredVisits.reduce((acc, v) => {
      acc[v.path] = (acc[v.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostVisited = Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '/';

    // Hourly distribution
    const hourly = Array(24).fill(0);
    filteredVisits.forEach(v => {
      hourly[v.timestamp.toDate().getHours()]++;
    });

    // Day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = Array(7).fill(0);
    filteredVisits.forEach(v => {
      dayOfWeek[v.timestamp.toDate().getDay()]++;
    });

    // Page groups
    const groupCounts = filteredVisits.reduce((acc, v) => {
      const group = getPageGroup(v.path);
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Funnel analysis
    const funnelSteps = filteredVisits.reduce((acc, v) => {
      const step = getFunnelStep(v.path);
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversions (same session approximation via time proximity)
    const teamToContact = filteredVisits.filter(v => 
      getPageGroup(v.path) === 'Team'
    ).reduce((count, teamVisit, idx, arr) => {
      const nextVisits = arr.slice(idx + 1);
      const hasContact = nextVisits.some(next => 
        getPageGroup(next.path) === 'Contact' && 
        next.timestamp.toDate().getTime() - teamVisit.timestamp.toDate().getTime() < 30 * 60 * 1000
      );
      return count + (hasContact ? 1 : 0);
    }, 0);

    const ratingsToContact = filteredVisits.filter(v => 
      getPageGroup(v.path) === 'Ratings'
    ).reduce((count, ratingsVisit, idx, arr) => {
      const nextVisits = arr.slice(idx + 1);
      const hasContact = nextVisits.some(next => 
        getPageGroup(next.path) === 'Contact' && 
        next.timestamp.toDate().getTime() - ratingsVisit.timestamp.toDate().getTime() < 30 * 60 * 1000
      );
      return count + (hasContact ? 1 : 0);
    }, 0);

    // Peak hours (top 3)
    const peakHours = hourly
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Anomaly detection (simple: 2x average)
    const avgHourly = hourly.reduce((a, b) => a + b, 0) / 24;
    const anomalies = hourly.map((count, hour) => ({
      hour: formatHour(hour),
      count,
      isAnomaly: count > avgHourly * 2
    })).filter(h => h.isAnomaly);

    return {
      totalVisits,
      uniquePages,
      mostVisited,
      hourly,
      dayOfWeek,
      groupCounts,
      funnelSteps,
      teamToContact,
      ratingsToContact,
      peakHours,
      anomalies,
      filteredCount: filteredVisits.length
    };
  }, [visits, range, fromDate, toDate]);

  const setDateRange = (newRange: DateRange) => {
    setRange(newRange);
    setFromDate('');
    setToDate('');
  };

  const StatsCard = ({ title, value, trend = 0, color = 'blue' }: {
    title: string;
    value: string | number;
    trend?: number;
    color?: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {trend !== 0 && (
          <div className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            {analytics?.filteredCount || 0} visits analyzed ({range.toUpperCase()})
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex gap-2 flex-wrap">
              {(['today', '7d', '30d', 'custom'] as DateRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    range === r
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Custom'}
                </button>
              ))}
            </div>
            {range === 'custom' && (
              <div className="flex gap-3 ml-auto">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate || undefined}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8">
            {error}. <button onClick={fetchVisits} className="underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-6 rounded-2xl h-32" />
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard title="Total Visits" value={analytics.totalVisits.toLocaleString()} />
              <StatsCard title="Unique Pages" value={analytics.uniquePages} />
              <StatsCard 
                title="Top Page" 
                value={analytics.mostVisited} 
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Page Groups */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Page Groups</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.groupCounts)
                    .sort(([,a], [,b]) => b - a)
                    .map(([group, count]) => (
                      <div key={group} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-900">{group}</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">{count}</div>
                          <div className="text-xs text-gray-500">
                            {(count / analytics.totalVisits * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hourly Distribution */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  Hourly Traffic
                  {analytics.anomalies.length > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {analytics.anomalies.length} spikes
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {analytics.hourly.map((count, hour) => {
                    const isAnomaly = analytics.anomalies.some(a => 
                      parseInt(a.hour.split(':')[0]) === hour
                    );
                    return (
                      <div key={hour} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 text-sm font-mono text-gray-500">
                          {formatHour(hour)}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              isAnomaly 
                                ? 'bg-red-500' 
                                : count > analytics.hourly.reduce((a,b)=>a+b,0)/24 * 1.5
                                ? 'bg-orange-500'
                                : 'bg-primary-500'
                            }`}
                            style={{ width: `${Math.min(count / Math.max(...analytics.hourly) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Day of Week */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Day of Week</h3>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={day} className="p-3">
                      <div className="text-xs font-medium text-gray-500 mb-1">{day}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {analytics.dayOfWeek[i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Team → Contact</div>
                      <div className="text-sm text-gray-600">
                        {analytics.teamToContact} / {analytics.funnelSteps.Team || 0} 
                        ({((analytics.teamToContact / (analytics.funnelSteps.Team || 1)) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Ratings → Contact</div>
                      <div className="text-sm text-gray-600">
                        {analytics.ratingsToContact} / {analytics.funnelSteps.Ratings || 0}
                        ({((analytics.ratingsToContact / (analytics.funnelSteps.Ratings || 1)) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Traffic */}
            {analytics.peakHours.map(({ hour, count }, i) => (
  <div
    key={hour}
    className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6"
  >
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex flex-col items-center justify-center text-white font-bold text-sm">
        #{i + 1}
        <div className="text-xs -mt-1">Peak</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {formatHour(hour)}
        </div>
        <div className="text-sm text-gray-600">
          Peak traffic: {count} visits
        </div>
      </div>
    </div>
  </div>
))}
          </>
        ) : (
          <div className="text-center py-24 text-gray-500">
            No analytics data available for selected range
          </div>
        )}
      </div>
    </div>
  );
}