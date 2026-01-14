import { Metadata } from 'next'
import AboutClient from './AboutClient'
import LocalBusinessSchema from './LocalBusinessSchema'

export const metadata: Metadata = {
  title: 'About MITC | Trusted Laptop Showroom in Srinagar, Kashmir',
  description:
    'Learn about MITC (Mateen IT Corp), a trusted laptop showroom in Srinagar, Kashmir since 2013. Transparent laptop sales, diagnostics, upgrades, and expert guidance.',

  alternates: {
    canonical: 'https://mitck.netlify.app/about',
  },

  openGraph: {
    title: 'About MITC – Mateen IT Corp',
    description:
      'A trusted laptop showroom in Srinagar offering honest guidance, diagnostics, and upgrades since 2013.',
    url: 'https://mitck.netlify.app/about',
    siteName: 'MITC – Mateen IT Corp',
    type: 'website',

    // ✅ REQUIRED FOR FACEBOOK / WHATSAPP
    images: [
      {
        url: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
        width: 1200,
        height: 630,
        alt: 'MITC Laptop Showroom in Srinagar',
      },
    ],
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Structured data for Google */}
      <LocalBusinessSchema />

      {/* Client-rendered UI */}
      <AboutClient />
    </>
  )
}