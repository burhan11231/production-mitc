import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'MITC – Laptop Sales & IT Services in Srinagar | Mateen IT Corp',
  description:
    "Commercial-grade laptops, transparent diagnostics, and professional IT services in Srinagar, Kashmir.",

  alternates: {
    canonical: 'https://mitck.netlify.app/',
  },

  openGraph: {
    title: 'MITC Srinagar – Expert Laptop Sales & Diagnostics',
    description:
      'Expert guidance and in-store diagnostics, handled personally by our team. Trusted laptop showroom in Srinagar.',
    url: 'https://mitck.netlify.app/', // ✅ THIS FIXES og:url WARNING
    siteName: 'MITC – Mateen IT Corp',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dlesei0kn/image/upload/httpsmitc-business-platform.netlify.app_20260129_183716_0000_qewjln.png',
        width: 1200,
        height: 630,
        alt: 'MITC Srinagar Laptop Showroom',
      },
    ],
  },
};

export default function Home() {
  return <HomeClient />;
}