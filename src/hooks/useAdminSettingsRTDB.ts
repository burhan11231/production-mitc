'use client'

import { useEffect, useState, useCallback } from 'react'
import { onValue, ref, update } from 'firebase/database'
import { rtdb } from '@/lib/firebase-rtdb'
import { DEFAULT_SETTINGS, SiteSettings } from '@/lib/firestore-models'

export function useAdminSettingsRTDB() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  /* ---------------------------
     REALTIME LISTENER
  --------------------------- */

  useEffect(() => {
    const settingsRef = ref(rtdb, 'settings')

    const unsubscribe = onValue(
      settingsRef,
      snapshot => {
        if (!snapshot.exists()) {
          setSettings(DEFAULT_SETTINGS)
          setLoading(false)
          return
        }

        const data = snapshot.val()

        const merged: SiteSettings = {
          ...DEFAULT_SETTINGS,

          /* ---------- BRANDING ---------- */
          businessName: data.branding?.businessName ?? DEFAULT_SETTINGS.businessName,
          tagline: data.branding?.tagline ?? DEFAULT_SETTINGS.tagline,
          logoUrl: data.branding?.logoUrl ?? DEFAULT_SETTINGS.logoUrl,

          /* ---------- BUSINESS ---------- */
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

          /* ---------- HOURS ---------- */
          workingHours: {
            summer: data.hours?.summer ?? DEFAULT_SETTINGS.workingHours.summer,
            winter: data.hours?.winter ?? DEFAULT_SETTINGS.workingHours.winter,
            activeSeason: data.hours?.activeSeason ?? 'summer',
          },

          /* ---------- FOUNDER ---------- */
          founderName: data.founder?.founderName ?? '',
          founderImageUrl: data.founder?.founderImageUrl ?? '',
          founderEmail: data.founder?.founderEmail ?? '',
          founderBio: data.founder?.founderBio ?? '',
        }

        setSettings(merged)
        setLoading(false)
      },
      error => {
        console.error('RTDB settings error:', error)
        setSettings(DEFAULT_SETTINGS)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  /* ---------------------------
     UPDATERS (TYPED)
  --------------------------- */

  const updateBranding = useCallback(
    async (branding: {
      businessName: string
      tagline: string
      logoUrl: string
    }) => {
      await update(ref(rtdb, 'settings/branding'), branding)
    },
    []
  )

  const updateBusiness = useCallback(
    async (business: {
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
    },
    []
  )

  const updateHours = useCallback(
    async (hours: {
      summer: SiteSettings['workingHours']['summer']
      winter: SiteSettings['workingHours']['winter']
      activeSeason: 'summer' | 'winter'
    }) => {
      await update(ref(rtdb, 'settings/hours'), hours)
    },
    []
  )

  const updateFounder = useCallback(
    async (founder: {
      founderName: string
      founderImageUrl: string
      founderEmail: string
      founderBio: string
    }) => {
      await update(ref(rtdb, 'settings/founder'), founder)
    },
    []
  )

  return {
    settings,
    loading,
    updateBranding,
    updateBusiness,
    updateHours,
    updateFounder,
  }
}