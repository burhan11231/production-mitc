'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

interface Props {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function ContactInquiryForm({
  title = 'Send an Inquiry',
  subtitle = 'Tell us what you need. Our team responds within working hours.',
  compact = false,
}: Props) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  /* ---------- Prefill from auth ---------- */
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  /* ---------- Global storage status ---------- */
  useEffect(() => {
    fetch('/api/contact/status', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setIsBlocked(Boolean(data?.blocked)))
      .catch(() => setIsBlocked(false)); // fail-open
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
      toast.error('Messages are temporarily unavailable.');
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
    <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
      <h4 className="text-2xl font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

      {isBlocked && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          We are temporarily pausing new inquiries due to system capacity.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading || isBlocked}
          className="input h-12"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading || isBlocked}
          className="input h-12"
          required
        />

        <input
          name="phone"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading || isBlocked}
          className="input h-12"
        />

        <textarea
          name="message"
          placeholder="How can we help?"
          value={formData.message}
          onChange={handleChange}
          disabled={isLoading || isBlocked}
          rows={compact ? 3 : 4}
          className="input py-4 resize-none"
          required
        />

        <button
          disabled={isLoading || isBlocked}
          className="submit-btn h-12 disabled:opacity-50"
        >
          {isBlocked
            ? 'Messages unavailable'
            : isLoading
            ? 'Sending…'
            : 'Send Message ↗'}
        </button>
      </form>
    </div>
  );
}