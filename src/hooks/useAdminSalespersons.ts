'use client'

import { useEffect, useState } from 'react'
import { Salesperson } from '@/lib/firestore-models'
import toast from 'react-hot-toast'

export function useAdminSalespersons() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/salespersons', {
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Failed to load')

      const data = await res.json()
      setSalespersons(data)
    } catch {
      toast.error('Failed to load salespersons')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addSalesperson = async (data: any) => {
    await fetch('/api/admin/salespersons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    toast.success('Salesperson added')
    load()
  }

  const updateSalesperson = async (id: string, updates: any) => {
    await fetch('/api/admin/salespersons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    })
    toast.success('Salesperson updated')
    load()
  }

  const deleteSalesperson = async (id: string) => {
    await fetch('/api/admin/salespersons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    toast.success('Salesperson deleted')
    load()
  }

  return {
    salespersons,
    isLoading,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
  }
}