// app/page.tsx
import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const OG_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/httpsmitc-business-platform.netlify.app_20260129_183716_0000_qewjln.png'

export const metadata: Metadata = {
  title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',
  description:
    'Expert guidance and in-store diagnostics, handled personally by our team. Trusted laptop showroom in Srinagar.',

  alternates: {
    canonical: 'https://mitc-business-platform.netlify.app/',
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'MITC – Mateen IT Corp',

    title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',
    description:
      'Expert guidance and in-store diagnostics, handled personally by our team. Trusted laptop showroom in Srinagar.',

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'MITC Srinagar Laptop Showroom',
      },
    ],
  },
}

export default function Home() {
  return <HomeClient />
}