import { Metadata } from 'next'
import AboutClient from './AboutClient'
import LocalBusinessSchema from './LocalBusinessSchema'

export const metadata: Metadata = {
  title: 'About MITC | Trusted Laptop Showroom in Srinagar, Kashmir',
  description:
    'Learn about MITC (Mateen IT Corp), a trusted laptop showroom in Srinagar, Kashmir since 2013. Transparent laptop sales, diagnostics, upgrades, and expert guidance.',
  alternates: {
    canonical: 'https://mitc-store.com/about',
  },
  openGraph: {
    title: 'About MITC – Mateen IT Corp',
    description:
      'A trusted laptop showroom in Srinagar offering honest guidance, diagnostics, and upgrades since 2013.',
    url: 'https://mitck.netlify.app/about',
    siteName: 'MITC',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <>
      {/* LocalBusiness Schema (server-safe) */}
      <LocalBusinessSchema />

      {/* Client UI */}
      <AboutClient />
    </>
  )
}