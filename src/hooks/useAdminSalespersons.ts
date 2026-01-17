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
  reorderSalespersons: (items: Salesperson[]) => Promise<void>;
}

export function useAdminSalespersons(): UseAdminSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [indexError, setIndexError] = useState<any>(null);

  const unsubRef = useRef<(() => void) | null>(null);
  const loadedOnceRef = useRef(false);

  const { parseIndexError } = useFirestoreIndexError();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  useEffect(() => {
    if (unsubRef.current) return;

    const q = query(
      collection(db, 'salespersons'),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );

    unsubRef.current = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(
          d => ({ id: d.id, ...d.data() }) as Salesperson
        );
        setSalespersons(data);
        setIsLoading(false);
        setError(null);
        setIndexError(null);
        loadedOnceRef.current = true;
      },
      (err: FirestoreError) => {
        setIsLoading(false);
        setError(err);
        const info = parseIndexError(err, projectId);
        if (info.isIndexError || err.code === 'permission-denied') {
          setIndexError(err);
        }
        if (!loadedOnceRef.current) {
          toast.error('Failed to load salespersons');
        }
      }
    );

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [parseIndexError, projectId]);

  const addSalesperson = useCallback(
  async (
    data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await addDoc(collection(db, 'salespersons'), {
  ...data,
  likesCount: 0,
  dislikesCount: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
    toast.success('Salesperson added');
  },
  []
);

const updateSalesperson = useCallback(
  async (
    id: string,
    updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>
  ) => {
    await updateDoc(doc(db, 'salespersons', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    toast.success('Salesperson updated');
  },
  []
);

const deleteSalesperson = useCallback(
  async (id: string) => {
    await deleteDoc(doc(db, 'salespersons', id));
    toast.success('Salesperson deleted');
  },
  []
);

const reorderSalespersons = useCallback(
  async (items: Salesperson[]) => {
    await Promise.all(
      items.map((p, index) =>
        updateDoc(doc(db, 'salespersons', p.id!), {
          order: index,
          updatedAt: serverTimestamp(),
        })
      )
    );
  },
  []
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