'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { auth } from '@/lib/firebase'
import { Salesperson } from '@/lib/firestore-models'

export function useAdminSalespersons() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* ---------------- FETCH ---------------- */

  const fetchSalespersons = useCallback(async () => {
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Not authenticated')
      }

      const token = await user.getIdToken()

      const res = await fetch('/api/admin/salespersons', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${res.status}: ${text}`)
      }

      const data = await res.json()
      setSalespersons(data)
    } catch (err: any) {
      console.error('[ADMIN_SALESPERSONS_FETCH]', err)
      toast.error('Failed to load salespersons')
      setSalespersons([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ---------------- CRUD ---------------- */

  const addSalesperson = async (payload: Omit<Salesperson, 'id'>) => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('/api/admin/salespersons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Create failed')
    await fetchSalespersons()
  }

  const updateSalesperson = async (
    id: string,
    payload: Partial<Salesperson>
  ) => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`/api/admin/salespersons/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Update failed')
    await fetchSalespersons()
  }

  const deleteSalesperson = async (id: string) => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`/api/admin/salespersons/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('Delete failed')
    await fetchSalespersons()
  }

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    fetchSalespersons()
  }, [fetchSalespersons])

  return {
    salespersons,
    isLoading,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
    refetch: fetchSalespersons,
  }
}