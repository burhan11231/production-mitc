// src/hooks/useSalespersons.ts
// src/hooks/useSalespersons.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
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

export function useSalespersons(): UseSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [indexError, setIndexError] = useState<any>(null);
  const { parseIndexError } = useFirestoreIndexError();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIndexError(null);

    try {
      // This query requires a composite index!
      const q = query(
        collection(db, 'salespersons'),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Salesperson[];
          setSalespersons(data);
          setIsLoading(false);
          setError(null);
          setIndexError(null);
        },
        (err: any) => {
          setIsLoading(false);
          
          const errorInfo = parseIndexError(err, projectId);
          setError(err);

          if (errorInfo.isIndexError) {
            setIndexError(err);
            toast.error(
              'Composite index required for salespersons. Check the error dialog.',
              { duration: 8000 }
            );
          } else {
            toast.error('Failed to load salespersons');
          }
        }
      );

      return unsubscribe;
    } catch (err: any) {
      setIsLoading(false);
      const errorInfo = parseIndexError(err, projectId);
      setError(err);

      if (errorInfo.isIndexError) {
        setIndexError(err);
      }
    }
  }, [parseIndexError, projectId]);

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
        const errorInfo = parseIndexError(err, projectId);
        if (errorInfo.isIndexError) {
          setIndexError(err);
        }
        toast.error('Failed to add salesperson');
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
        const errorInfo = parseIndexError(err, projectId);
        if (errorInfo.isIndexError) {
          setIndexError(err);
        }
        toast.error('Failed to update salesperson');
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
        const errorInfo = parseIndexError(err, projectId);
        if (errorInfo.isIndexError) {
          setIndexError(err);
        }
        toast.error('Failed to delete salesperson');
        throw err;
      }
    },
    [parseIndexError, projectId]
  );

  const reorderSalespersons = useCallback(
    async (salespersons: Salesperson[]) => {
      try {
        const updates = salespersons.map(async (person, index) => {
          if (person.id) {
            await updateDoc(doc(db, 'salespersons', person.id), {
              order: index,
              updatedAt: serverTimestamp(),
            });
          }
        });
        await Promise.all(updates);
        toast.success('Salespersons reordered successfully!');
      } catch (err: any) {
        const errorInfo = parseIndexError(err, projectId);
        if (errorInfo.isIndexError) {
          setIndexError(err);
        }
        toast.error('Failed to reorder salespersons');
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
