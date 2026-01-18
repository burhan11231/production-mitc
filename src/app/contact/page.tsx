'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSettingsRTDB } from '@/hooks/useSettingsRTDB';

/* ------------------------------------
   CONSTANTS
------------------------------------ */

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/* ------------------------------------
   COMPONENT
------------------------------------ */

export default function ContactPage() {
  const { settings } = useSettingsRTDB();

  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [usagePercent, setUsagePercent] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  /* ------------------------------------
     STORAGE STATUS (GLOBAL)
  ------------------------------------ */

  useEffect(() => {
  let mounted = true;

  fetch('/api/contact/status', { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      if (!mounted) return;
      setIsBlocked(Boolean(data.blocked));
      setUsagePercent(
        typeof data.percent === 'number' ? data.percent : null
      );
    })
    .catch(() => {
      // Fail-open: do not block on error
      setIsBlocked(false);
    });

  return () => {
    mounted = false;
  };
}, []);

  /* ------------------------------------
     FORM HANDLERS
  ------------------------------------ */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error('Messages are currently unavailable. Please try again later.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send message');
        return;
      }

      toast.success('Message sent successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------
     BUSINESS HOURS (RTDB SAFE)
  ------------------------------------ */

  const activeSeason =
    settings?.workingHours?.activeSeason === 'winter'
      ? 'winter'
      : 'summer';

  const hours = settings?.workingHours?.[activeSeason] ?? {};

  const todayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  /* ------------------------------------
     UI
  ------------------------------------ */

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
                disabled={isLoading || isBlocked}
                className="submit-btn h-12"
              >
                {isBlocked
                  ? 'Messages temporarily unavailable'
                  : isLoading
                  ? 'Sending…'
                  : 'Send Message ↗'}
              </button>

              {isBlocked && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Messages are temporarily disabled due to system capacity.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* BUSINESS HOURS + MAP */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12">

          {/* BUSINESS HOURS */}
          <div className="bg-sky-50/60 rounded-3xl p-8 border">
            <h3 className="text-xl font-bold mb-6">Business Hours</h3>

            <div className="space-y-2">
              {DAYS_ORDER.map(day => {
                const h = hours?.[day];
                const isToday = day === todayName;

                const isClosed =
                  h?.closed === true || !h?.open || !h?.close;

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

                    {isClosed ? (
                      <span className="text-red-500 text-sm font-bold">
                        Closed
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm">
                        {h.open} – {h.close}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAP */}
          {typeof settings?.mapEmbedUrl === 'string' &&
            settings.mapEmbedUrl.includes('<iframe') && (
              <div
                className="rounded-3xl overflow-hidden border min-h-[450px]"
                dangerouslySetInnerHTML={{
                  __html: settings.mapEmbedUrl,
                }}
              />
            )}
        </div>
      </section>

      {/* STYLES */}
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