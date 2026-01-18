'use client';

import { useState, useEffect } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import { SiteSettings } from '@/lib/firestore-models';
import SalespersonManager from './SalespersonManager';

export default function TeamManager() {
  const { settings, updateSettings } = useAdminSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSaveFounder = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateSettings({ ...settings, ...formData } as SiteSettings);
      toast.success('Founder details updated');
    } catch {
      toast.error('Failed to save founder details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteSettings
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image');
      return;
    }

    try {
      toast.loading('Optimizing image...');
      const compressed = await compressImage(file, 700);
      setFormData(prev => ({ ...prev, [field]: compressed }));
      toast.dismiss();
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  if (!settings) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        Loading team settings…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* TEAM MANAGEMENT (PRIMARY) */}
<section>
  <SalespersonManager />
</section>

      {/* FOUNDER MANAGEMENT (SECONDARY) */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Founder Information
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Public-facing founder details shown on the website.
          </p>
        </div>

        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founder Name
            </label>
            <input
              type="text"
              value={formData.founderName || ''}
              onChange={e =>
                setFormData({ ...formData, founderName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founder Email
            </label>
            <input
              type="email"
              value={formData.founderEmail || ''}
              onChange={e =>
                setFormData({ ...formData, founderEmail: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founder Image
            </label>

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, 'founderImageUrl')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />

              {formData.founderImageUrl && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border">
                  <Image
                    src={formData.founderImageUrl}
                    alt="Founder"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founder Bio
            </label>
            <textarea
              value={formData.founderBio || ''}
              onChange={e =>
                setFormData({ ...formData, founderBio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Short professional biography"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveFounder}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save Founder Details'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}