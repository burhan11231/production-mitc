// src/app/dashboard/settings/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import SettingsTabs from '@/components/admin/SettingsTabs';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage all site settings, team members, and business information</p>
        </div>
      </div>

      {/* Settings Tabs Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SettingsTabs />
      </div>
    </div>
  );
}
