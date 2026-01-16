'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

/* ------------------------------------
   MODULE CACHE (SHARED ACROSS APP)
------------------------------------ */
let cachedSettings: SiteSettings | null = null;
let settingsPromise: Promise<SiteSettings | null> | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  /* ------------------------------------
     READ (CACHED, SINGLE FIRESTORE READ)
  ------------------------------------ */
  useEffect(() => {
    // Already cached → no Firestore read
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    // Fetch already in progress → reuse promise
    if (!settingsPromise) {
      settingsPromise = (async () => {
        const snap = await getDoc(doc(db, 'siteSettings', 'global'));

        cachedSettings = snap.exists()
          ? ({ ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings)
          : DEFAULT_SETTINGS;

        return cachedSettings;
      })();
    }

    settingsPromise
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  /* ------------------------------------
     WRITE (ADMIN ONLY)
  ------------------------------------ */
  const updateSettings = useCallback(async (updates: SiteSettings) => {
    const ref = doc(db, 'siteSettings', 'global');

    await setDoc(
      ref,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Update cache + state
    cachedSettings = updates;
    setSettings(updates);
  }, []);

  return {
    settings,
    loading,
    updateSettings,
  };
}