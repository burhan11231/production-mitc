'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, get, set as rtdbSet } from 'firebase/database';

import { db, rtdb } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

/* ------------------------------------
   MODULE CACHE (APP-WIDE)
------------------------------------ */

let cachedSettings: SiteSettings | null = null;

let cachedHours:
  | {
      activeSeason: 'summer' | 'winter';
    }
  | null = null;

let settingsPromise: Promise<SiteSettings> | null = null;
type ActiveSeasonState = {
  activeSeason: 'summer' | 'winter';
};

let cachedHours: ActiveSeasonState | null = null;
let hoursPromise: Promise<ActiveSeasonState> | null = null;

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
     READ: RTDB (ACTIVE SEASON ONLY)
  ------------------------------------ */

  const loadWorkingHoursSeason = async () => {
    if (cachedHours) return cachedHours;

    if (!hoursPromise) {
      hoursPromise = (async () => {
        const snap = await get(ref(rtdb, 'settings/activeSeason'));

        const activeSeason: 'summer' | 'winter' =
          snap.exists() && snap.val() === 'winter' ? 'winter' : 'summer';

        return { activeSeason };
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

    Promise.all([loadFirestoreSettings(), loadWorkingHoursSeason()])
      .then(([base, season]) => {
        if (!mounted) return;

        const merged: SiteSettings & {
          workingHours: SiteSettings['workingHours'] & {
            activeSeason: 'summer' | 'winter';
          };
        } = {
          ...base,
          workingHours: {
            ...base.workingHours,
            activeSeason: season.activeSeason,
          },
        };

        cachedSettings = merged;
        setSettings(merged);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------
     WRITE: FIRESTORE (ADMIN SETTINGS)
     Branding / SEO / Contacts / Hours
  ------------------------------------ */

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    const refDoc = doc(db, 'siteSettings', 'global');

    await setDoc(
      refDoc,
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

  /* ------------------------------------
     WRITE: RTDB (ADMIN SEASON TOGGLE)
  ------------------------------------ */

  const updateActiveSeason = useCallback(
    async (season: 'summer' | 'winter') => {
      await rtdbSet(ref(rtdb, 'settings/activeSeason'), season);

      cachedHours = { activeSeason: season };

      if (cachedSettings) {
        cachedSettings = {
          ...cachedSettings,
          workingHours: {
            ...cachedSettings.workingHours,
            activeSeason: season,
          },
        };

        setSettings(cachedSettings);
      }
    },
    []
  );

  /* ------------------------------------
     RETURN
  ------------------------------------ */

  return {
    settings,
    loading,
    updateSettings,      // Firestore (admin)
    updateActiveSeason,  // RTDB (admin)
  };
}