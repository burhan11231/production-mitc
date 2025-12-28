'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  businessName: string;
  salespersonName: string;
  email: string;
  phone: string;
  whatsappLink: string;
  instagram: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  workingHours: {
    summer: Record<string, { open: string; close: string }>;
    winter: Record<string, { open: string; close: string }>;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'MITC - Mateen IT Corp',
  metaDescription: 'Kashmir\'s Tech Authority Since 2013',
  ogImageUrl: '',
  businessName: 'MITC',
  salespersonName: 'Team MITC',
  email: '',
  phone: '',
  whatsappLink: '',
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  workingHours: {
    summer: {
      Monday: { open: '09:00', close: '18:00' },
      Tuesday: { open: '09:00', close: '18:00' },
      Wednesday: { open: '09:00', close: '18:00' },
      Thursday: { open: '09:00', close: '18:00' },
      Friday: { open: '09:00', close: '18:00' },
      Saturday: { open: '10:00', close: '16:00' },
      Sunday: { open: '10:00', close: '16:00' },
    },
    winter: {
      Monday: { open: '09:00', close: '17:00' },
      Tuesday: { open: '09:00', close: '17:00' },
      Wednesday: { open: '09:00', close: '17:00' },
      Thursday: { open: '09:00', close: '17:00' },
      Friday: { open: '09:00', close: '17:00' },
      Saturday: { open: '10:00', close: '15:00' },
      Sunday: { open: '10:00', close: '15:00' },
    },
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'siteSettings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as SiteSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const settingsRef = doc(db, 'siteSettings', 'global');
      await updateDoc(settingsRef, updates);
      setSettings((prev) => (prev ? { ...prev, ...updates } : DEFAULT_SETTINGS));
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return { settings, isLoading, error, updateSettings };
}
