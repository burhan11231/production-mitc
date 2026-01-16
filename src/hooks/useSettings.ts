'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, get, set as rtdbSet } from 'firebase/database';

import { db } from '@/lib/firebase';
import { rtdb } from '@/lib/firebase-rtdb'; // 👈 IMPORTANT (see note below)
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

/* ------------------------------------
   TYPES
------------------------------------ */

type ActiveSeasonState = {
  activeSeason: 'summer' | 'winter';
};

/* ------------------------------------
   MODULE CACHE (APP-WIDE)
------------------------------------ */

// Firestore (static site settings)
let cachedSettings: SiteSettings | null = null;
let settingsPromise: Promise<SiteSettings> | null = null;

// RTDB (active season only)
let cachedSeason: ActiveSeasonState | null = null;
let seasonPromise: Promise<ActiveSeasonState> | null = null;

/* ------------------------------------
   HOOK
------------------------------------ */

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  /* ------------------------------------
     READ: FIRESTORE (ONCE PER APP LOAD)
  ------------------------------------ */

  const loadFirestoreSettings = async (): Promise<SiteSettings> => {
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

  const loadActiveSeason = async (): Promise<ActiveSeasonState> => {
    if (cachedSeason) return cachedSeason;

    if (!seasonPromise) {
      seasonPromise = (async () => {
        const snap = await get(ref(rtdb, 'settings/activeSeason'));

        const activeSeason: 'summer' | 'winter' =
          snap.exists() && snap.val() === 'winter' ? 'winter' : 'summer';

        return { activeSeason };
      })();
    }

    cachedSeason = await seasonPromise;
    return cachedSeason;
  };

  /* ------------------------------------
     INITIAL LOAD (ONCE)
  ------------------------------------ */

  useEffect(() => {
    let mounted = true;

    Promise.all([loadFirestoreSettings(), loadActiveSeason()])
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
     WRITE: FIRESTORE (ADMIN)
     Branding / SEO / Contact / Hours
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

      cachedSeason = { activeSeason: season };

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
    updateSettings,     // Firestore (admin)
    updateActiveSeason, // RTDB (admin)
  };
}