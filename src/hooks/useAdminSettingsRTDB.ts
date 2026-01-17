'use client'

import { useEffect, useState, useCallback } from 'react'
import { onValue, ref, update } from 'firebase/database'
import { rtdb } from '@/lib/firebase-rtdb'
import { DEFAULT_SETTINGS, SiteSettings } from '@/lib/firestore-models'

export function useAdminSettingsRTDB() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const settingsRef = ref(rtdb, 'settings')

    const unsubscribe = onValue(settingsRef, snapshot => {
      if (!snapshot.exists()) {
        setSettings(DEFAULT_SETTINGS)
        setLoading(false)
        return
      }

      const data = snapshot.val()

      const merged: SiteSettings = {
        ...DEFAULT_SETTINGS,

        // Branding
        businessName: data.branding?.businessName ?? '',
        tagline: data.branding?.tagline ?? '',
        logoUrl: data.branding?.logoUrl ?? '',

        // Business
        primaryPhone: data.business?.primaryPhone ?? '',
        primaryWhatsApp: data.business?.primaryWhatsApp ?? '',
        primaryEmail: data.business?.primaryEmail ?? '',
        addressText: data.business?.addressText ?? '',
        mapEmbedUrl: data.business?.mapEmbedUrl ?? '',
        instagram: data.business?.instagram ?? '',
        facebook: data.business?.facebook ?? '',
        twitter: data.business?.twitter ?? '',
        linkedin: data.business?.linkedin ?? '',
        youtube: data.business?.youtube ?? '',

        // Hours
        workingHours: {
          summer: data.hours?.summer ?? DEFAULT_SETTINGS.workingHours.summer,
          winter: data.hours?.winter ?? DEFAULT_SETTINGS.workingHours.winter,
          activeSeason: data.hours?.activeSeason ?? 'summer',
        },

        // Founder
        founderName: data.founder?.founderName ?? '',
        founderImageUrl: data.founder?.founderImageUrl ?? '',
        founderEmail: data.founder?.founderEmail ?? '',
        founderBio: data.founder?.founderBio ?? '',
      }

      setSettings(merged)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  /* ---------- UPDATERS ---------- */

  const updateBranding = useCallback(async (branding) => {
    await update(ref(rtdb, 'settings/branding'), branding)
  }, [])

  const updateBusiness = useCallback(async (business) => {
    await update(ref(rtdb, 'settings/business'), business)
  }, [])

  const updateHours = useCallback(async (hours) => {
    await update(ref(rtdb, 'settings/hours'), hours)
  }, [])

  const updateFounder = useCallback(async (founder) => {
    await update(ref(rtdb, 'settings/founder'), founder)
  }, [])

  return {
    settings,
    loading,
    updateBranding,
    updateBusiness,
    updateHours,
    updateFounder,
  }
}