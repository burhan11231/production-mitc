'use client';

import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import { useVisitTracking } from '@/hooks/useVisitTracking';

function VisitTracker() {
  useVisitTracking();
  return null;
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <VisitTracker />
      {children}
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
