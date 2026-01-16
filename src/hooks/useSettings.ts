'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Settings } from '@/lib/firestore-models'

/* ------------------------------------
   MODULE CACHE (SHARED ACROSS APP)
------------------------------------ */
let cachedSettings: Settings | null = null
let settingsPromise: Promise<Settings | null> | null = null

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(cachedSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    // ✅ Already cached → no Firestore read
    if (cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    // ✅ Fetch already in progress → reuse promise
    if (!settingsPromise) {
      settingsPromise = (async () => {
        const snap = await getDoc(doc(db, 'siteSettings', 'global'))
        cachedSettings = snap.exists() ? (snap.data() as Settings) : null
        return cachedSettings
      })()
    }

    settingsPromise
      .then(data => setSettings(data))
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}