'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  MessageCircle, 
  Copy, 
  Check, 
  X, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  AlertCircle 
} from 'lucide-react'
import { Salesperson } from '@/lib/firestore-models'
import { cn } from '@/lib/utils' // Assuming a standard tailwind-merge utility

type Props = {
  isOpen: boolean
  salesperson: Salesperson | null
  onClose: () => void
}

/* ---------------- Utils ---------------- */

const toDigits = (phone?: string) => (phone || '').replace(/\D/g, '')

const toWaLink = (phone?: string) => {
  const digits = toDigits(phone)
  return digits ? `https://wa.me/${digits}` : ''
}

const initials = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')

/* ---------------- Sub-Components ---------------- */

const ActionButton = ({ 
  href, 
  icon: Icon, 
  label, 
  variant = 'primary', 
  onClick 
}: { 
  href?: string, 
  icon: any, 
  label: string, 
  variant?: 'primary' | 'success' | 'outline',
  onClick?: () => void 
}) => {
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
  }

  const content = (
    <>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </>
  )

  const className = cn(
    "flex items-center justify-center px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-95 text-sm",
    styles[variant]
  )

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  return <button onClick={onClick} className={className}>{content}</button>
}

/* ---------------- Main Component ---------------- */

export default function SalespersonModal({ isOpen, salesperson, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!salesperson) return null

  const tel = toDigits(salesperson.phone)
  const wa = toWaLink(salesperson.whatsapp || salesperson.phone)

  const handleCopy = () => {
    if (salesperson.phone) {
      navigator.clipboard.writeText(salesperson.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[100]">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all">
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-20 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative">
                  {/* Visual Header Background */}
                  <div className="h-32 bg-gradient-to-r from-slate-100 to-blue-50" />

                  <div className="px-8 pb-10">
                    {/* Profile Section */}
                    <div className="relative -mt-12 mb-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                      <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white bg-white shadow-xl">
                        {salesperson.imageUrl ? (
                          <Image
                            src={salesperson.imageUrl}
                            alt={salesperson.name || ''}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-400">
                            {initials(salesperson.name)}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex-1 text-center sm:text-left sm:pb-2">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {salesperson.name}
                          </h2>
                          {salesperson.isActive !== false && (
                            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Online
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-medium text-blue-600">
                          {salesperson.role || 'Property Consultant'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      {/* Bio Content */}
                      <div className="lg:col-span-3 space-y-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">About Expert</h4>
                          <p className="text-slate-600 leading-relaxed">
                            {salesperson.bio || `Specializing in premium property consulting and client relations. Reach out for a personalized consultation regarding your next investment.`}
                          </p>
                        </div>
                        
                        {/* Status Badge for Inactive */}
                        {salesperson.isActive === false && (
                          <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800 leading-snug">
                              <span className="font-bold">Currently away.</span> This team member is not accepting new inquiries at the moment.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions Sidebar */}
                      <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Quick Connect</h4>
                        
                        <div className="flex flex-col gap-3">
                          {tel && (
                            <ActionButton 
                              href={`tel:${tel}`} 
                              icon={Phone} 
                              label="Voice Call" 
                              variant="primary" 
                            />
                          )}

                          {wa && (
                            <ActionButton 
                              href={wa} 
                              icon={MessageCircle} 
                              label="WhatsApp" 
                              variant="success" 
                            />
                          )}

                          <ActionButton 
                            onClick={handleCopy} 
                            icon={copied ? Check : Copy} 
                            label={copied ? "Copied!" : "Copy Number"} 
                            variant="outline" 
                          />
                        </div>

                        <p className="text-[10px] text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Professional Member
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
