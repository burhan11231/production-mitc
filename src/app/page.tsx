// app/page.tsx
import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const OG_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/httpsmitc-business-platform.netlify.app_20260129_183716_0000_qewjln.png'

export const metadata: Metadata = {
  title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',

  description:
    'Expert guidance and in-store diagnostics, handled personally by our team. Trusted laptop showroom in Srinagar.',

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

  twitter: {
    card: 'summary_large_image',
    title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',
    description:
      'Expert guidance and in-store diagnostics, handled personally by our team.',
    images: [OG_IMAGE],
  },
}

export default function Home() {
  return <HomeClient />
}