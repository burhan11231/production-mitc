'use client';

import { useEffect, useState } from 'react';
import { Salesperson } from '@/lib/firestore-models';
import toast from 'react-hot-toast';

let cachedSalespersons: Salesperson[] | null = null;
let fetchPromise: Promise<Salesperson[]> | null = null;

export function useSalespersons() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // ✅ Serve from memory cache
    if (cachedSalespersons) {
      setSalespersons(cachedSalespersons);
      setIsLoading(false);
      return;
    }

    // ✅ Single fetch guard
    if (!fetchPromise) {
      fetchPromise = fetch('/api/salespersons', {
        cache: 'no-store',
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
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