import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'MITC – Trusted Laptop Showroom & IT Services in Srinagar | Mateen IT Corp',
  description:
    "Kashmir's Tech Authority Since 2013. Professional laptop sales, repairs, and IT services in Srinagar. Commercial-grade hardware with transparent diagnostics at our Gaw Kadal showroom.",
  openGraph: {
    title: 'MITC – Trusted Laptop Showroom & IT Services in Srinagar | Mateen IT Corp',
    description:
      "Kashmir's Tech Authority Since 2013. Professional laptop sales, repairs, and IT services in Srinagar. Commercial-grade hardware with transparent diagnostics.",
    type: 'website',
    locale: 'en_IN',
    siteName: 'MITC Srinagar',
    images: [
      {
        url: 'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
        width: 1200,
        height: 630,
        alt: 'MITC Srinagar laptop showroom - Gaw Kadal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MITC – Trusted Laptop Showroom & IT Services in Srinagar',
    description:
      "Kashmir's Tech Authority Since 2013. Laptop repairs, upgrades & sales in Srinagar.",
    images: [
      'https://res.cloudinary.com/dlesei0kn/image/upload/IMG-20251103-WA0003_bgmgkj.jpg',
    ],
  },
  alternates: {
    canonical: 'https://mitck.netlify.app/',
  },
  robots: 'index, follow',
};

export default function Home() {
  return <HomeClient />;
}