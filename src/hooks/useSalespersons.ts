'use client';

import { useEffect, useState } from 'react';
import { Salesperson } from '@/lib/firestore-models';
import toast from 'react-hot-toast';

/* --------------------------------------------------
   MODULE CACHE (SESSION)
-------------------------------------------------- */
let cachedSalespersons: Salesperson[] | null = null;
let fetchPromise: Promise<Salesperson[]> | null = null;

interface UseSalespersonsReturn {
  salespersons: Salesperson[];
  isLoading: boolean;
  error: Error | null;
}

export function useSalespersons(): UseSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ Use memory cache
    if (cachedSalespersons) {
      setSalespersons(cachedSalespersons);
      setIsLoading(false);
      return;
    }

    // 2️⃣ Deduplicate concurrent fetches
    if (!fetchPromise) {
      fetchPromise = fetch('/api/salespersons')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch salespersons');
          return res.json();
        })
        .then((data: Salesperson[]) => {
          cachedSalespersons = data;
          return data;
        });
    }

    fetchPromise
      .then(data => {
        if (!mounted) return;
        setSalespersons(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err);
        setIsLoading(false);
        toast.error('Failed to load team members');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { salespersons, isLoading, error };
}