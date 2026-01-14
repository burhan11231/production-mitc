'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const MAX_MESSAGES_PER_MONTH = 30;

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  /* ---------------- FORM STATE ---------------- */

  const [isLoading, setIsLoading] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState<number | null>(null);

  const messagesLeft =
    messagesUsed !== null
      ? Math.max(0, MAX_MESSAGES_PER_MONTH - messagesUsed)
      : null;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });

  /* ---------------- AUTO FILL ---------------- */

  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  /* ---------------- MONTHLY LIMIT ---------------- */

  useEffect(() => {
    if (!user) {
      setMessagesUsed(null);
      return;
    }

    const loadUsage = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const q = query(
        collection(db, 'leads'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', monthStart)
      );

      const snap = await getCountFromServer(q);
      setMessagesUsed(snap.data().count);
    };

    loadUsage();
  }, [user]);

  /* ---------------- FORM HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messagesLeft !== null && messagesLeft <= 0) {
      toast.error('Monthly inquiry limit reached.');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsLoading(true);

    try {
      await addDoc(collection(db, 'leads'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        userId: user?.uid || null,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Message sent successfully');
      setFormData(prev => ({ ...prev, message: '' }));
      setMessagesUsed(prev => (prev === null ? null : prev + 1));
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- BUSINESS HOURS ---------------- */

  const [season, setSeason] = useState<'summer' | 'winter'>('summer');

  const todayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-sky-50/60">

      {/* CONTACT FORM */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-blue-600 mb-3">
              Contact MITC
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Let’s Talk
            </h1>
            <p className="text-gray-600">
              Send us your requirement. We respond within working hours.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="field-label">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="input h-12"
                  required
                />
              </div>

              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input h-12"
                  required
                />
              </div>

              <div>
                <label className="field-label">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 7006 XXX XXX"
                  className="input h-12"
                />
              </div>

              <div>
                <label className="field-label">How can we help?</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Laptop model, specifications or any questions you have..."
                  rows={4}
                  className="input py-3 resize-none"
                  required
                />
              </div>

              <button
                disabled={isLoading || messagesLeft === 0}
                className="submit-btn h-12"
              >
                {isLoading ? 'Sending…' : 'Send Message ↗'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BUSINESS HOURS + MAP */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12">

          {/* BUSINESS HOURS */}
          <div className="bg-sky-50/60 rounded-3xl p-8 border">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Business Hours</h3>

              <div className="flex gap-2">
                {(['summer', 'winter'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-4 py-1 rounded-full text-xs font-bold ${
                      season === s
                        ? 'bg-black text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {DAYS_ORDER.map(day => {
                const h = settings?.workingHours?.[season]?.[day];
                const isToday = day === todayName;

                return (
                  <div
                    key={day}
                    className={`flex justify-between px-4 py-2 rounded-xl border ${
                      isToday
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className="font-semibold">{day}</span>
                    {h?.closed ? (
                      <span className="text-red-500 text-sm font-bold">
                        Closed
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm">
                        {h?.open} – {h?.close}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAP (STABLE) */}
          {settings?.mapEmbedUrl && (
            <div
              className="rounded-3xl overflow-hidden border min-h-[450px]"
              dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
            />
          )}
        </div>
      </section>


<section className="bg-sky-50/60 py-12 md:py-16">
  <div className="max-w-6xl mx-auto px-6 md:px-8">

    <div className="text-left mb-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
        Talk directly with the MITC Team
      </h2>
      <p className="mt-3 text-lg text-slate-600 max-w-2xl">
        Skip the generic queues and get personalized guidance on products and technical queries from our experts.
      </p>
    </div>

    <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-10 border-l-2 border-sky-200 pl-4 md:border-l-0 md:pl-0">

      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-slate-700 font-medium text-sm md:text-base">
          Expert technical assistance
        </span>
      </div>

      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-slate-700 font-medium text-sm md:text-base">
          Faster response times
        </span>
      </div>

      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-slate-700 font-medium text-sm md:text-base">
          Product-specific inquiries
        </span>
      </div>

    </div>

    <div className="flex flex-col items-start">
      <a
  href="/team"
  className="w-full md:w-auto inline-flex justify-center items-center px-6 py-3 bg-black text-white font-semibold hover:bg-neutral-900 transition-colors duration-200 shadow-sm"
>
  Meet Our Team
</a>

      <p className="mt-3 text-sm text-slate-500 flex items-center gap-1.5">
        <span className="block w-2 h-2 bg-emerald-400 rounded-full" />
        We usually respond within business hours
      </p>
    </div>

  </div>
</section>


      <style jsx>{`
        .field-label {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          display: block;
          color: #374151;
        }
        .input {
          width: 100%;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          padding: 0 14px;
          font-size: 14px;
        }
        .submit-btn {
          width: 100%;
          background: #111827;
          color: white;
          border-radius: 9999px;
          font-weight: 700;
          transition: 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #000;
        }
      `}</style>
    </div>
  );
}