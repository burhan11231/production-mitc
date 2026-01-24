'use client'

import { useAuth } from '@/lib/auth-context'
import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, linkWithPopup } from 'firebase/auth'
import toast from 'react-hot-toast'

export default function AccountSettings() {
  const { user } = useAuth()

  const hasGoogle = user?.providers.includes('google.com')

  const connectGoogle = async () => {
    try {
      await linkWithPopup(auth.currentUser!, new GoogleAuthProvider())
      toast.success('Google connected')
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect Google')
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
      <h3 className="text-xl font-bold mb-6">Account Settings</h3>

      {hasGoogle ? (
        <div className="p-4 bg-emerald-50 border rounded-xl">
          Google account connected
        </div>
      ) : (
        <button
          onClick={connectGoogle}
          className="w-full bg-white border rounded-xl py-3 font-semibold"
        >
          Connect Google
        </button>
      )}
    </div>
  )
}