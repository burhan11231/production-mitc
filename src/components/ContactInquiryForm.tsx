'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function ContactInquiryForm({
  title = 'Let’s Talk',
  subtitle = 'Send us your requirement. We respond within working hours.',
}: Props) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [usagePercent, setUsagePercent] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  /* ---------- Prefill from Auth ---------- */
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  /* ---------- Storage Status (Sync with Page Logic) ---------- */
  useEffect(() => {
    let mounted = true;
    fetch('/api/contact/status', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        setIsBlocked(Boolean(data?.blocked));
        setUsagePercent(typeof data?.percent === 'number' ? data.percent : null);
      })
      .catch(() => {
        if (mounted) setIsBlocked(false); // Fail-open
      });
    return () => { mounted = false; };
  }, []);

  /* ---------- Handlers ---------- */
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
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || 'Failed to send message');
        return;
      }

      toast.success('Message sent successfully');
      setFormData(prev => ({ ...prev, message: '' }));
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
      <div className="mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            disabled={isLoading || isBlocked}
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
            disabled={isLoading || isBlocked}
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
            disabled={isLoading || isBlocked}
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
            disabled={isLoading || isBlocked}
            rows={4}
            className="input py-3 resize-none"
            required
          />
        </div>

        <button
          disabled={isLoading || isBlocked}
          className="submit-btn h-12 mt-2"
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

      {/* STYLES - Matches ContactPage exactly */}
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
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
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
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
