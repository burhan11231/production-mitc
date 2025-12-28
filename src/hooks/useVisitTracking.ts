'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Track visits less frequently to respect free tier limits
// Only track once per session per page
const trackedPaths = new Set<string>();

export function useVisitTracking() {
  const pathname = usePathname();
  const visitTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Don't track:
    // - Admin routes (high traffic, not relevant to analytics)
    // - Auth pages (not user traffic)
    // - API routes
    // - Already tracked paths (once per session)
    if (
      pathname.includes('/dashboard') ||
      pathname.includes('/login') ||
      pathname.includes('/signup') ||
      pathname.startsWith('/api') ||
      trackedPaths.has(pathname)
    ) {
      return;
    }

    // Clear any pending timeout
    if (visitTimeoutRef.current) {
      clearTimeout(visitTimeoutRef.current);
    }

    // Batch writes: debounce tracking to reduce Firestore writes
    // Wait 2 seconds to ensure user stays on page
    visitTimeoutRef.current = setTimeout(async () => {
      try {
        // Only track public pages
        if (!pathname.startsWith('/profile')) {
          await addDoc(collection(db, 'siteVisits'), {
            path: pathname,
            timestamp: serverTimestamp(),
          });

          // Mark as tracked in this session
          trackedPaths.add(pathname);
        }
      } catch (error) {
        // Silently fail - don't break the app for tracking errors
        console.debug('Visit tracking failed:', error);
      }
    }, 2000);

    return () => {
      if (visitTimeoutRef.current) {
        clearTimeout(visitTimeoutRef.current);
      }
    };
  }, [pathname]);
}
