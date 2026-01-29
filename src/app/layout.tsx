// app/layout.tsx
import type { Metadata } from 'next'
import { Provider } from './provider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'MITC – Trusted Laptop Showroom & IT Services in Srinagar | Mateen IT Corp',
  description:
    "Kashmir's Tech Authority Since 2013. Professional laptop sales, repairs, and IT services in Srinagar.",

  alternates: {
    canonical: 'https://mitc-business-platform.netlify.app/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',
    description:
      'Expert guidance and in-store diagnostics, handled personally by our team. Trusted laptop showroom in Srinagar.',
    images: [
      'https://res.cloudinary.com/dlesei0kn/image/upload/httpsmitc-business-platform.netlify.app_20260129_183716_0000_qewjln.png',
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111827" />
      </head>

      <body className="bg-white text-gray-900 antialiased">
        <Provider>
          <Header />

          <main className="min-h-screen">{children}</main>

          <Footer />
        </Provider>
      </body>
    </html>
  )
}