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
  const { parseIndexError } = useFirestoreIndexError();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    if (unsubscribeRef.current) return;

    setIsLoading(true);
    setError(null);
    setIndexError(null);

    // ✅ Only read active documents (prevents permission-denied on inactive docs)
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
        setIsLoading(false);
        setError(null);
        setIndexError(null);

        globalErrorShown = false;
        clearTimeout(globalErrorTimeout);
      },
      (err: any) => {
        if (!globalErrorShown) {
          console.log('salespersons snapshot error:', {
            code: err?.code,
            message: err?.message,
            name: err?.name,
          });
        }

        setIsLoading(false);
        setError(err);

        const info = parseIndexError(err, projectId);

        // show dialog for index/rules errors
        if (info.isIndexError || info.isPermissionError) {
          setIndexError(err);
        }

        if (!globalErrorShown) {
          if (info.isPermissionError) {
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
      await addDoc(collection(db, 'salespersons'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Salesperson added successfully!');
    },
    []
  );

  const updateSalesperson = useCallback(async (id: string, updates: any) => {
    await updateDoc(doc(db, 'salespersons', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    toast.success('Salesperson updated successfully!');
  }, []);

  const deleteSalesperson = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'salespersons', id));
    toast.success('Salesperson deleted successfully!');
  }, []);

  const reorderSalespersons = useCallback(async (items: Salesperson[]) => {
    const updates = items.map((p, index) => {
      if (!p.id) return Promise.resolve();
      return updateDoc(doc(db, 'salespersons', p.id), {
        order: index,
        updatedAt: serverTimestamp(),
      });
    });
    await Promise.all(updates);
    toast.success('Salespersons reordered successfully!');
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