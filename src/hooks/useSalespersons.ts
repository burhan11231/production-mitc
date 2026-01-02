// src/hooks/useSalespersons.ts
'use client';

import { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Salesperson } from '@/lib/firestore-models';

export function useSalespersons() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Real-time listener
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'salespersons'),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Salesperson[];
        setSalespersons(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching salespersons:', err);
        setError('Failed to load salespersons');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addSalesperson = async (data: Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'salespersons'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding salesperson:', err);
      throw err;
    }
  };

  const updateSalesperson = async (
    id: string,
    updates: Partial<Omit<Salesperson, 'id' | 'createdAt'>>
  ) => {
    try {
      await updateDoc(doc(db, 'salespersons', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating salesperson:', err);
      throw err;
    }
  };

  const deleteSalesperson = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'salespersons', id));
    } catch (err) {
      console.error('Error deleting salesperson:', err);
      throw err;
    }
  };

  const reorderSalespersons = async (salespersons: Salesperson[]) => {
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
    } catch (err) {
      console.error('Error reordering salespersons:', err);
      throw err;
    }
  };

  return {
    salespersons,
    isLoading,
    error,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
    reorderSalespersons,
  };
}
