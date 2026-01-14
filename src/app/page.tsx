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
    title: 'MITC – Laptop Sales & IT Services in Srinagar',
    description:
      'Buy, upgrade, and repair laptops with confidence at MITC Srinagar. Serving Kashmir since 2013.',
    images: [
      {
        url: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
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