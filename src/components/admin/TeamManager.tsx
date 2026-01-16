// src/components/admin/TeamManager.tsx

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
  // Initialize with empty object to prevent null access, will populate via useEffect
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  // Sync global settings to local form state
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Handle saving specific sections (Founder data)
  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      // Merge current form data with existing settings
      await updateSettings({ ...settings, ...formData } as SiteSettings);
      toast.success('Founder details saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Image Upload Logic
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
      setFormData((prev) => ({ ...prev, [field]: compressed }));
      toast.dismiss();
      toast.success('Image ready!');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to compress image');
    }
  };

  if (!settings) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: FOUNDER DETAILS */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Founder Details</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founder Name</label>
            <input
              type="text"
              value={formData.founderName || ''}
              onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mateen Ahmed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founder Email</label>
            <input
              type="email"
              value={formData.founderEmail || ''}
              onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founder Image</label>
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'founderImageUrl')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              {formData.founderImageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Founder Bio</label>
            <textarea
              value={formData.founderBio || ''}
              onChange={(e) => setFormData({ ...formData, founderBio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Brief biography..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Founder Details'}
          </button>
        </div>
      </div>

      {/* SECTION 2: TEAM / SALESPERSONS MANAGER */}
      {/* We wrap SalespersonManager in the same style container if SalespersonManager doesn't already have one, 
          or we just render it directly if it has its own container. 
          Based on your provided code, SalespersonManager is usually self-contained. 
          If you want a unified look, we can wrap it: */}
      
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h2>
        <SalespersonManager />
      </div>

    </div>
  );
}