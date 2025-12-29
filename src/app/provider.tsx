'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import { useVisitTracking } from '@/hooks/useVisitTracking';
import { initFirebase } from '@/lib/firebase';

function VisitTracker() {
  useVisitTracking();
  return null;
}

export function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Firebase once on the client
    initFirebase();
  }, []);

  return (
    <AuthProvider>
      <VisitTracker />
      {children}
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
