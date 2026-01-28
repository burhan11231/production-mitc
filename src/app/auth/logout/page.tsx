'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await logout()
      router.replace('/')
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Logging you out…</p>
    </div>
  )
}