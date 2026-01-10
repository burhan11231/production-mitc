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
      {/* SECTION 1: CONTACT FORM */}
      <section className="w-full py-20 sm:py-24 lg:py-32 bg-sky-50/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-blue-600 mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Let's Talk Business
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Drop a message or visit us. Our team responds within working hours.
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
                    <><span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-3" />Sending...</>
                  ) : (
                    'Send Message ↗'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      

      {/* SECTION 3: UNIFIED LOCATION & HOURS */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* LEFT: LOCATION & HOURS CARD */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm h-full">
                
                {/* Address */}
                {settings?.addressText && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Our Address</h4>
                    <p className="text-gray-900 font-medium leading-relaxed whitespace-pre-line text-2xl mb-6">
                      {settings.addressText}
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/6yAR2xVALw9uCF8q7" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group"
                    >
                      Get Directions on Google Maps
                      <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                    </a>
                  </div>
                )}

                {/* Integrated Business Hours */}
                {settings?.workingHours?.[currentSeason] && (
                  <div className="border-t border-gray-100 pt-8 mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⏰</span>
                        <h4 className="text-lg font-bold text-gray-900">Business Hours</h4>
                      </div>
                      <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-tighter">
                        {currentSeason} Schedule
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(settings.workingHours[currentSeason]).map(([day, h]) => (
                        <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-gray-200 transition-colors">
                          <span className="font-bold text-gray-900 text-sm uppercase">{day}</span>
                          {h.closed ? (
                            <span className="text-red-500 font-bold text-xs">CLOSED</span>
                          ) : (
                            <span className="text-gray-600 font-medium text-xs">{h.open} - {h.close}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: MAP */}
            {settings?.mapEmbedUrl && (
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="flex-grow relative">
                  <div
                    className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .field-label { font-size: 14px; font-weight: 600; color: #374151; }
        .input { width: 100%; padding: 0 16px; border-radius: 16px; border: 2px solid #e5e7eb; background: #ffffff; font-size: 15px; transition: all 0.2s ease; }
        .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .submit-btn { height: 56px; background: #111827; color: white; border-radius: 9999px; font-weight: 700; transition: all 0.3s ease; width: 100%; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: #000; }
      `}</style>
    </div>
  );
}