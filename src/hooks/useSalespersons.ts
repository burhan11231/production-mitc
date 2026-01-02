// src/hooks/useSalespersons.ts
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

// Global to track if we've already shown the error
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
    // If we already have an active subscription, don't create another
    if (unsubscribeRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIndexError(null);

    try {
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
          
          // Clear error flag on success
          globalErrorShown = false;
          clearTimeout(globalErrorTimeout);
        },
        (err: any) => {
          setIsLoading(false);
          const errorInfo = parseIndexError(err, projectId);
          setError(err);

          if (errorInfo.isIndexError) {
            setIndexError(err);
            
            // Show toast only once, then wait 10 seconds before allowing another
            if (!globalErrorShown) {
              toast.error(
                'Composite index required for salespersons. Check the error dialog.',
                { duration: 8000 }
              );
              globalErrorShown = true;
              
              // Reset after 10 seconds
              clearTimeout(globalErrorTimeout);
              globalErrorTimeout = setTimeout(() => {
                globalErrorShown = false;
              }, 10000);
            }
          } else {
            if (!globalErrorShown) {
              toast.error('Failed to load salespersons', { duration: 8000 });
              globalErrorShown = true;
              
              clearTimeout(globalErrorTimeout);
              globalErrorTimeout = setTimeout(() => {
                globalErrorShown = false;
              }, 10000);
            }
          }
        }
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (err: any) {
      setIsLoading(false);
      const errorInfo = parseIndexError(err, projectId);
      setError(err);

      if (errorInfo.isIndexError) {
        setIndexError(err);
      }
    }
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
        const errorInfo = parseIndexError(err, projectId);
        if (errorInfo.isIndexError) {
          setIndexError(err);
          toast.error('Index required. Please create it first.');
        } else {
          toast.error('Failed to add salesperson');
        }
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
          toast.error('Index required. Please create it first.');
        } else {
          toast.error('Failed to update salesperson');
        }
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
          toast.error('Index required. Please create it first.');
        } else {
          toast.error('Failed to delete salesperson');
        }
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
          toast.error('Index required. Please create it first.');
        } else {
          toast.error('Failed to reorder salespersons');
        }
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
