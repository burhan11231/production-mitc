'use client'

import { Fragment, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react'
import { Salesperson } from '@/lib/firestore-models'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { 
  doc, 
  onSnapshot, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore'
import toast from 'react-hot-toast'

type Props = {
  isOpen: boolean
  salesperson: Salesperson | null
  onClose: () => void
}

/* ---------------- Utils ---------------- */
function toDigits(phone?: string) {
  return (phone || '').replace(/\D/g, '')
}

function toWaLink(phone?: string) {
  const digits = toDigits(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

function initials(name?: string) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {
  const { user } = useAuth()
  
  // Real-time states
  const [likesCount, setLikesCount] = useState(0)
  const [dislikesCount, setDislikesCount] = useState(0)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null)
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false)
  const [authError, setAuthError] = useState<{type: 'like' | 'dislike', msg: string} | null>(null)

  // 1. Sync counts from Salesperson doc
  useEffect(() => {
    if (!salesperson?.id || !isOpen) return
    const unsub = onSnapshot(doc(db, 'salespersons', salesperson.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setLikesCount(data.likesCount || 0)
        setDislikesCount(data.dislikesCount || 0)
      }
    })
    return () => unsub()
  }, [salesperson?.id, isOpen])

  // 2. Sync logged-in user's specific reaction
  useEffect(() => {
    if (!salesperson?.id || !user?.uid || !isOpen) {
      setUserReaction(null)
      return
    }
    const reactionDocId = `${user.uid}_${salesperson.id}`
    const unsub = onSnapshot(doc(db, 'salesperson_reactions', reactionDocId), (doc) => {
      if (doc.exists()) setUserReaction(doc.data().type)
      else setUserReaction(null)
    })
    return () => unsub()
  }, [salesperson?.id, user?.uid, isOpen])

  if (!salesperson) return null

  const tel = toDigits(salesperson.phone)
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone)

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      setAuthError({ type, msg: `Please login to ${type}` })
      return
    }
    if (isProcessing) return
    
    setIsProcessing(true)
    setAuthError(null)

    const reactionDocId = `${user.uid}_${salesperson.id}`
    const reactionRef = doc(db, 'salesperson_reactions', reactionDocId)
    const salespersonRef = doc(db, 'salespersons', salesperson.id!)

    try {
      await runTransaction(db, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef)
        const spDoc = await transaction.get(salespersonRef)

        if (!spDoc.exists()) throw "Salesperson not found"

        const data = spDoc.data()
        let nL = data.likesCount || 0
        let nD = data.dislikesCount || 0

        if (!reactionDoc.exists()) {
          // New Reaction
          transaction.set(reactionRef, {
            userId: user.uid,
            salespersonId: salesperson.id,
            type,
            createdAt: serverTimestamp()
          })
          type === 'like' ? nL++ : nD++
        } else {
          const prevType = reactionDoc.data().type
          if (prevType === type) {
            // Toggle off
            transaction.delete(reactionRef)
            type === 'like' ? nL-- : nD--
          } else {
            // Switch type
            transaction.update(reactionRef, { type, updatedAt: serverTimestamp() })
            if (type === 'like') { nL++; nD--; } 
            else { nL--; nD++; }
          }
        }

        transaction.update(salespersonRef, {
          likesCount: Math.max(0, nL),
          dislikesCount: Math.max(0, nD)
        })
      })
    } catch (e) {
      console.error(e)
      toast.error("Failed to save reaction")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300" />

        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-4xl mx-auto h-[85vh] flex flex-col transform rounded-3xl bg-white shadow-2xl overflow-hidden transition-all">
            
            {/* HEADER */}
            <div className="flex-shrink-0 bg-white border-b px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-100">
                    {salesperson.imageUrl ? (
                      <Image src={salesperson.imageUrl} alt={salesperson.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white font-bold">
                        {initials(salesperson.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{salesperson.name}</h2>
                    <p className="text-sm font-medium text-blue-600">{salesperson.role}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY (Contact Cards Removed) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* SPECIALIZATIONS */}
              {salesperson.specializations && salesperson.specializations.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {salesperson.specializations.map(spec => (
                      <span key={spec} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* BIO */}
              {salesperson.bio && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Professional Bio</h3>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-gray-700 leading-relaxed italic">"{salesperson.bio}"</p>
                  </div>
                </section>
              )}

              {/* STATUS */}
              {salesperson.isActive === false && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Currently away from desk
                </div>
              )}
            </div>

            {/* FOOTER - All actions here */}
            <div className="flex-shrink-0 bg-gray-50 border-t px-6 py-4">
              
              {/* Auth Prompt */}
              {authError && (
                <div className="mb-4 text-center p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs text-red-600 font-medium">
                    {authError.msg}. <Link href="/login" className="underline font-bold hover:text-red-800">Please Login</Link>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Contact Icons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => tel && (window.location.href = `tel:${tel}`)}
                    disabled={!tel}
                    className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${tel ? 'bg-blue-600 text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => wa && window.open(wa, '_blank')}
                    disabled={!wa}
                    className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${wa ? 'bg-emerald-500 text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                  </button>
                </div>

                {/* Reaction Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReaction('like')}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${userReaction === 'like' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    <svg className="h-4 w-4" fill={userReaction === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708c.94 0 1.667.83 1.547 1.755l-1.304 10A1.75 1.75 0 0 1 17.204 23H7V10l7-7V10Z" />
                    </svg>
                    {likesCount}
                  </button>

                  <button
                    onClick={() => handleReaction('dislike')}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${userReaction === 'dislike' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}
                  >
                    <svg className="h-4 w-4" fill={userReaction === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.292c-.94 0-1.667-.83-1.547-1.755l1.304-10A1.75 1.75 0 0 1 6.796 1h10.204v13l-7 7V14Z" />
                    </svg>
                    {dislikesCount}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
      </Dialog>
    </Transition>
  )
}
