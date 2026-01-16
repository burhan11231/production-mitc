'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection,
  query,
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

interface UseAdminSalespersonsReturn {
  salespersons: Salesperson[];
  isLoading: boolean;
  error: FirestoreError | null;
  indexError: any;
  addSalesperson: (
    data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateSalesperson: (
    id: string,
    updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteSalesperson: (id: string) => Promise<void>;
  reorderSalespersons: (salespersons: Salesperson[]) => Promise<void>;
}

/* --------------------------------------------------
   GLOBAL ERROR THROTTLING (GOOD PRACTICE)
-------------------------------------------------- */
let globalErrorShown = false;
let globalErrorTimeout: NodeJS.Timeout;

export function useAdminSalespersons(): UseAdminSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [indexError, setIndexError] = useState<any>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const { parseIndexError } = useFirestoreIndexError();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  /* --------------------------------------------------
     REALTIME SUBSCRIPTION (ADMIN ONLY)
  -------------------------------------------------- */
  useEffect(() => {
    if (unsubscribeRef.current) return;

    if (!hasLoadedOnceRef.current) setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'salespersons'),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Salesperson
        );

        setSalespersons(data);
        setIsLoading(false);
        setError(null);
        setIndexError(null);
        hasLoadedOnceRef.current = true;

        globalErrorShown = false;
        clearTimeout(globalErrorTimeout);
      },
      (err: FirestoreError) => {
        hasLoadedOnceRef.current = true;
        setIsLoading(false);
        setError(err);

        const info = parseIndexError(err, projectId);
        const permissionDenied =
          err.code === 'permission-denied' ||
          err.code === 'PERMISSION_DENIED';

        if (info.isIndexError || info.isPermissionError || permissionDenied) {
          setIndexError(err);
        }

        if (!globalErrorShown) {
          toast.error(
            info.isPermissionError || permissionDenied
              ? 'Permission denied (Firestore rules).'
              : info.isIndexError
              ? 'Composite index required for salespersons.'
              : 'Failed to load salespersons',
            { duration: 8000 }
          );

          globalErrorShown = true;
          clearTimeout(globalErrorTimeout);
          globalErrorTimeout = setTimeout(
            () => (globalErrorShown = false),
            10000
          );
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [parseIndexError, projectId]);

  /* --------------------------------------------------
     MUTATIONS
  -------------------------------------------------- */

  const addSalesperson = useCallback(
    async (data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>) => {
      await addDoc(collection(db, 'salespersons'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Salesperson added');
    },
    []
  );

  const updateSalesperson = useCallback(
    async (id: string, updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>) => {
      await updateDoc(doc(db, 'salespersons', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Salesperson updated');
    },
    []
  );

  const deleteSalesperson = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'salespersons', id));
    toast.success('Salesperson deleted');
  }, []);

  const reorderSalespersons = useCallback(async (items: Salesperson[]) => {
    await Promise.all(
      items.map((p, index) =>
        updateDoc(doc(db, 'salespersons', p.id), {
          order: index,
          updatedAt: serverTimestamp(),
        })
      )
    );
    toast.success('Salespersons reordered');
  }, []);

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