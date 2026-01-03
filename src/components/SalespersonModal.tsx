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
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <DialogPanel className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-gray-600 hover:bg-gray-100"
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

              {/* ================= TOP SECTION ================= */}
              <div className="grid grid-cols-[220px_1fr] gap-6 px-6 pt-8 sm:px-8 lg:px-10 lg:pt-10">
                {/* LEFT: PROFILE */}
                <div className="flex flex-col items-center text-center">
                  {salesperson.imageUrl && (
                    <div className="mb-4 h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
                      <Image
                        src={salesperson.imageUrl}
                        alt={salesperson.name}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {salesperson.name}
                  </h2>

                  {salesperson.role && (
                    <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wide text-blue-600">
                      {salesperson.role}
                    </p>
                  )}
                </div>

                {/* RIGHT: CONTACT */}
                <div className="space-y-3">
                  {/* Email */}
                  <a
                    href={`mailto:${salesperson.email}`}
                    className="flex items-center gap-4 rounded-xl bg-gray-50 p-3 sm:p-4 hover:bg-gray-100 transition"
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
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {salesperson.email}
                      </p>
                    </div>
                  </a>

                  {/* Phone */}
                  <a
                    href={`tel:${salesperson.phone}`}
                    className="flex items-center gap-4 rounded-xl bg-blue-50 p-3 sm:p-4 hover:bg-blue-100 transition"
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
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
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
                    className="flex items-center gap-4 rounded-xl bg-green-50 p-3 sm:p-4 hover:bg-green-100 transition"
                  >
                    <svg
                      className="h-5 w-5 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.04 0C5.397 0 .01 5.387.01 12.03c0 2.122.555 4.195 1.607 6.02L0 24l6.116-1.604a12.02 12.02 0 005.924 1.513h.005c6.642 0 12.03-5.387 12.03-12.03C24.075 5.387 18.682 0 12.04 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        WhatsApp
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Chat Now
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* ================= BIO SECTION ================= */}
              {salesperson.bio && (
                <div className="mt-8 border-t border-gray-100 bg-gray-50 px-6 py-6 sm:px-8 lg:px-10">
                  <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                    {salesperson.bio}
                  </p>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}