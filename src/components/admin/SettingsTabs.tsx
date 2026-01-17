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
  const [formData, setFormData] = useState(settings || DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

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

  if (loading || user?.role !== 'admin') return null;

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

          <button onClick={saveBusiness} disabled={isSaving} className="btn-primary">
            Save Business
          </button>
        </div>
      )}

      {/* HOURS */}
      {activeTab === 'hours' && (
        <div className="bg-white border rounded-lg p-8 space-y-6">
          <button onClick={saveHours} disabled={isSaving} className="btn-primary">
            Save Hours
          </button>
        </div>
      )}
    </div>
  );
}