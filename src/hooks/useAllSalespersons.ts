// src/hooks/useAllSalespersons.ts
// Hook to fetch ALL salespersons (active + inactive) for admin panel
// Unlike useSalespersons() which only fetches active ones

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Salesperson } from '@/lib/firestore-models'
import { useFirestoreIndexError } from './useFirestoreIndexError'

interface UseAllSalespersonsReturn {
  salespersons: Salesperson[]
  isLoading: boolean
  error: FirestoreError | null
  indexError: any
}

let globalErrorShown = false
let globalErrorTimeout: NodeJS.Timeout

export function useAllSalespersons(): UseAllSalespersonsReturn {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)
  const [indexError, setIndexError] = useState<any>(null)

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const hasLoadedOnceRef = useRef(false)

  const { parseIndexError } = useFirestoreIndexError()
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''

  useEffect(() => {
    if (unsubscribeRef.current) return

    if (!hasLoadedOnceRef.current) setIsLoading(true)
    setError(null)

    // Query ALL salespersons (no isActive filter)
    const q = query(
      collection(db, 'salespersons'),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Salesperson[]

        setSalespersons(data)
        hasLoadedOnceRef.current = true

        setIsLoading(false)
        setError(null)
        setIndexError(null)

        globalErrorShown = false
        clearTimeout(globalErrorTimeout)
      },
      (err: any) => {
        hasLoadedOnceRef.current = true
        setIsLoading(false)
        setError(err)

        const info = parseIndexError(err, projectId)
        const isPermissionDenied = err?.code === 'permission-denied' || err?.code === 'PERMISSION_DENIED'

        if (info.isIndexError || info.isPermissionError || isPermissionDenied) {
          setIndexError(err)
        }

        if (!globalErrorShown) {
          if (info.isPermissionError || isPermissionDenied) {
            console.error('Permission denied (Firestore rules).')
          } else if (info.isIndexError) {
            console.error('Composite index required for all salespersons.')
          } else {
            console.error('Failed to load salespersons')
          }

          globalErrorShown = true
          clearTimeout(globalErrorTimeout)
          globalErrorTimeout = setTimeout(() => (globalErrorShown = false), 10000)
        }
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  }, [projectId, parseIndexError])

  return {
    salespersons,
    isLoading,
    error,
    indexError,
  }
}
