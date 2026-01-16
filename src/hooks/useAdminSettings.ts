'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';
import toast from 'react-hot-toast';

interface UseAdminSettingsReturn {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (data: SiteSettings) => Promise<void>;
}

let cachedSettings: SiteSettings | null = null;

export function useAdminSettings(): UseAdminSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubRef.current) return;

    const ref = doc(db, 'siteSettings', 'global');

    unsubRef.current = onSnapshot(ref, snap => {
      const data = snap.exists() ? (snap.data() as SiteSettings) : DEFAULT_SETTINGS;
      cachedSettings = data;
      setSettings(data);
      setLoading(false);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, []);

  const updateSettings = useCallback(async (data: SiteSettings) => {
    await updateDoc(doc(db, 'siteSettings', 'global'), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    toast.success('Settings updated');
  }, []);

  return { settings, loading, updateSettings };
}