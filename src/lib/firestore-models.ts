// src/lib/firestore-models.ts
// Cleaned & RTDB-aligned models

/* ----------------------------------
   SITE SETTINGS
---------------------------------- */

export interface WorkingDay {
  open: string
  close: string
  closed?: boolean
}

export interface WorkingHours {
  summer: Record<string, WorkingDay>
  winter: Record<string, WorkingDay>
  activeSeason?: 'summer' | 'winter'
}

export interface SiteSettings {
  /* -------- Branding -------- */
  businessName: string
  tagline: string
  logoUrl: string

  /* -------- Business -------- */
  primaryPhone: string
  primaryWhatsApp: string
  primaryEmail: string
  addressText: string
  mapEmbedUrl: string

  /* -------- Social Links -------- */
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  youtube: string

  /* -------- Hours -------- */
  workingHours: WorkingHours

  /* -------- Founder -------- */
  founderName: string
  founderImageUrl: string
  founderEmail: string
  founderBio: string
}

/* ----------------------------------
   DEFAULT SETTINGS
   (SAFE RUNTIME FALLBACK ONLY)
---------------------------------- */

export const DEFAULT_SETTINGS: SiteSettings = {
  /* Branding */
  businessName: '',
  tagline: '',
  logoUrl: '',

  /* Business */
  primaryPhone: '',
  primaryWhatsApp: '',
  primaryEmail: '',
  addressText: '',
  mapEmbedUrl: '',

  /* Socials */
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  youtube: '',

  /* Hours */
  workingHours: {
    summer: {
      Monday: { open: '09:00', close: '18:00' },
      Tuesday: { open: '09:00', close: '18:00' },
      Wednesday: { open: '09:00', close: '18:00' },
      Thursday: { open: '09:00', close: '18:00' },
      Friday: { open: '09:00', close: '18:00' },
      Saturday: { open: '10:00', close: '16:00' },
      Sunday: { open: '10:00', close: '16:00', closed: true },
    },
    winter: {
      Monday: { open: '09:00', close: '17:00' },
      Tuesday: { open: '09:00', close: '17:00' },
      Wednesday: { open: '09:00', close: '17:00' },
      Thursday: { open: '09:00', close: '17:00' },
      Friday: { open: '09:00', close: '17:00' },
      Saturday: { open: '10:00', close: '15:00' },
      Sunday: { open: '10:00', close: '15:00', closed: true },
    },
    activeSeason: 'summer',
  },

  /* Founder */
  founderName: '',
  founderImageUrl: '',
  founderEmail: '',
  founderBio: '',
}

/* ----------------------------------
   SALESPERSON MODELS
---------------------------------- */

export interface Salesperson {
  id?: string
  name: string
  role: 'Sales' | 'Support' | 'Manager' | 'Technician'
  imageUrl: string
  email: string
  phone: string
  whatsapp?: string
  bio: string
  isActive: boolean
  order: number
  specializations: string[]

}
