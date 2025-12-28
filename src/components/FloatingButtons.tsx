'use client';

import { useSettings } from '@/hooks/useSettings';
import Link from 'next/link';

export function FloatingButtons() {
  const { settings } = useSettings();

  if (!settings?.phone) return null;

  const whatsappUrl = settings?.whatsappLink || `https://wa.me/${settings?.phone.replace(/\D/g, '')}`;
  const callUrl = `tel:${settings?.phone}`;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* WhatsApp Button */}
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all"
        title="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.754c0 2.718.738 5.33 2.14 7.617l-2.267 6.605c-.186.54.13 1.126.67 1.314l.047.015c.504.157 1.03-.044 1.21-.535l2.34-6.83c2.159 1.23 4.616 1.856 7.203 1.856h.006c5.396 0 9.747-4.363 9.746-9.76a9.865 9.865 0 00-9.746-9.754" />
        </svg>
      </Link>

      {/* Call Button */}
      <Link
        href={callUrl}
        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all"
        title="Call us"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.707 12.293a.999.999 0 00-1.414 0L13 16.586V9.5c0-.827-.673-1.5-1.5-1.5S10 8.673 10 9.5v7.086l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0l5-5c.391-.391.391-1.023 0-1.414zM6 3h12v2H6z" />
        </svg>
      </Link>
    </div>
  );
}
