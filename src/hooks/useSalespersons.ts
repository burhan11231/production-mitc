'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Salesperson } from '@/lib/firestore-models';
import toast from 'react-hot-toast';
import { useFirestoreIndexError } from './useFirestoreIndexError';

interface UseSalespersonsReturn {
  salespersons: Salesperson[];
  isLoading: boolean;
  error: FirestoreError | null;
  indexError: any;
  addSalesperson: (data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSalesperson: (id: string, updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSalesperson: (id: string) => Promise<void>;
  reorderSalespersons: (salespersons: Salesperson[]) => Promise<void>;
}

let globalErrorShown = false;
let globalErrorTimeout: NodeJS.Timeout;

export function useSalespersons(): UseSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [indexError, setIndexError] = useState<any>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const { parseIndexError } = useFirestoreIndexError();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    if (unsubscribeRef.current) return;

    // ✅ Only show loading on the first ever subscription.
    if (!hasLoadedOnceRef.current) setIsLoading(true);
    setError(null);
    // ❌ do NOT clear indexError here (prevents dialog/banner flicker)

    const q = query(
      collection(db, 'salespersons'),
      where('isActive', '==', true),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Salesperson[];

        setSalespersons(data);
        hasLoadedOnceRef.current = true;

        setIsLoading(false);
        setError(null);
        setIndexError(null);

        globalErrorShown = false;
        clearTimeout(globalErrorTimeout);
      },
      (err: any) => {
        // ✅ Stop showing loading forever once an error happens.
        hasLoadedOnceRef.current = true;
        setIsLoading(false);

        setError(err);

        const info = parseIndexError(err, projectId);
        const isPermissionDenied = err?.code === 'permission-denied' || err?.code === 'PERMISSION_DENIED';

        if (info.isIndexError || info.isPermissionError || isPermissionDenied) {
          setIndexError(err);
        }

        // ✅ Keep existing salespersons data to avoid UI jumping.
        // (do NOT setSalespersons([]) here)

        if (!globalErrorShown) {
          if (info.isPermissionError || isPermissionDenied) {
            toast.error('Permission denied (Firestore rules).', { duration: 8000 });
          } else if (info.isIndexError) {
            toast.error('Composite index required for salespersons.', { duration: 8000 });
          } else {
            toast.error('Failed to load salespersons', { duration: 8000 });
          }

          globalErrorShown = true;
          clearTimeout(globalErrorTimeout);
          globalErrorTimeout = setTimeout(() => (globalErrorShown = false), 10000);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [projectId, parseIndexError]);

  const addSalesperson = useCallback(
    async (data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await addDoc(collection(db, 'salespersons'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Salesperson added successfully!');
      } catch (err: any) {
        const info = parseIndexError(err, projectId);
        if (info.isIndexError || info.isPermissionError) setIndexError(err);
        toast.error(info.isIndexError ? 'Index required. Please create it first.' : 'Failed to add salesperson');
        throw err;
      }
    },
    [parseIndexError, projectId]
  );

  const updateSalesperson = useCallback(
    async (id: string, updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>) => {
      try {
        await updateDoc(doc(db, 'salespersons', id), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        toast.success('Salesperson updated successfully!');
      } catch (err: any) {
        const info = parseIndexError(err, projectId);
        if (info.isIndexError || info.isPermissionError) setIndexError(err);
        toast.error(info.isIndexError ? 'Index required. Please create it first.' : 'Failed to update salesperson');
        throw err;
      }
    },
    [parseIndexError, projectId]
  );

  const deleteSalesperson = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, 'salespersons', id));
        toast.success('Salesperson deleted successfully!');
      } catch (err: any) {
        const info = parseIndexError(err, projectId);
        if (info.isIndexError || info.isPermissionError) setIndexError(err);
        toast.error(info.isIndexError ? 'Index required. Please create it first.' : 'Failed to delete salesperson');
        throw err;
      }
    },
    [parseIndexError, projectId]
  );

  const reorderSalespersons = useCallback(
    async (items: Salesperson[]) => {
      try {
        const updates = items.map((p, index) => {
          if (!p.id) return Promise.resolve();
          return updateDoc(doc(db, 'salespersons', p.id), {
            order: index,
            updatedAt: serverTimestamp(),
          });
        });
        await Promise.all(updates);
        toast.success('Salespersons reordered successfully!');
      } catch (err: any) {
        const info = parseIndexError(err, projectId);
        if (info.isIndexError || info.isPermissionError) setIndexError(err);
        toast.error(info.isIndexError ? 'Index required. Please create it first.' : 'Failed to reorder salespersons');
        throw err;
      }
    },
    [parseIndexError, projectId]
  );

  return {
    salespersons,
    isLoading,
    error,
    indexError,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
    reorderSalespersons,
  };
}