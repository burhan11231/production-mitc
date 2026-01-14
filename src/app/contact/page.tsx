'use client';

import { useEffect, useState, useMemo } from 'react';
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

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  /* ---------------- SEASON ---------------- */

  const currentSeason =
    new Date().getMonth() >= 3 && new Date().getMonth() <= 9
      ? 'summer'
      : 'winter';

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
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const q = query(
          collection(db, 'leads'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', monthStart)
        );

        const snap = await getCountFromServer(q);
        setMessagesUsed(snap.data().count);
      } catch {
        setMessagesUsed(null);
      }
    };

    loadUsage();
  }, [user]);

  /* ---------------- TODAY & OPEN STATUS ---------------- */

  const todayKey = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  const openStatus = useMemo(() => {
    if (!settings?.workingHours?.[currentSeason]) return null;

    const now = new Date();
    const todayHours = settings.workingHours[currentSeason][todayKey];

    if (!todayHours || todayHours.closed) {
      return { open: false };
    }

    const [openH, openM] = todayHours.open.split(':').map(Number);
    const [closeH, closeM] = todayHours.close.split(':').map(Number);

    const openTime = new Date();
    openTime.setHours(openH, openM, 0);

    const closeTime = new Date();
    closeTime.setHours(closeH, closeM, 0);

    return {
      open: now >= openTime && now <= closeTime,
      closesAt: todayHours.close,
    };
  }, [settings, currentSeason, todayKey]);

  /* ---------------- HANDLERS ---------------- */

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

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-sky-50/60">

      {/* CONTACT FORM — NO CHANGE */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-blue-600 mb-4">
              Contact MITC
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Let’s Talk
            </h1>
            <p className="text-lg text-gray-600">
              Send us your requirement. We respond within working hours.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            {messagesLeft !== null && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold flex justify-between ${
                  messagesLeft > 5
                    ? 'bg-emerald-50 text-emerald-700'
                    : messagesLeft > 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <span>Monthly quota</span>
                <span>{messagesLeft} / {MAX_MESSAGES_PER_MONTH}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input h-12"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input h-12"
                  required
                />
              </div>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input h-12"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="input py-4 resize-none"
                required
              />

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

      {/* LOCATION + HOURS + MAP */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12">

            {/* LEFT */}
            <div className="bg-sky-50/60 border border-gray-200 rounded-3xl p-10 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
                Visit Us
              </p>

              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 whitespace-pre-line mb-6">
                {settings?.addressText}
              </p>

              {/* OPEN NOW BADGE */}
              {openStatus && (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 ${
                    openStatus.open
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {openStatus.open ? 'Open Now' : 'Closed'}
                  {openStatus.open && openStatus.closesAt && (
                    <span className="opacity-70">
                      • Closes at {openStatus.closesAt}
                    </span>
                  )}
                </div>
              )}

              {/* BUSINESS HOURS */}
              {settings?.workingHours?.[currentSeason] && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(settings.workingHours[currentSeason]).map(
                    ([day, h]: any) => {
                      const isToday = day === todayKey;

                      return (
                        <div
                          key={day}
                          className={`flex items-center justify-between p-3 rounded-xl border transition ${
                            isToday
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white border-gray-100'
                          }`}
                        >
                          <span
                            className={`text-xs uppercase font-bold ${
                              isToday ? 'text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            {day}
                          </span>

                          {h.closed ? (
                            <span className="text-red-500 text-xs font-bold">
                              Closed
                            </span>
                          ) : (
                            <span
                              className={`text-xs font-medium ${
                                isToday ? 'text-blue-700' : 'text-gray-600'
                              }`}
                            >
                              {h.open} – {h.close}
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* MAP */}
            {settings?.mapEmbedUrl && (
              <div
                className="bg-sky-50/60 border border-gray-200 rounded-3xl shadow-sm overflow-hidden min-h-[480px]"
                dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
              />
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fff;
          font-size: 14px;
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