'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import toast from 'react-hot-toast';

type SettingsTab = 'seo' | 'business' | 'hours' | 'password';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('seo');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>(settings || {});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordData.current) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!passwordData.new) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement password change via Firebase
      // For now, just show a placeholder
      toast.success('Password update not yet implemented in demo');
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'seo', label: 'SEO Settings' },
            { id: 'business', label: 'Business Details' },
            { id: 'hours', label: 'Working Hours' },
            { id: 'password', label: 'Change Password' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <div className="card p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                <input
                  type="text"
                  value={formData.siteTitle || ''}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  placeholder="MITC - Mateen IT Corp"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Professional laptop sales and technical services in Srinagar..."
                  rows={3}
                  className="input-field w-full resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Max 160 characters for best display</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
                <input
                  type="url"
                  value={formData.ogImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Used for social media previews</p>
              </div>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
                {isSaving ? 'Saving...' : 'Save SEO Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Business Details Tab */}
        {activeTab === 'business' && (
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Details</h2>
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Your Business Name"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salesperson Name</label>
                  <input
                    type="text"
                    value={formData.salespersonName || ''}
                    onChange={(e) => setFormData({ ...formData, salespersonName: e.target.value })}
                    placeholder="Your Name"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Link</label>
                  <input
                    type="url"
                    value={formData.whatsappLink || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                    placeholder="https://wa.me/..."
                    className="input-field w-full"
                  />
                </div>
              </div>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
                {isSaving ? 'Saving...' : 'Save Business Details'}
              </button>
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
                  <input
                    type="url"
                    value={formData.twitter || ''}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/..."
                    className="input-field w-full"
                  />
                </div>
              </div>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
                {isSaving ? 'Saving...' : 'Save Social Links'}
              </button>
            </div>
          </div>
        )}

        {/* Working Hours Tab */}
        {activeTab === 'hours' && (
          <div className="card p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Working Hours</h2>
            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-900 text-sm">Summer Hours</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {formData.workingHours?.summer && Object.entries(formData.workingHours.summer).map(([day, hours]: any) => (
                    <div key={`summer-${day}`}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{day}</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={hours.open || '09:00'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                summer: {
                                  ...formData.workingHours.summer,
                                  [day]: { ...hours, open: e.target.value },
                                },
                              },
                            });
                          }}
                          className="input-field text-sm flex-1"
                        />
                        <span className="text-gray-500 text-xs pt-2">to</span>
                        <input
                          type="time"
                          value={hours.close || '18:00'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                summer: {
                                  ...formData.workingHours.summer,
                                  [day]: { ...hours, close: e.target.value },
                                },
                              },
                            });
                          }}
                          className="input-field text-sm flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-900 text-sm">Winter Hours</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {formData.workingHours?.winter && Object.entries(formData.workingHours.winter).map(([day, hours]: any) => (
                    <div key={`winter-${day}`}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{day}</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={hours.open || '09:00'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                winter: {
                                  ...formData.workingHours.winter,
                                  [day]: { ...hours, open: e.target.value },
                                },
                              },
                            });
                          }}
                          className="input-field text-sm flex-1"
                        />
                        <span className="text-gray-500 text-xs pt-2">to</span>
                        <input
                          type="time"
                          value={hours.close || '17:00'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                winter: {
                                  ...formData.workingHours.winter,
                                  [day]: { ...hours, close: e.target.value },
                                },
                              },
                            });
                          }}
                          className="input-field text-sm flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
              {isSaving ? 'Saving...' : 'Save Working Hours'}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-primary"
            >
              Update Password
            </button>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h3>
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
                <p className="text-red-800 text-sm">{passwordError}</p>
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="btn-primary flex-1"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
