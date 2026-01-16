// src/components/admin/SettingsTabs.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/firestore-models';

// UPDATED: Removed 'seo', 'founder', 'salespersons', 'password'
type SettingsTab = 'branding' | 'business' | 'hours';

const WEEK_DAYS: Array<
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsTabs() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { settings, updateSettings, activeSeason, updateActiveSeason } = useAdminSettings();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      const { logoUrl, ...rest } = formData;

const cleanSettings =
  logoUrl && logoUrl.trim()
    ? formData
    : rest;

await updateSettings(cleanSettings);
      toast.success(`${section} saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeasonToggle = async (season: 'summer' | 'winter') => {
    if (season === activeSeason) {
      toast('This season is already active');
      return;
    }

    const confirmed = window.confirm(
      `Confirm season change?\n\nThis will immediately update business hours across the app.`
    );

    if (!confirmed) return;

    try {
      await updateActiveSeason(season);
      toast.success(`Season switched to ${season}`);
    } catch {
      toast.error('Failed to update season');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    try {
      toast.loading('Compressing image...');
      const compressed = await compressImage(file, 700);
      setFormData({ ...formData, [field]: compressed });
      toast.dismiss();
      toast.success('Image ready!');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to compress image');
    }
  };

  if (isLoading || user?.role !== 'admin') return null;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'branding', label: '🎨 Branding' },
          { id: 'business', label: '📱 Business' },
          { id: 'hours', label: '⏰ Hours' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BRANDING TAB (Removed Featured Image) */}
      {activeTab === 'branding' && (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Branding & Logo</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="MITC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mateen IT Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (compressed, max 700KB)
                </label>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logoUrl')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.logoUrl && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border">
                      <Image src={formData.logoUrl} alt="Logo" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSave('Branding')}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS TAB */}
      {activeTab === 'business' && (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Details</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
                  <input
                    type="tel"
                    value={formData.primaryPhone || ''}
                    onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
                  <input
                    type="email"
                    value={formData.primaryEmail || ''}
                    onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="info@mitc.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.addressText || ''}
                  onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Gaw Kadal, Maisuma, Srinagar, J&K - 190001"
                />
              </div>

              {/* FULL GOOGLE MAP IFRAME EMBED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Embed (full iframe)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  In Google Maps, click Share &gt; Embed a map &gt; Copy HTML and paste the full iframe code here.
                </p>
                <textarea
                  value={formData.mapEmbedUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-xs"
                  placeholder={`<iframe src="https://www.google.com/maps/embed?pb=..." style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`}
                />

                {/* Preview */}
                {formData.mapEmbedUrl && (
                  <div className="mt-4 rounded-2xl border overflow-hidden bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-2">Live map preview</p>
                    <div className="relative w-full h-56">
                      <div
                        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: formData.mapEmbedUrl }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
                  <input
                    type="url"
                    value={formData.twitter || ''}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.youtube || ''}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave('Business Details')}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Business Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKING HOURS TAB */}
      {activeTab === 'hours' && (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Working Hours</h2>

            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">
                Active Season
              </span>

              <button
                onClick={() => handleSeasonToggle('summer')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeSeason === 'summer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Summer
              </button>

              <button
                onClick={() => handleSeasonToggle('winter')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeSeason === 'winter'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Winter
              </button>
            </div>

            <div className="space-y-8">
              {/* Summer Hours */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-4">Summer Hours</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WEEK_DAYS.map(day => {
                    const hours = formData.workingHours.summer[day];

                    return (
                      <div key={`summer-${day}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {day}
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  summer: {
                                    ...prev.workingHours.summer,
                                    [day]: { ...hours, open: e.target.value },
                                  },
                                },
                              }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />

                          <span className="pt-2 text-gray-500">to</span>

                          <input
                            type="time"
                            value={hours.close}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  summer: {
                                    ...prev.workingHours.summer,
                                    [day]: { ...hours, close: e.target.value },
                                  },
                                },
                              }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Winter Hours */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-4">Winter Hours</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WEEK_DAYS.map(day => {
                    const hours = formData.workingHours.winter[day];

                    return (
                      <div key={`winter-${day}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {day}
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  winter: {
                                    ...prev.workingHours.winter,
                                    [day]: { ...hours, open: e.target.value },
                                  },
                                },
                              }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />

                          <span className="pt-2 text-gray-500">to</span>

                          <input
                            type="time"
                            value={hours.close}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  winter: {
                                    ...prev.workingHours.winter,
                                    [day]: { ...hours, close: e.target.value },
                                  },
                                },
                              }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handleSave('Working Hours')}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Working Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}