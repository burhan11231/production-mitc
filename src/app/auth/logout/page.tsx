'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        toast.success('Logged out successfully');
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Error logging out');
        router.push('/');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4" />
        <p className="text-gray-600">Logging you out...</p>
      </div>
    </div>
  );
}
