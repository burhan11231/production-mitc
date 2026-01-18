'use client'

import { useEffect, useState } from 'react'
import { Salesperson } from '@/lib/firestore-models'
import toast from 'react-hot-toast'

export function useAdminSalespersons() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    const res = await fetch('/api/admin/salespersons')
    const data = await res.json()
    setSalespersons(data)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const addSalesperson = async (data: any) => {
    await fetch('/api/admin/salespersons', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    toast.success('Salesperson added')
    load()
  }

  const updateSalesperson = async (id: string, updates: any) => {
    await fetch('/api/admin/salespersons', {
      method: 'PATCH',
      body: JSON.stringify({ id, updates }),
    })
    toast.success('Salesperson updated')
    load()
  }

  const deleteSalesperson = async (id: string) => {
    await fetch('/api/admin/salespersons', {
      method: 'DELETE',
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