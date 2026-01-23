'use client'

import { Fragment, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react'

import { Salesperson } from '@/lib/firestore-models'
import { useAuth } from '@/lib/auth-context'
import { toggleSalespersonReaction } from '@/app/actions/toggleSalespersonReaction'
import { reactionCache } from '@/hooks/useSalespersons';

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
  return digits ? `https://wa.me/${digits}` : ''    
}    
    
function initials(name?: string) {    
  return (name || '')    
    .trim()    
    .split(/\s+/)    
    .slice(0, 2)    
    .map(w => w[0]?.toUpperCase())    
    .join('')    
}    
    
/* ---------------- Component ---------------- */    
    
export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {    
  const { user } = useAuth()    
    
  /* ✅ MISSING STATES (FIX) */    
  const [likesCount, setLikesCount] = useState(0)    
  const [dislikesCount, setDislikesCount] = useState(0)    
    
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null)    
  const [isProcessing, setIsProcessing] = useState(false)    
  const [authError, setAuthError] =    
    useState<{ type: 'like' | 'dislike'; msg: string } | null>(null)    
    
  /* ✅ INIT COUNTS + USER REACTION (FINAL FIX) */
useEffect(() => {
  if (!isOpen || !salesperson) return;

  setLikesCount(salesperson.likesCount ?? 0);
  setDislikesCount(salesperson.dislikesCount ?? 0);

  const cached = reactionCache.get(salesperson.id!);

  setUserReaction(
    cached !== undefined
      ? cached
      : salesperson.userReaction ?? null
  );
}, [isOpen, salesperson]);   
 
    
  /* ---- Sync logged-in user's reaction ---- */    
      
    
  if (!salesperson) return null    
    
  const tel = toDigits(salesperson.phone)    
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone)    
    
  /* ---------------- Reaction Handler ---------------- */    
    
  const handleReaction = (type: 'like' | 'dislike') => {
  if (!user) {
    setAuthError({ type, msg: `Please login to ${type}` });
    return;
  }

  if (isProcessing) return;

  setIsProcessing(true);

  const prev = userReaction;
  const next = prev === type ? null : type;

  // ---- INSTANT UI UPDATE ----
  setUserReaction(next);
  reactionCache.set(salesperson!.id!, next);

  setLikesCount(c =>
    prev === 'like' ? c - 1 : next === 'like' ? c + 1 : c
  );

  setDislikesCount(c =>
    prev === 'dislike' ? c - 1 : next === 'dislike' ? c + 1 : c
  );

  // ---- SERVER CALL ----
  toggleSalespersonReaction(user.uid, salesperson!.id!, type)
    .catch(() => {
      // 🔁 ROLLBACK (rare)
      setUserReaction(prev);
      reactionCache.set(salesperson!.id!, prev);
      setLikesCount(salesperson!.likesCount ?? 0);
      setDislikesCount(salesperson!.dislikesCount ?? 0);
      toast.error('Failed to save reaction');
    })
    .finally(() => {
      setIsProcessing(false);
    });
};
    
  /* ====================== UI BELOW IS 100% YOUR ORIGINAL ====================== */    
    
  return (    
    <Transition show={isOpen} as={Fragment}>    
      <Dialog onClose={onClose} className="relative z-[80]">    
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300" />    
    
        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">    
          <DialogPanel className="relative w-full max-w-4xl mx-auto h-[85vh] flex flex-col transform rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-300">    
    
            {/* ============ HEADER ============ */}    
            <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 border-b px-6 py-5">    
              <div className="flex items-center justify-between">    
                <div className="flex items-center gap-4">    
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white shadow-md">    
                    {salesperson.imageUrl ? (    
                      <Image src={salesperson.imageUrl} alt={salesperson.name} fill className="object-cover" unoptimized />    
                    ) : (    
                      <div className="flex h-full w-full items-center justify-center text-white font-bold text-xl">    
                        {initials(salesperson.name)}    
                      </div>    
                    )}    
                  </div>    
                  <div>    
                    <h2 className="text-2xl font-bold text-gray-900">{salesperson.name}</h2>    
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">{salesperson.role}</p>    
                  </div>    
                </div>    
                <button    
                  onClick={onClose}    
                  className="p-2 hover:bg-white rounded-full transition-all duration-200 hover:shadow-md"    
                >    
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">    
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />    
                  </svg>    
                </button>    
              </div>    
            </div>    
    
            {/* ============ SCROLLABLE BODY ============ */}    
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">    
    
              {/* ---- Contact Info Section ---- */}    
              <section>    
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contact Information</h3>    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">    
                  {/* Email */}    
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-all">    
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">    
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">    
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />    
                      </svg>    
                    </div>    
                    <div className="flex-1 min-w-0">    
                      <p className="text-xs text-gray-500 font-medium">Email</p>    
                      <a href={`mailto:${salesperson.email}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate">    
                        {salesperson.email}    
                      </a>    
                    </div>    
                  </div>    
    
                  {/* Phone */}    
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-all">    
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">    
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">    
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />    
                      </svg>    
                    </div>    
                    <div className="flex-1 min-w-0">    
                      <p className="text-xs text-gray-500 font-medium">Phone</p>    
                      <a href={`tel:${tel}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600">    
                        {salesperson.phone}    
                      </a>    
                    </div>    
                  </div>    
                </div>    
              </section>    
    
              {/* ---- Specializations Section ---- */}    
              {salesperson.specializations && salesperson.specializations.length > 0 && (    
                <section>    
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Areas of Expertise</h3>    
                  <div className="flex flex-wrap gap-2">    
                    {salesperson.specializations.map(spec => (    
                      <span    
                        key={spec}    
                        className="px-3.5 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 hover:border-blue-300 transition-all"    
                      >    
                        ✓ {spec}    
                      </span>    
                    ))}    
                  </div>    
                </section>    
              )}    
    
              {/* ---- Bio Section ---- */}    
              {salesperson.bio && (    
                <section>    
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Professional Bio</h3>    
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">    
                    <p className="text-gray-700 leading-relaxed italic text-base">    
                      {salesperson.bio}    
                    </p>    
                  </div>    
                </section>    
              )}    
    
              {/* ---- Status Section ---- */}    
              {salesperson.isActive === false && (    
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-3">    
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>    
                  <span>Currently away from desk</span>    
                </div>    
              )}    
            </div>    
    
            {/* ============ FOOTER ============ */}    
            <div className="flex-shrink-0 bg-gray-50 border-t px-6 py-5">    
    
              {/* Auth Prompt */}    
              {authError && (    
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-center">    
                  <p className="text-sm text-red-700 font-medium">    
                    {authError.msg}.{' '}    
                    <Link href="/login" className="underline font-bold hover:text-red-800">    
                      Login    
                    </Link>    
                  </p>    
                </div>    
              )}    
    
              <div className="flex items-center justify-between flex-wrap gap-4">    
                {/* Contact Buttons */}    
                <div className="flex items-center gap-3">    
                  {/* Call Button */}    
                  <button    
                    onClick={() => tel && (window.location.href = `tel:${tel}`)}    
                    disabled={!tel}    
                    className={`h-12 w-12 flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${    
                      tel    
                        ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95'    
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'    
                    }`}    
                    title="Call"    
                  >    
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">    
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />    
                    </svg>    
                  </button>    
    
                  {/* WhatsApp Button */}    
                  <button    
                    onClick={() => wa && window.open(wa, '_blank')}    
                    disabled={!wa}    
                    className={`h-12 w-12 flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${    
                      wa    
                        ? 'bg-emerald-500 text-white shadow-lg hover:shadow-xl hover:bg-emerald-600 active:scale-95'    
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'    
                    }`}    
                    title="WhatsApp"    
                  >    
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">    
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />    
                    </svg>    
                  </button>    
    
                  {/* Email Button */}    
                  <button    
                    onClick={() => window.open(`mailto:${salesperson.email}`, '_blank')}    
                    className="h-12 w-12 flex items-center justify-center rounded-xl font-semibold transition-all duration-200 bg-purple-600 text-white shadow-lg hover:shadow-xl hover:bg-purple-700 active:scale-95"    
                    title="Email"    
                  >    
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">    
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />    
                    </svg>    
                  </button>    
                </div>    
    
                {/* Reaction Buttons */}    
                <div className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-1.5">    
                  <button    
                    onClick={() => handleReaction('like')}    
                    disabled={isProcessing}    
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${    
                      userReaction === 'like'    
                        ? 'bg-blue-600 border border-blue-600 text-white shadow-md'    
                        : 'bg-white border border-transparent text-gray-600 hover:bg-gray-50'    
                    }`}    
                  >    
                    <svg className="h-5 w-5" fill={userReaction === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">    
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708c.94 0 1.667.83 1.547 1.755l-1.304 10A1.75 1.75 0 0 1 17.204 23H7V10l7-7V10Z" />    
                    </svg>    
                    <span>{likesCount}</span>    
                  </button>    
    
                  <div className="h-6 w-px bg-gray-300"></div>    
    
                  <button    
                    onClick={() => handleReaction('dislike')}    
                    disabled={isProcessing}    
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${    
                      userReaction === 'dislike'    
                        ? 'bg-red-600 border border-red-600 text-white shadow-md'    
                        : 'bg-white border border-transparent text-gray-600 hover:bg-gray-50'    
                    }`}    
                  >    
                    <svg className="h-5 w-5" fill={userReaction === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">    
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.292c-.94 0-1.667-.83-1.547-1.755l1.304-10A1.75 1.75 0 0 1 6.796 1h10.204v13l-7 7V14Z" />    
                    </svg>    
                    <span>{dislikesCount}</span>    
                  </button>    
                </div>    
              </div>    
            </div>    
          </DialogPanel>    
        </div>    
    
        <style jsx global>{`    
          .custom-scrollbar::-webkit-scrollbar {    
            width: 6px;    
          }    
          .custom-scrollbar::-webkit-scrollbar-track {    
            background: transparent;    
          }    
          .custom-scrollbar::-webkit-scrollbar-thumb {    
            background: #cbd5e1;    
            border-radius: 10px;    
          }    
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {    
            background: #94a3b8;    
          }    
        `}</style>    
      </Dialog>    
    </Transition>    
  )    
}  