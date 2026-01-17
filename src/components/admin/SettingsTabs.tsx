'use client';

import { useState, useEffect } from 'react';
import { useAdminSettingsRTDB } from '@/hooks/useAdminSettingsRTDB';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import { DEFAULT_SETTINGS } from '@/lib/firestore-models';

type SettingsTab = 'branding' | 'business' | 'hours';

const WEEK_DAYS: Array<
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsTabs() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const {
    settings,
    loading,
    updateBranding,
    updateBusiness,
    updateHours,
  } = useAdminSettingsRTDB();

  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_SETTINGS)

const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  if (!loading && settings && !hydrated) {
    setFormData(settings);
    setHydrated(true);
  }
}, [settings, loading, hydrated]);

  const ADMIN_EMAIL = 'burhan.ah.shkh@gmail.com';

useEffect(() => {
  if (!isLoading && user?.email !== ADMIN_EMAIL) {
    toast.error('Admin access required');
    router.push('/');
  }
}, [user, isLoading, router]);

  

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image');
      return;
    }

    try {
      toast.loading('Compressing image...');
      const compressed = await compressImage(file, 700);
      setFormData(prev => ({ ...prev, [field]: compressed }));
      toast.dismiss();
      toast.success('Image ready');
    } catch {
      toast.dismiss();
      toast.error('Image compression failed');
    }
  };

  /* ---------------- SAVE HANDLERS ---------------- */

  const saveBranding = async () => {
    setIsSaving(true);
    try {
      await updateBranding({
        businessName: formData.businessName,
        tagline: formData.tagline,
        logoUrl: formData.logoUrl,
      });
      toast.success('Branding saved');
    } catch {
      toast.error('Failed to save branding');
    } finally {
      setIsSaving(false);
    }
  };

  const saveBusiness = async () => {
    setIsSaving(true);
    try {
      await updateBusiness({
  primaryPhone: formData.primaryPhone,
  primaryWhatsApp: formData.primaryWhatsApp || '',
  primaryEmail: formData.primaryEmail,
  addressText: formData.addressText,
  mapEmbedUrl: formData.mapEmbedUrl,
  instagram: formData.instagram,
  facebook: formData.facebook,
  twitter: formData.twitter,
  linkedin: formData.linkedin,
  youtube: formData.youtube,
})
      toast.success('Business details saved');
    } catch {
      toast.error('Failed to save business details');
    } finally {
      setIsSaving(false);
    }
  };

  const saveHours = async () => {
    setIsSaving(true);
    try {
      await updateHours({
        summer: formData.workingHours.summer,
        winter: formData.workingHours.winter,
        activeSeason: formData.workingHours.activeSeason || 'summer',
      });
      toast.success('Working hours saved');
    } catch {
      toast.error('Failed to save working hours');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
  return <div className="p-8 text-gray-500 text-sm">Loading settings…</div>;
}

if (user?.email !== ADMIN_EMAIL) {
  return null;
}

  return (
    <div>
      {/* TABS */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'branding', label: '🎨 Branding' },
          { id: 'business', label: '📱 Business' },
          { id: 'hours', label: '⏰ Hours' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white border rounded-lg p-8 space-y-6">
          <input
            value={formData.businessName}
            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="Business Name"
            className="input"
          />

          <input
            value={formData.tagline}
            onChange={e => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Tagline"
            className="input"
          />

          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logoUrl')} />

          {formData.logoUrl && (
            <div className="w-16 h-16 relative">
              <Image src={formData.logoUrl} alt="Logo" fill unoptimized />
            </div>
          )}

          <button onClick={saveBranding} disabled={isSaving} className="btn-primary">
            Save Branding
          </button>
        </div>
      )}

      {/* BUSINESS */}
      {activeTab === 'business' && (
        <div className="bg-white border rounded-lg p-8 space-y-6">
          <input
            value={formData.primaryPhone}
            onChange={e => setFormData({ ...formData, primaryPhone: e.target.value })}
            placeholder="Phone"
            className="input"
          />

          <input
            value={formData.primaryEmail}
            onChange={e => setFormData({ ...formData, primaryEmail: e.target.value })}
            placeholder="Email"
            className="input"
          />

          <textarea
            value={formData.addressText}
            onChange={e => setFormData({ ...formData, addressText: e.target.value })}
            placeholder="Address"
            className="textarea"
          />


<input
  value={formData.instagram}
  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
  placeholder="Instagram URL"
  className="input"
/>

<input
  value={formData.facebook}
  onChange={e => setFormData({ ...formData, facebook: e.target.value })}
  placeholder="Facebook URL"
  className="input"
/>

<input
  value={formData.twitter}
  onChange={e => setFormData({ ...formData, twitter: e.target.value })}
  placeholder="Twitter / X URL"
  className="input"
/>

<input
  value={formData.linkedin}
  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
  placeholder="LinkedIn URL"
  className="input"
/>

<input
  value={formData.youtube}
  onChange={e => setFormData({ ...formData, youtube: e.target.value })}
  placeholder="YouTube URL"
  className="input"
/>



          <button onClick={saveBusiness} disabled={isSaving} className="btn-primary">
            Save Business
          </button>
        </div>
      )}

      {/* HOURS */}
      {activeTab === 'hours' && (
  <div className="bg-white border rounded-lg p-8 space-y-8">

    {(['summer', 'winter'] as const).map(season => (
      <div key={season}>
        <h3 className="font-semibold capitalize mb-4">{season} hours</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WEEK_DAYS.map(day => (
            <div key={`${season}-${day}`} className="flex gap-2 items-center">
              <span className="w-24 text-sm">{day}</span>

              <input
                type="time"
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
                className="input"
              />

              <input
                type="time"
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
                className="input"
              />
            </div>
          ))}
        </div>
      </div>
    ))}

    <button onClick={saveHours} className="btn-primary">
      Save Hours
    </button>
  </div>
)}
    </div>
  );
}