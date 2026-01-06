'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  const currentSeason =
    new Date().getMonth() >= 3 && new Date().getMonth() <= 9 ? 'summer' : 'winter';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone) {
      toast.error('Phone number is required');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        userId: user?.uid || null,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Message sent successfully');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f5f7fb] via-white to-[#f3f4f6]">
      {/* HERO */}
      <section className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 pb-10 sm:pb-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-blue-600 mb-3">
              Get in touch
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-3">
              Let&apos;s talk
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl">
              Visit our showroom, call us, or drop a quick message. The team responds fast during working hours.
            </p>
          </div>

          {settings?.primaryPhone && (
            <div className="flex flex-col items-start lg:items-end gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Call directly
              </span>
              <a
                href={`tel:${settings.primaryPhone}`}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-black transition-colors"
              >
                <span>📞</span>
                <span>{settings.primaryPhone}</span>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: INFO + MAP */}
          <aside className="lg:col-span-5 space-y-6 lg:space-y-8">
            <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-sm">
              {/* ADDRESS */}
              {settings?.addressText && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>Showroom</span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {settings.addressText}
                  </p>
                </div>
              )}

              {/* HOURS */}
              {settings?.workingHours?.[currentSeason] && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <span>
                      Business Hours ({currentSeason === 'summer' ? 'Summer' : 'Winter'})
                    </span>
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/60">
                    {Object.entries(settings.workingHours[currentSeason]).map(
                      ([day, h]: any) => (
                        <div
                          key={day}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm"
                        >
                          <span className="capitalize text-gray-600">{day}</span>
                          {h.closed ? (
                            <span className="font-semibold text-red-500">Closed</span>
                          ) : (
                            <span className="font-medium text-gray-900">
                              {h.open} – {h.close}
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* QUICK CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {settings?.primaryEmail && (
                  <a href={`mailto:${settings.primaryEmail}`} className="contact-tile">
                    <span className="label">Email</span>
                    <span className="value break-all">{settings.primaryEmail}</span>
                  </a>
                )}
                {settings?.primaryPhone && (
                  <a href={`tel:${settings.primaryPhone}`} className="contact-tile">
                    <span className="label">Phone</span>
                    <span className="value truncate">{settings.primaryPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* MAP CARD – USE FULL EMBED IFRAME */}
            {settings?.mapEmbedUrl && (
              <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Find us
                    </p>
                    <p className="text-sm font-semibold text-gray-900">Google Maps</p>
                  </div>
                </div>
                <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden bg-gray-100">
                  <div
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
                  />
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT: FORM */}
          <main className="lg:col-span-7">
            <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                  Send us a message
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                  Share what you need help with. The team usually responds within a few working hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="field-label">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 ..."
                    className="input"
                  />
                </div>

                <div>
                  <label className="field-label">
                    How can we help? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us briefly about your requirement, issue, or question."
                    className="input resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <button
                    disabled={isLoading}
                    className="submit-btn w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send message</span>
                        <span>↗</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">
                    By submitting, you agree to be contacted on the details you provide.
                  </p>
                </div>
              </form>
            </div>
          </main>
        </div>
      </section>

      {/* STYLES */}
      <style jsx>{`
        .contact-tile {
          padding: 14px;
          background: #f9fafb;
          border-radius: 16px;
          display: grid;
          gap: 2px;
          border: 1px solid #e5e7eb;
          transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease,
            transform 0.1s ease;
        }
        .contact-tile:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
          transform: translateY(-1px);
        }
        .label {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .value {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .input {
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          outline: none;
          font-size: 14px;
          color: #111827;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease,
            transform 0.1s ease;
        }
        .input::placeholder {
          color: #9ca3af;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.6), 0 8px 20px rgba(15, 23, 42, 0.08);
          background: #ffffff;
          transform: translateY(-0.5px);
        }
        .submit-btn {
          padding: 13px 26px;
          background: #111827;
          color: #ffffff;
          border-radius: 999px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.02em;
          border: 1px solid #111827;
          transition: background 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease,
            border-color 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #000000;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.25);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        @media (max-width: 640px) {
          .contact-tile {
            border-radius: 14px;
          }
          .input {
            padding: 12px 13px;
          }
        }
      `}</style>
    </div>
  );
}