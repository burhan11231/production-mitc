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

    const unsubscribe = onValue(settingsRef, snap => {
      if (snap.exists()) {
        const data = snap.val()
        setSettings(prev => ({ ...prev, ...data }))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  /* ---------------------------
     UPDATE SECTIONS (NO SEO)
  --------------------------- */

  const updateBranding = useCallback(async (branding: {
  businessName: string
  tagline: string
  logoUrl: string
}) => {
  await update(ref(rtdb, 'settings/branding'), branding)
}, [])

  const updateBusiness = useCallback(async (business: {
  primaryPhone: string
  primaryWhatsApp: string
  primaryEmail: string
  addressText: string
  mapEmbedUrl: string
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  youtube: string
}) => {
  await update(ref(rtdb, 'settings/business'), business)
}, [])

  const updateHours = useCallback(async (hours: {
    summer: SiteSettings['workingHours']['summer']
    winter: SiteSettings['workingHours']['winter']
    activeSeason: 'summer' | 'winter'
  }) => {
    await update(ref(rtdb, 'settings/hours'), hours)
  }, [])

  const updateFounder = useCallback(async (founder: {
    founderName: string
    founderImageUrl: string
    founderEmail: string
    founderBio: string
  }) => {
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