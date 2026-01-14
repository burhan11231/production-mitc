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

export default function ContactPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

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

      setFormData(prev => ({
        ...prev,
        message: '',
      }));

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
            {/* QUOTA STATUS */}
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

            {messagesLeft === 0 && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                You’ve reached your monthly inquiry limit.
                Please visit us in-store for immediate help.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="field-label">Full Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input h-12"
                    required
                    disabled={isLoading || messagesLeft === 0}
                  />
                </div>
                <div>
                  <label className="field-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input h-12"
                    required
                    disabled={isLoading || messagesLeft === 0}
                  />
                </div>
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
                  disabled={isLoading || messagesLeft === 0}
                />
              </div>

              <div>
                <label className="field-label">How can we help? *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="input py-4 resize-none"
                  disabled={isLoading || messagesLeft === 0}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || messagesLeft === 0}
                className="submit-btn h-12 disabled:opacity-50"
              >
                {isLoading ? 'Sending…' : 'Send Message ↗'}
              </button>
            </form>
          </div>
        </div>
      </section>




{/* LOCATION & HOURS */}
<section className="py-20 sm:py-24 bg-white">
  <div className="max-w-7xl mx-auto px-6 lg:px-12">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

      {/* LEFT: ADDRESS + HOURS */}
      <div className="bg-sky-50/60 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm">

        {/* ADDRESS */}
        {settings?.addressText && (
          <div className="mb-10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Our Location
            </h4>
            <p className="text-2xl font-semibold text-gray-900 leading-relaxed whitespace-pre-line mb-6">
              {settings.addressText}
            </p>

            <a
              href="https://maps.app.goo.gl/6yAR2xVALw9uCF8q7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition"
            >
              Get Directions
              <span className="transition-transform group-hover:translate-x-1">↗</span>
            </a>
          </div>
        )}

        {/* BUSINESS HOURS */}
        {settings?.workingHours && (
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900">
                Business Hours
              </h4>
              <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-tight">
                Current Schedule
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(settings.workingHours).map(([day, h]: any) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100"
                >
                  <span className="text-xs font-bold uppercase text-gray-700">
                    {day}
                  </span>
                  {h.closed ? (
                    <span className="text-red-500 text-xs font-bold">Closed</span>
                  ) : (
                    <span className="text-xs text-gray-600 font-medium">
                      {h.open} – {h.close}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: MAP */}
      {settings?.mapEmbedUrl && (
        <div className="bg-sky-50/60 border border-gray-200 rounded-3xl shadow-sm overflow-hidden min-h-[420px]">
          <div
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: settings.mapEmbedUrl }}
          />
        </div>
      )}

    </div>
  </div>
</section>


      <style jsx>{`
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }
        .input {
          width: 100%;
          padding: 0 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fff;
          font-size: 14px;
          transition: 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .submit-btn {
          width: 100%;
          background: #111827;
          color: white;
          border-radius: 9999px;
          font-weight: 700;
          transition: 0.3s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #000;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}