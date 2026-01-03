'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from '@headlessui/react';
import { Salesperson } from '@/lib/firestore-models';

interface Props {
  isOpen: boolean;
  salesperson: Salesperson | null;
  onClose: () => void;
}

export default function SalespersonModal({
  isOpen,
  salesperson,
  onClose,
}: Props) {
  if (!salesperson) return null;

  const whatsappPhone = salesperson.whatsapp || salesperson.phone;
  const whatsappLink = whatsappPhone.includes('wa.me')
    ? whatsappPhone
    : `https://wa.me/${whatsappPhone.replace(/\D/g, '')}`;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 backdrop-blur-sm duration-300 data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <DialogPanel
              transition
              className="w-full max-w-lg transform rounded-3xl bg-white shadow-2xl duration-300 data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-gray-600 hover:bg-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header */}
              <div className="relative px-8 pt-10 text-center">
                {salesperson.imageUrl && (
                  <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
                    <Image
                      src={salesperson.imageUrl}
                      alt={salesperson.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-900">
                  {salesperson.name}
                </h2>

                {salesperson.role && (
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-blue-600">
                    {salesperson.role}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="px-8 pb-10 pt-6">
                {salesperson.bio && (
                  <p className="mb-8 text-center text-sm leading-relaxed text-gray-600">
                    {salesperson.bio}
                  </p>
                )}

                {/* Contact Links */}
                <div className="space-y-3">
                  {/* Email */}
                  <a
                    href={`mailto:${salesperson.email}`}
                    className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100"
                  >
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {salesperson.email}
                      </p>
                    </div>
                  </a>

                  {/* Phone */}
                  <a
                    href={`tel:${salesperson.phone}`}
                    className="flex items-center gap-4 rounded-xl bg-blue-50 p-4 transition hover:bg-blue-100"
                  >
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {salesperson.phone}
                      </p>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl bg-green-50 p-4 transition hover:bg-green-100"
                  >
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487Z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        WhatsApp
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Chat Now
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}