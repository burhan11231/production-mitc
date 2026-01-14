'use client';

import { useEffect, useMemo, useState } from 'react';
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

  /* ---------------- FORM STATE (UNCHANGED LOGIC) ---------------- */

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

      toast.success('Message sent');
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

  const todayHours = settings?.workingHours?.[season]?.[todayName];

  const isOpenNow = useMemo(() => {
    if (!todayHours || todayHours.closed) return false;

    const now = new Date();
    const [oh, om] = todayHours.open.split(':').map(Number);
    const [ch, cm] = todayHours.close.split(':').map(Number);

    const open = new Date();
    open.setHours(oh, om, 0);

    const close = new Date();
    close.setHours(ch, cm, 0);

    return now >= open && now <= close;
  }, [todayHours]);

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

              {/* Labels restored (fixes mobile issue) */}
              <div>
                <label className="field-label">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  className="input h-12"
                />
              </div>

              <div>
                <label className="field-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="input py-3"
                  required
                />
              </div>

              <button
                disabled={isLoading}
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

          {/* HOURS */}
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

            <div
              className={`inline-flex mb-6 px-4 py-2 rounded-full text-xs font-bold ${
                isOpenNow
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isOpenNow ? 'Open Now' : 'Closed'}
            </div>

            <div className="space-y-2">
              {DAYS_ORDER.map(day => {
                const h = settings?.workingHours?.[season]?.[day];
                const isToday = day === todayName;

                return (
                  <div
                    key={day}
                    className={`flex justify-between px-4 py-2 rounded-xl ${
                      isToday
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border'
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

          {/* MAP */}
          {settings?.mapEmbedUrl && (
            <div
              className="rounded-3xl overflow-hidden border min-h-[450px]"
              dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
            />
          )}
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
        }
        .submit-btn {
          width: 100%;
          background: #111827;
          color: white;
          border-radius: 9999px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}