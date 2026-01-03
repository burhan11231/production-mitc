'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import { useSalespersons } from '@/hooks/useSalespersons';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { salespersons } = useSalespersons();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  const currentSeason =
    new Date().getMonth() >= 3 && new Date().getMonth() <= 9 ? 'summer' : 'winter';

  const topSalespersons = salespersons
    .filter(p => p.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);

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
  <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#faf9f7] via-white to-[#f5f3f0]">
    {/* HERO */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 pb-12 sm:pb-16 text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6">
        Contact Us
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
        Visit our showroom, speak with our team, or send us a message — we’re here to help.
      </p>
    </section>

    {/* CONTENT */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8 min-w-0">
          {/* BUSINESS INFO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-8 lg:sticky lg:top-8">
            {/* HOURS */}
            {settings?.workingHours?.[currentSeason] && (
              <div>
                <h3 className="font-bold text-lg mb-4">
                  Business Hours ({currentSeason === 'summer' ? 'Summer' : 'Winter'})
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(settings.workingHours[currentSeason]).map(([day, h]: any) => (
                    <div key={day} className="flex justify-between gap-4 border-b py-1">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-semibold whitespace-nowrap">
                        {h.open} – {h.close}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADDRESS */}
            {settings?.addressText && (
              <div>
                <h3 className="font-bold text-lg mb-3">Location</h3>
                <p className="text-gray-600 text-sm">{settings.addressText}</p>

                {settings.mapEmbedUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border">
                    <iframe
                      title="Map"
                      src={settings.mapEmbedUrl}
                      className="w-full h-52"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            )}

            {/* QUICK CONTACT */}
            <div>
              <h3 className="font-bold text-lg mb-3">Quick Contact</h3>
              <div className="space-y-3">
                {settings?.primaryPhone && (
                  <a href={`tel:${settings.primaryPhone}`} className="contact-tile">
                    <span className="label">Phone</span>
                    <span className="value truncate">{settings.primaryPhone}</span>
                  </a>
                )}
                {settings?.primaryEmail && (
                  <a href={`mailto:${settings.primaryEmail}`} className="contact-tile">
                    <span className="label">Email</span>
                    <span className="value truncate">{settings.primaryEmail}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* TEAM */}
          {topSalespersons.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm min-w-0">
              <h3 className="text-xl font-bold mb-6">Talk to our Team</h3>

              <div className="space-y-4">
                {topSalespersons.map(person => (
                  <div
                    key={person.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-gray-50 min-w-0"
                  >
                    {person.imageUrl && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={person.imageUrl}
                          alt={person.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{person.name}</p>
                      <p className="text-xs text-gray-500 truncate">{person.role}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {person.phone && (
                        <a href={`tel:${person.phone}`} className="action-btn blue">
                          Call
                        </a>
                      )}
                      {(person.whatsapp || person.phone) && (
                        <a
                          href={`https://wa.me/${(person.whatsapp || person.phone).replace(/D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn green"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/team" className="block mt-6 text-center font-semibold text-blue-600 hover:text-blue-700">
                View full team →
              </Link>
            </div>
          )}
        </aside>

        {/* FORM */}
        <main className="lg:col-span-8 min-w-0">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="input"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  type="email"
                  placeholder="Email"
                  className="input"
                />
              </div>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Phone number"
                className="input"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Your message"
                className="input resize-none"
              />

              <button disabled={isLoading} className="submit-btn w-full sm:w-auto">
                {isLoading ? 'Sending…' : 'Send Message'}
              </button>
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
        border-radius: 14px;
        display: grid;
        gap: 2px;
      }
      .label {
        font-size: 12px;
        color: #6b7280;
      }
      .value {
        font-weight: 600;
        color: #111827;
      }
      .input {
        width: 100%;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        background: white;
        outline: none;
      }
      .input:focus {
        border-color: #93c5fd;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
      }
      .action-btn {
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 10px;
        color: white;
        white-space: nowrap;
      }
      .action-btn.blue {
        background: #2563eb;
      }
      .action-btn.green {
        background: #16a34a;
      }
      .submit-btn {
        padding: 14px 28px;
        background: #111827;
        color: white;
        border-radius: 14px;
        font-weight: 600;
      }
      .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `}</style>
  </div>
);
}