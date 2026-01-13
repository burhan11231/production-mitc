'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideFooterOnAuth =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password';

  return (
    <>
      <main className={!hideFooterOnAuth ? 'min-h-screen' : undefined}>
        {children}
      </main>

      {!hideFooterOnAuth && <Footer />}
    </>
  );
}