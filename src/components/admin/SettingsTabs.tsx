'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAdminSettingsRTDB } from '@/hooks/useAdminSettingsRTDB';
import { useAuth } from '@/lib/auth-context';
import { DEFAULT_SETTINGS } from '@/lib/firestore-models';
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
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

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
    }
  }, [settings, loading, hydrated]);

  /* ---------------- IMAGE ---------------- */

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      toast.loading('Optimizing logo…');
      const compressed = await compressImage(file, 700);
      setFormData(prev => ({ ...prev, logoUrl: compressed }));
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
      toast.success('Hours updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !hydrated) {
    return <div className="p-10 text-sm text-gray-500">Loading settings…</div>;
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-[env(safe-area-inset-bottom)]">

      {/* ---------- HEADER ---------- */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">
          Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage branding, business info, and working hours
        </p>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-2 border-b mb-10 overflow-x-auto">
        {[
          { id: 'branding', label: 'Branding' },
          { id: 'business', label: 'Business' },
          { id: 'hours', label: 'Hours' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================
         BRANDING
      ====================================================== */}
      {activeTab === 'branding' && (
        <Section
          title="Brand Identity"
          actionLabel="Save Branding"
          onSave={saveBranding}
          saving={saving}
        >
          <Field label="Business Name">
            <input
              className="input"
              value={formData.businessName}
              onChange={e =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </Field>

          <Field label="Tagline">
            <input
              className="input"
              value={formData.tagline}
              onChange={e =>
                setFormData({ ...formData, tagline: e.target.value })
              }
            />
          </Field>

          <Field label="Logo">
            <div className="flex items-center gap-6">
              {formData.logoUrl && (
                <Image
                  src={formData.logoUrl}
                  alt="Logo"
                  width={64}
                  height={64}
                  className="rounded-lg border"
                  unoptimized
                />
              )}
              <label className="btn-secondary cursor-pointer">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => handleLogoUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </Field>
        </Section>
      )}

      {/* ======================================================
         BUSINESS
      ====================================================== */}
      {activeTab === 'business' && (
        <Section
          title="Business Information"
          actionLabel="Save Business"
          onSave={saveBusiness}
          saving={saving}
        >
          <Grid>
            <Field label="Phone">
              <input
                className="input"
                value={formData.primaryPhone}
                onChange={e =>
                  setFormData({ ...formData, primaryPhone: e.target.value })
                }
              />
            </Field>

            <Field label="Email">
              <input
                className="input"
                value={formData.primaryEmail}
                onChange={e =>
                  setFormData({ ...formData, primaryEmail: e.target.value })
                }
              />
            </Field>
          </Grid>

          <Field label="Address">
            <textarea
              className="textarea"
              value={formData.addressText}
              onChange={e =>
                setFormData({ ...formData, addressText: e.target.value })
              }
            />
          </Field>

          <Divider label="Social Links" />

          <Grid>
            {['instagram', 'facebook', 'twitter', 'linkedin', 'youtube'].map(
              key => (
                <Field key={key} label={key}>
                  <input
                    className="input"
                    value={(formData as any)[key]}
                    onChange={e =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                </Field>
              )
            )}
          </Grid>
        </Section>
      )}

      {/* ======================================================
         HOURS
      ====================================================== */}
      {activeTab === 'hours' && (
        <Section
          title="Working Hours"
          actionLabel="Save Hours"
          onSave={saveHours}
          saving={saving}
        >
          {(['summer', 'winter'] as const).map(season => (
            <div key={season} className="mb-10">
              <h3 className="font-semibold mb-4 capitalize">{season}</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {WEEK_DAYS.map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 text-sm">{day}</span>
                    <input
                      type="time"
                      className="input"
                      value={formData.workingHours[season][day]?.open || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [season]: {
                              ...prev.workingHours[season],
                              [day]: {
                                ...prev.workingHours[season][day],
                                open: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                    />
                    <input
                      type="time"
                      className="input"
                      value={formData.workingHours[season][day]?.close || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [season]: {
                              ...prev.workingHours[season],
                              [day]: {
                                ...prev.workingHours[season][day],
                                close: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ======================================================
   UI HELPERS
====================================================== */

function Section({
  title,
  children,
  actionLabel,
  onSave,
  saving,
}: any) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6 md:p-8 space-y-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
      <div className="sticky bottom-0 bg-white pt-6 border-t">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving…' : actionLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return <div className="grid md:grid-cols-2 gap-6">{children}</div>;
}

function Divider({ label }: any) {
  return (
    <div className="pt-4 border-t">
      <span className="text-xs uppercase tracking-wider text-gray-400">
        {label}
      </span>
    </div>
  );
}