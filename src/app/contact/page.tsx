'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  label: string;
  order: number;
}

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  const currentSeason =
    new Date().getMonth() >= 3 && new Date().getMonth() <= 9 ? 'summer' : 'winter';

  // Fetch social links from Firebase
  useEffect(() => {
    const q = query(collection(db, 'socialLinks'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const links: SocialLink[] = [];
      snapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() } as SocialLink);
      });
      setSocialLinks(links);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fb] via-white to-[#f3f4f6]">
      {/* SECTION 1: CONTACT FORM - FULL WIDTH */}
      <section className="w-full py-20 sm:py-24 lg:py-32 bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-blue-600 mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Let's Talk Business
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Visit our showroom, call us, or drop a message. Team responds within working hours.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 sm:p-12 lg:p-16">
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="field-label mb-2 block">Full Name <span className="text-red-500">*</span></label>
                    <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="input h-14" />
                  </div>
                  <div>
                    <label className="field-label mb-2 block">Email <span className="text-red-500">*</span></label>
                    <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="you@example.com" className="input h-14" />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="field-label mb-2 block">Phone <span className="text-red-500">*</span></label>
                  <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 7006 XXX XXX" className="input h-14" />
                </div>
                <div className="mb-10">
                  <label className="field-label mb-2 block">How can we help? <span className="text-red-500">*</span></label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="Tell us about your requirement..." className="input" />
                </div>
                <button disabled={isLoading} className="submit-btn w-full lg:w-auto max-w-sm mx-auto block">
                  {isLoading ? (
                    <>
                      <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-3" />
                      Sending...
                    </>
                  ) : (
                    'Send Message ↗'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL LINKS - FIREBASE CONNECTED */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-blue-600 mb-4">
              Stay Connected
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with us across platforms for updates, offers & behind-the-scenes
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/70 hover:bg-white backdrop-blur border border-gray-200 hover:border-blue-200 rounded-2xl p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] h-28 sm:h-32 flex flex-col items-center justify-center text-center"
              >
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  {link.label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: STORE LOCATION & HOURS - DESKTOP FIRST, MOBILE RESPONSIVE */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* LOCATION INFO */}
            <div className="lg:order-2 space-y-6 lg:space-y-8">
              <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Store Location</h3>
                    <p className="text-sm text-blue-600 font-semibold">Gaw Kadal, Srinagar</p>
                  </div>
                </div>
                
                {settings?.addressText && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100 rounded-2xl p-6 mb-8">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {settings.addressText}
                    </p>
                  </div>
                )}

                {/* QUICK CONTACT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {settings?.primaryPhone && (
                    <a href={`tel:${settings.primaryPhone}`} className="contact-tile h-20 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl mb-1">📞</span>
                      <span className="font-semibold text-gray-900 block">{settings.primaryPhone}</span>
                    </a>
                  )}
                  {settings?.primaryEmail && (
                    <a href={`mailto:${settings.primaryEmail}`} className="contact-tile h-20 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl mb-1">✉️</span>
                      <span className="font-semibold text-gray-900 block truncate">{settings.primaryEmail}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* MAP & HOURS */}
            <div className="lg:order-1 space-y-6 lg:space-y-8">
              {/* HOURS */}
              {settings?.workingHours?.[currentSeason] && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-sm font-semibold text-emerald-700">
                        {currentSeason === 'summer' ? 'Summer' : 'Winter'} Timings
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-sm">
                    {Object.entries(settings.workingHours[currentSeason]).map(([day, h]) => (
                      <div key={day} className="bg-white rounded-xl p-3 text-center border hover:border-gray-200 transition-colors">
                        <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide">{day.slice(0,3)}</div>
                        {h.closed ? (
                          <div className="text-red-500 font-bold mt-1">CLOSED</div>
                        ) : (
                          <div className="text-gray-700 font-medium mt-1 text-xs">{h.open} - {h.close}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MAP */}
              {settings?.mapEmbedUrl && (
                <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      🗺️ Find Us on Map
                    </h4>
                    <p className="text-sm text-gray-600">Maisuma, Srinagar Location</p>
                  </div>
                  <div className="h-72 sm:h-96 lg:h-[28rem] w-full relative">
                    <div
                      className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-b-3xl"
                      dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .field-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .input {
          width: 100%;
          padding: 0 16px;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          background: #ffffff;
          font-size: 15px;
          color: #111827;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        .input::placeholder {
          color: #9ca3af;
        }
        .submit-btn {
          height: 56px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          color: white;
          border: none;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.025em;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(17, 24, 39, 0.3);
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #000000 0%, #111827 100%);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(17, 24, 39, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .contact-tile {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .contact-tile:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
        }

        @media (max-width: 1024px) {
          .h-72, .h-96 { height: 280px !important; }
        }
        @media (max-width: 640px) {
          .input { padding: 0 14px; height: 52px !important; }
          .submit-btn { height: 52px; font-size: 15px; }
        }
      `}</style>
    </div>
  );
}