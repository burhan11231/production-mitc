// src/app/page.tsx
import { Metadata } from 'next';
import HomeClient from './HomeClient'; // Adjust path if you put it in src/components

export const metadata: Metadata = {
  title: 'MITC | Mateen IT Corp – Premium Laptop & IT Solutions Srinagar',
  description:
    "Kashmir's Tech Authority Since 2013. Professional laptop sales, repairs, and technical services in Srinagar.",
};

export default function Home() {
  return <HomeClient />;
}
