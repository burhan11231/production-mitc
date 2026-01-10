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

      {/* SECTION 3: SINGLE LOCATION + HOURS SECTION */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-4">
              Visit Us
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Store Location & Hours
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find our Srinagar showroom and check current operating hours
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-4xl shadow-2xl overflow-hidden">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 p-8 sm:p-12 lg:p-16">
              
              {/* LOCATION INFO + HOURS - LEFT SIDE */}
              <div className="lg:col-span-7 space-y-8 mb-10 lg:mb-0">
                {/* MAIN LOCATION */}
                <div className="flex items-start gap-4 mb-8 p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl border border-emerald-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">MITC Showroom</h3>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      {settings?.addressText && (
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                          {settings.addressText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BUSINESS HOURS */}
                {settings?.workingHours?.[currentSeason] && (
                  <div className="bg-gradient-to-r from-gray-50 to-emerald-50 border border-gray-100 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⏰</span>
                      </div>
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Business Hours</h4>
                        <p className="text-lg font-semibold text-amber-700">
                          {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Timings
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                      {Object.entries(settings.workingHours[currentSeason]).map(([day, hours]) => (
                        <div key={day} className="group bg-white/80 hover:bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 text-center">
                          <div className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">
                            {day.slice(0,3)}
                          </div>
                          {hours.closed ? (
                            <div className="text-red-500 font-bold text-base px-2 py-1 bg-red-50 rounded-xl">CLOSED</div>
                          ) : (
                            <div className="text-gray-800 font-semibold text-sm">
                              {hours.open} - {hours.close}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MAP - RIGHT SIDE */}
              <div className="lg:col-span-5">
                {settings?.mapEmbedUrl && (
                  <div className="sticky top-8 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 text-white">
                      <h4 className="text-xl font-bold flex items-center gap-2">
                        🗺️ Live Location
                      </h4>
                      <p className="text-sm opacity-90 mt-1">Google Maps - Maisuma, Srinagar</p>
                    </div>
                    <div className="relative h-[320px] sm:h-[380px] lg:h-[420px] xl:h-[460px]">
                      <div
                        className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                        dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
                      />
                    </div>
                  </div>
                )}
              </div>
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

        @media (max-width: 1024px) {
          [class*="h-"] { height: 320px !important; }
        }
        @media (max-width: 640px) {
          .input { padding: 0 14px; height: 52px !important; }
          .submit-btn { height: 52px; font-size: 15px; }
        }
      `}</style>
    </div>
  );
}