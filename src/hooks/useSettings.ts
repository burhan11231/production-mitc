// src/hooks/useSettings.ts
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = doc(db, 'siteSettings', 'global');

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SiteSettings);
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
    const ref = doc(db, 'siteSettings', 'global');

    await setDoc(
      ref,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true } // 🔑 THIS is the fix
    );
  };

  return { settings, isLoading, error, updateSettings };
}