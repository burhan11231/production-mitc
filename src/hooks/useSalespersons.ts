'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Salesperson } from '@/lib/firestore-models';
import toast from 'react-hot-toast';

/* --------------------------------------------------
   MODULE-LEVEL CACHE (SESSION MEMORY)
-------------------------------------------------- */
let cachedSalespersons: Salesperson[] | null = null;
let fetchPromise: Promise<Salesperson[]> | null = null;

interface UseSalespersonsReturn {
  salespersons: Salesperson[];
  isLoading: boolean;
  error: Error | null;
}

/* --------------------------------------------------
   PUBLIC READ-ONLY HOOK
-------------------------------------------------- */
export function useSalespersons(): UseSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1️⃣ Use cache if available
    if (cachedSalespersons) {
      setSalespersons(cachedSalespersons);
      setIsLoading(false);
      return;
    }

    // 2️⃣ Deduplicate concurrent requests
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const q = query(
          collection(db, 'salespersons'),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Salesperson
        );

        cachedSalespersons = data;
        return data;
      })();
    }

    fetchPromise
      .then((data) => {
        if (!isMounted) return;
        setSalespersons(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err);
        setIsLoading(false);
        toast.error('Failed to load team members');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { salespersons, isLoading, error };
}