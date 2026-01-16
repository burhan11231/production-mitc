'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

import { db, rtdb } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

/* ------------------------------------
   MODULE CACHE (APP-WIDE)
------------------------------------ */
let cachedSettings: SiteSettings | null = null;
let cachedHours:
  | {
      activeSeason: 'summer' | 'winter';
      days: Record<string, { open: string; close: string; closed?: boolean }>;
    }
  | null = null;

let settingsPromise: Promise<SiteSettings> | null = null;
let hoursPromise: Promise<typeof cachedHours> | null = null;

/* ------------------------------------
   HOOK
------------------------------------ */
export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  /* ------------------------------------
     READ: FIRESTORE (STATIC SETTINGS)
  ------------------------------------ */
  const loadFirestoreSettings = async () => {
    if (cachedSettings) return cachedSettings;

    if (!settingsPromise) {
      settingsPromise = (async () => {
        const snap = await getDoc(doc(db, 'siteSettings', 'global'));

        cachedSettings = snap.exists()
          ? ({ ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings)
          : DEFAULT_SETTINGS;

        return cachedSettings;
      })();
    }

    return settingsPromise;
  };

  /* ------------------------------------
     READ: RTDB (WORKING HOURS)
  ------------------------------------ */
  const loadWorkingHours = async () => {
    if (cachedHours) return cachedHours;

    if (!hoursPromise) {
      hoursPromise = (async () => {
        const snap = await get(ref(rtdb, 'settings'));

        if (!snap.exists()) {
          return {
            activeSeason: 'summer',
            days: DEFAULT_SETTINGS.workingHours.summer,
          };
        }

        const data = snap.val();

        const activeSeason: 'summer' | 'winter' =
          data.activeSeason === 'winter' ? 'winter' : 'summer';

        return {
          activeSeason,
          days: data.workingHours?.[activeSeason] || {},
        };
      })();
    }

    cachedHours = await hoursPromise;
    return cachedHours;
  };

  /* ------------------------------------
     INITIAL LOAD (ONCE)
  ------------------------------------ */
  useEffect(() => {
    let mounted = true;

    Promise.all([loadFirestoreSettings(), loadWorkingHours()])
      .then(([base, hours]) => {
        if (!mounted) return;

        const merged: SiteSettings & {
          workingHours: {
            activeSeason: 'summer' | 'winter';
            days: Record<string, any>;
          };
        } = {
          ...base,
          workingHours: hours,
        };

        cachedSettings = merged;
        setSettings(merged);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------
     WRITE: FIRESTORE (ADMIN)
  ------------------------------------ */
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    const ref = doc(db, 'siteSettings', 'global');

    await setDoc(
      ref,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    cachedSettings = {
      ...(cachedSettings || DEFAULT_SETTINGS),
      ...updates,
    };

    setSettings(cachedSettings);
  }, []);

  return {
    settings,
    loading,
    updateSettings, // Firestore only (branding / seo / contact)
  };
}