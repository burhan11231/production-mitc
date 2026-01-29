// app/page.tsx
import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const OG_IMAGE =
  'https://res.cloudinary.com/dlesei0kn/image/upload/mitc-home-og-image_xeqsjx.jpg'

export const metadata: Metadata = {
  title: 'MITC – Laptop Sales & IT Services in Srinagar',
  description:
    'Expert guidance and in-store diagnostics, handled personally. Explore our services and contact the MITC team directly through our website.',

  alternates: {
    canonical: 'https://mitc-business-platform.netlify.app/',
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'MITC – Mateen IT Corp',

    title: 'MITC – Laptop Sales & IT Services in Srinagar',
    description:
      'Expert guidance and in-store diagnostics, handled personally. Explore our services and contact the MITC team directly through our website.',

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'MITC – Laptop Sales & IT Services in Srinagar',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MITC – Laptop Sales & IT Services in Srinagar',
    description:
      'Expert guidance and in-store diagnostics, handled personally. Explore our services and contact the MITC team directly through our website.',
    images: [OG_IMAGE],
  },
}

export default function Home() {
  return <HomeClient />
}