'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import TeamManager from '@/components/admin/TeamManager';

export default function TeamPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 px-safe py-safe">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Team & Founder
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage team members and founder information
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <TeamManager />
      </main>
    </div>
  );
}
