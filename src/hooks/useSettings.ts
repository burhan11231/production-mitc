// src/hooks/useSettings.ts
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'siteSettings', 'global'),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as SiteSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
        setSettings(DEFAULT_SETTINGS);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const settingsRef = doc(db, 'siteSettings', 'global');
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: new Date(),
      });
      // Local state will update via listener
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return { settings, isLoading, error, updateSettings };
}
