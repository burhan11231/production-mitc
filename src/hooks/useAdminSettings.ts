'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set as rtdbSet, get } from 'firebase/database';

import { db } from '@/lib/firebase';
import { rtdb } from '@/lib/firebase-rtdb';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

interface UseAdminSettingsReturn {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (data: Partial<SiteSettings>) => Promise<void>;
  activeSeason: 'summer' | 'winter';
  updateActiveSeason: (season: 'summer' | 'winter') => Promise<void>;
}

/* ------------------------------------
   MODULE CACHE
------------------------------------ */

let cachedSettings: SiteSettings | null = null;
let cachedSeason: 'summer' | 'winter' = 'summer';

export function useAdminSettings(): UseAdminSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [activeSeason, setActiveSeason] = useState<'summer' | 'winter'>(cachedSeason);
  const [loading, setLoading] = useState(!cachedSettings);

  const unsubRef = useRef<(() => void) | null>(null);

  /* ------------------------------------
     FIRESTORE SETTINGS (REALTIME)
  ------------------------------------ */

  useEffect(() => {
    if (unsubRef.current) return;

    const refDoc = doc(db, 'siteSettings', 'global');

    unsubRef.current = onSnapshot(refDoc, snap => {
      const data = snap.exists()
        ? (snap.data() as SiteSettings)
        : DEFAULT_SETTINGS;

      cachedSettings = data;
      setSettings(data);
      setLoading(false);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, []);

  /* ------------------------------------
     RTDB ACTIVE SEASON (ONE READ)
  ------------------------------------ */

  useEffect(() => {
    let mounted = true;

    get(ref(rtdb, 'settings/activeSeason')).then(snap => {
      if (!mounted) return;

      const season =
        snap.exists() && snap.val() === 'winter' ? 'winter' : 'summer';

      cachedSeason = season;
      setActiveSeason(season);
    });

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------
     UPDATE FIRESTORE SETTINGS
  ------------------------------------ */

  const updateSettings = useCallback(
  async (data: Partial<SiteSettings>) => {
    await updateDoc(doc(db, 'siteSettings', 'global'), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    cachedSettings = {
      ...(cachedSettings || DEFAULT_SETTINGS),
      ...data,
    };

    setSettings(cachedSettings);
  },
  []
);

  /* ------------------------------------
     UPDATE ACTIVE SEASON (RTDB)
  ------------------------------------ */

  const updateActiveSeason = useCallback(async (season: 'summer' | 'winter') => {
    await rtdbSet(ref(rtdb, 'settings/activeSeason'), season);
    cachedSeason = season;
    setActiveSeason(season);
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    activeSeason,
    updateActiveSeason,
  };
}