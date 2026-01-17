'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Building2,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Image as ImageIcon,
  Sun,
  Moon,
} from 'lucide-react';

import { useAdminSettingsRTDB } from '@/hooks/useAdminSettingsRTDB';
import { useAuth } from '@/lib/auth-context';
import { DEFAULT_SETTINGS } from '@/lib/firestore-models';
import type { SiteSettings } from '@/lib/firestore-models';

import { compressImage, validateImageFile } from '@/lib/image-utils';

type SettingsTab = 'branding' | 'business' | 'hours';

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const ADMIN_EMAIL = 'burhan.ah.shkh@gmail.com';

export default function SettingsTabs() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const {
    settings,
    loading,
    updateBranding,
    updateBusiness,
    updateHours,
  } = useAdminSettingsRTDB();

  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (isLoading) return;
    if (!user || user.email !== ADMIN_EMAIL) {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  /* ---------------- HYDRATE ---------------- */
  useEffect(() => {
    if (!loading && settings && !hydrated) {
      setFormData(settings);
      setHydrated(true);
      setIsDirty(false); // Reset dirty state on initial load
    }
  }, [settings, loading, hydrated]);

  // Helper to update state and mark as dirty
  

const handleFormUpdate = (newData: SiteSettings) => {
  setFormData(newData);
  setIsDirty(true);
};

  /* ---------------- IMAGE ---------------- */
  const handleLogoUpload = async (file?: File) => {
    // Handle Removal
    if (!file) {
      handleFormUpdate({ ...formData, logoUrl: '' });
      toast.success('Logo removed');
      return;
    }

    // Handle Upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error ?? 'Invalid image file');
      return;
    }

    try {
      toast.loading('Optimizing logo…');
      const compressed = await compressImage(file, 700);
      handleFormUpdate({ ...formData, logoUrl: compressed });
      toast.dismiss();
      toast.success('Logo ready');
    } catch {
      toast.dismiss();
      toast.error('Image processing failed');
    }
  };

  /* ---------------- SAVE ---------------- */
  const saveBranding = async () => {
    setSaving(true);
    try {
      await updateBranding({
        businessName: formData.businessName,
        tagline: formData.tagline,
        logoUrl: formData.logoUrl,
      });
      setIsDirty(false);
      toast.success('Branding updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveBusiness = async () => {
    setSaving(true);
    try {
      await updateBusiness({
        primaryPhone: formData.primaryPhone,
        primaryWhatsApp: formData.primaryWhatsApp,
        primaryEmail: formData.primaryEmail,
        addressText: formData.addressText,
        mapEmbedUrl: formData.mapEmbedUrl,
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        youtube: formData.youtube,
      });
      setIsDirty(false);
      toast.success('Business info updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    setSaving(true);
    try {
      await updateHours({
        summer: formData.workingHours.summer,
        winter: formData.workingHours.winter,
        activeSeason: formData.workingHours.activeSeason || 'summer',
      });
      setIsDirty(false);
      toast.success('Hours updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get current save action
  const getCurrentSaveAction = () => {
  switch (activeTab) {
    case 'branding': return saveBranding;
    case 'business': return saveBusiness;
    case 'hours': return saveHours;
    default: return () => {};
  }
};

  if (loading || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your showroom branding, business details, and operating hours.</p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          
          {/* Vertical Navigation */}
          <nav className="lg:sticky lg:top-6 lg:h-fit bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:p-0">
            <div className="grid gap-1 lg:divide-y lg:divide-gray-100">
              {[
                { id: 'branding' as const, label: 'Branding', icon: ImageIcon },
                { id: 'business' as const, label: 'Business', icon: Building2 },
                { id: 'hours' as const, label: 'Hours', icon: Sun },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900 font-medium shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content Panel */}
          <div className="space-y-8">
            {activeTab === 'branding' && (
              <ContentPanel title="Brand Identity" helper="Set your showroom logo, name, and tagline.">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                  <LogoUploader
                    logoUrl={formData.logoUrl}
                    onUpload={handleLogoUpload}
                  />
                  <div className="space-y-6">
                    <InputField
                      label="Business Name"
                      helper="Your showroom name as it appears on the site"
                      value={formData.businessName}
                      onChange={(value) => handleFormUpdate({ ...formData, businessName: value })}
                    />
                    <InputField
                      label="Tagline"
                      helper="Short description about your business"
                      value={formData.tagline}
                      onChange={(value) => handleFormUpdate({ ...formData, tagline: value })}
                    />
                  </div>
                </div>
                <DesktopSaveButton 
                  onSave={saveBranding} 
                  saving={saving} 
                  disabled={!isDirty} 
                />
              </ContentPanel>
            )}

            {activeTab === 'business' && (
              <ContentPanel title="Business Information" helper="Contact details and social links for your showroom.">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Contact</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField
                        label="Phone"
                        icon={Phone}
                        value={formData.primaryPhone}
                        onChange={(value) => handleFormUpdate({ ...formData, primaryPhone: value })}
                      />
                      <InputField
                        label="Email"
                        icon={Mail}
                        value={formData.primaryEmail}
                        onChange={(value) => handleFormUpdate({ ...formData, primaryEmail: value })}
                      />
                    </div>
                  </div>

                  <InputField
                    label="Address"
                    helper="Full address or location description"
                    value={formData.addressText}
                    multiline
                    onChange={(value) => handleFormUpdate({ ...formData, addressText: value })}
                  />


<InputField
  label="Google Maps Embed (iframe)"
  helper="Paste the full iframe code copied from Google Maps"
  value={formData.mapEmbedUrl}
  multiline
  onChange={(value) =>
    handleFormUpdate({
      ...formData,
      mapEmbedUrl: value,
    })
  }
/>



                  <SocialLinksSection 
                    formData={formData} 
                    onChange={handleFormUpdate} 
                  />
                </div>
                <DesktopSaveButton 
                  onSave={saveBusiness} 
                  saving={saving} 
                  disabled={!isDirty} 
                />
              </ContentPanel>
            )}

            {activeTab === 'hours' && (
              <ContentPanel title="Working Hours" helper="Set your showroom operating hours for summer and winter seasons. Select the active season to enable editing.">
                <div className="space-y-10">
                  <SeasonToggle
                    activeSeason={
  formData.workingHours.activeSeason === 'winter' ? 'winter' : 'summer'
}
                    onSeasonChange={(season) => handleFormUpdate({
                      ...formData,
                      workingHours: {
                        ...formData.workingHours,
                        activeSeason: season
                      }
                    })}
                  />
                  
                  {(['summer', 'winter'] as const).map((season) => (
                    <HoursGrid
                      key={season}
                      season={season}
                      data={formData.workingHours[season]}
                      active={formData.workingHours.activeSeason === season}
                      onChange={(hours) => {
                        handleFormUpdate({
                          ...formData,
                          workingHours: {
                            ...formData.workingHours,
                            [season]: hours,
                          },
                        });
                      }}
                    />
                  ))}
                </div>
                <DesktopSaveButton 
                  onSave={saveHours} 
                  saving={saving} 
                  disabled={!isDirty} 
                />
              </ContentPanel>
            )}
          </div>
        </div>

        {/* Global Save Bar - Sticky on mobile */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 py-4 px-6 lg:static lg:pt-8">
  <div className="max-w-6xl mx-auto">
    {(() => {
      const onSave = getCurrentSaveAction();

      return (
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !isDirty}
          className="w-full lg:w-auto inline-flex justify-center items-center px-8 py-3 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md h-12"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            `Save ${
              activeTab === 'branding'
                ? 'Branding'
                : activeTab === 'business'
                ? 'Business'
                : 'Hours'
            }`
          )}
        </button>
      );
    })()}

    {isDirty && !saving && (
      <div className="text-xs text-amber-600 mt-2 lg:hidden">
        Unsaved changes
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function ContentPanel({ title, helper, children }: { title: string; helper: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">{helper}</p>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

function DesktopSaveButton({ onSave, saving, disabled }: { onSave: () => void, saving: boolean, disabled: boolean }) {
  return (
    <div className="hidden lg:flex justify-end pt-8 mt-4 border-t border-gray-50">
      <div className="flex items-center gap-4">
        {!disabled && <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>}
        <button
          onClick={onSave}
          disabled={saving || disabled}
          className="inline-flex justify-center items-center px-6 py-2.5 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md min-w-[120px]"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function LogoUploader({ logoUrl, onUpload }: { logoUrl?: string; onUpload: (file: File | undefined) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-gray-900">Logo</div>
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-gray-300 transition-colors bg-gray-50/50">
        <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gray-400 transition-colors">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Current logo"
              width={80}
              height={80}
              className="rounded-xl object-contain"
              unoptimized
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <label className="cursor-pointer block">
          <div className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all mx-auto">
            {logoUrl ? 'Replace Logo' : 'Upload Logo'}
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>
        {logoUrl && (
          <button
            onClick={() => onUpload(undefined)}
            className="text-xs text-gray-500 underline hover:text-gray-700 mt-2 block mx-auto"
            type="button"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center">Recommended: 300x100px, PNG or JPG</p>
    </div>
  );
}

function InputField({
  label,
  helper,
  value,
  onChange,
  multiline = false,
  icon: Icon,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <div className={`relative ${Icon ? 'pl-11' : ''}`}>
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        {multiline ? (
          <textarea
            rows={3}
            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all resize-vertical min-h-[100px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            className="w-full px-4 py-4 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
      </div>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function SocialLinksSection({ formData, onChange }: { formData: any; onChange: (data: any) => void }) {
  const socials = [
    { key: 'instagram', label: 'Instagram', Icon: Instagram },
    { key: 'facebook', label: 'Facebook', Icon: Facebook },
    { key: 'twitter', label: 'Twitter', Icon: Twitter },
    { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
    { key: 'youtube', label: 'YouTube', Icon: Youtube },
  ];

  return (
    <>
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">Social Links</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {socials.map(({ key, label, Icon }) => (
          <InputField
            key={key}
            label={label}
            value={formData[key] || ''}
            icon={Icon}
            onChange={(value) => onChange({ ...formData, [key]: value })}
          />
        ))}
      </div>
    </>
  );
}

function SeasonToggle({ activeSeason, onSeasonChange }: { activeSeason: 'summer' | 'winter'; onSeasonChange: (season: 'summer' | 'winter') => void }) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 max-w-max mx-auto">
      {(['summer', 'winter'] as const).map((season) => {
        const Icon = season === 'summer' ? Sun : Moon;
        return (
          <button
            key={season}
            onClick={() => onSeasonChange(season)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSeason === season
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {season.charAt(0).toUpperCase() + season.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

function HoursGrid({ season, data, active, onChange }: {
  season: 'summer' | 'winter';
  data: any;
  active: boolean;
  onChange: (hours: any) => void;
}) {
  return (
    <div className={`transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
      <h3 className="text-lg font-semibold text-gray-900 capitalize mb-6 flex items-center gap-2">
        {season} Hours {active && <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Active</span>}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 hover:bg-white hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-900">{day}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Open</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-all"
                  value={data?.[day]?.open || ''}
                  onChange={(e) => {
                    const newHours = { ...data };
                    if (!newHours[day]) newHours[day] = { open: '', close: '' };
                    newHours[day] = { ...newHours[day], open: e.target.value };
                    onChange(newHours);
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Close</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-all"
                  value={data?.[day]?.close || ''}
                  onChange={(e) => {
                    const newHours = { ...data };
                    if (!newHours[day]) newHours[day] = { open: '', close: '' };
                    newHours[day] = { ...newHours[day], close: e.target.value };
                    onChange(newHours);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}