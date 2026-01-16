// src/lib/firestore-models.ts
// Updated data models with like/dislike counts

export interface SiteSettings {
  // Business Branding
  businessName: string
  tagline: string
  logoUrl: string
  featuredImageUrl: string
  primaryPhone: string
  primaryWhatsApp: string
  primaryEmail: string
  addressText: string
  mapEmbedUrl: string

  // SEO & Meta
  siteTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImageUrl: string
  twitterCardType: string
  canonicalUrl: string

  // Social Links
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  youtube: string

  // Working Hours
  workingHours: {
  summer: Record<string, { open: string; close: string; closed?: boolean }>
  winter: Record<string, { open: string; close: string; closed?: boolean }>
  activeSeason?: 'summer' | 'winter'
}

  // Founder Details
  founderName: string
  founderImageUrl: string
  founderEmail: string
  founderBio: string

  // Metadata
  createdAt?: any
  updatedAt?: any
}

export interface Salesperson {
  id?: string
  name: string
  role: 'Sales' | 'Support' | 'Manager'
  imageUrl: string
  email: string
  phone: string
  specializations?: string[]
  likesCount?: number
  dislikesCount?: number
  whatsapp?: string
  bio: string
  isActive: boolean
  order: number

  // Metadata
  createdAt?: any
  updatedAt?: any
}

/**
 * Salesperson Reaction - Stores user likes/dislikes
 * Document ID: ${userId}_${salespersonId}
 */
export interface SalespersonReaction {
  userId: string
  salespersonId: string
  type: 'like' | 'dislike'
  createdAt?: any
  updatedAt?: any
}

// Default site settings
export const DEFAULT_SETTINGS: SiteSettings = {
  // Business Branding
  businessName: 'MITC',
  tagline: 'Mateen IT Corp',
  logoUrl: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
  featuredImageUrl: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
  primaryPhone: '+91 98765 43210',
  primaryWhatsApp: 'https://wa.me/919876543210',
  primaryEmail: 'info@mitc.com',
  addressText: 'Gaw Kadal, Maisuma, Srinagar, J&K - 190001',
  mapEmbedUrl: 'https://maps.app.goo.gl/bH7r6o1jJvU5TLzL7',

  // SEO & Meta
  siteTitle: 'MITC - Mateen IT Corp | Laptop Sales & Services',
  metaDescription: "Kashmir's premier destination for laptop sales, repairs, and technical services since 2013.",
  ogTitle: 'MITC - Mateen IT Corp',
  ogDescription: "Kashmir's premier destination for laptop sales, repairs, and technical services.",
  ogImageUrl: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
  twitterCardType: 'summary_large_image',
  canonicalUrl: 'https://mitck.netlify.app',

  // Social Links
  instagram: 'https://instagram.com',
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  youtube: 'https://youtube.com',

  // Working Hours
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
  },

  // Founder Details
  founderName: 'Mateen Ahmed',
  founderImageUrl: '',
  founderEmail: 'founder@mitc.com',
  founderBio: 'Founder & CEO, MITC - Building Kashmir IT infrastructure since 2013',

  // Metadata
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Default salespersons
export const DEFAULT_SALESPERSONS: Salesperson[] = [
  {
    name: 'Salesperson 1',
    role: 'Sales',
    imageUrl: '',
    email: 'sales1@mitc.com',
    phone: '+91 98765 43210',
    whatsapp: 'https://wa.me/919876543210',
    bio: 'Senior Sales Executive',
    isActive: true,
    order: 1,
    specializations: [],
    likesCount: 0,
    dislikesCount: 0,
  },
]
