import type { Metadata } from 'next';
import { Provider } from './provider';
import Header from '@/components/Header';
import { FloatingButtons } from '@/components/FloatingButtons';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'MITC - Mateen IT Corp | Laptop Sales & Services',
  description: "Kashmir's premier destination for laptop sales, repairs, and technical services since 2013.",
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mitc-store.com',
    siteName: 'MITC - Mateen IT Corp',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1F2937" />
      </head>
      <body>
        <Provider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <FloatingButtons />
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
