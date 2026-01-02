// src/components/admin/SalespersonManager.tsx
// src/components/admin/SalespersonManager.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSalespersons } from '@/hooks/useSalespersons';
import { Salesperson } from '@/lib/firestore-models';
import { compressImage, validateImageFile } from '@/lib/image-utils';
import toast from 'react-hot-toast';
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog';

interface FormData extends Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'> {}

export default function SalespersonManager() {
  const { salespersons, isLoading, indexError, addSalesperson, updateSalesperson, deleteSalesperson } = useSalespersons();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(!!indexError);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'Sales',
    imageUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    bio: '',
    isActive: true,
    order: salespersons.length,
  });

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData((prev) => ({ ...prev, imageUrl: compressed }));
      toast.dismiss();
      toast.success('Image compressed and ready!');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to compress image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill all required fields');
        setIsSaving(false);
        return;
      }

      if (editingId) {
        await updateSalesperson(editingId, formData);
      } else {
        await addSalesperson(formData);
      }

      resetForm();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Sales',
      imageUrl: '',
      email: '',
      phone: '',
      whatsapp: '',
      bio: '',
      isActive: true,
      order: salespersons.length,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (person: Salesperson) => {
    setFormData(person as FormData);
    setEditingId(person.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salesperson?')) {
      try {
        await deleteSalesperson(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading salespersons...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Manage Salespersons</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              + Add Salesperson
            </button>
          )}
        </div>

        {/* Error Banner */}
        {indexError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-red-900">📌 Composite Index Error</p>
              <p className="text-sm text-red-800 mt-1">A database index is required to fetch salespersons</p>
            </div>
            <button
              onClick={() => setShowErrorDialog(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm"
            >
              View Details
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Salesperson' : 'Add New Salesperson'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Brief description..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image (Max 700KB)
                </label>
                <div className="flex gap-4 items-start">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="grid gap-4">
          {salespersons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No salespersons yet</p>
            </div>
          ) : (
            salespersons.map((person) => (
              <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-6 flex gap-4">
                {person.imageUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={person.imageUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{person.role}</p>
                  <p className="text-sm text-gray-600">{person.email}</p>
                  <p className="text-sm text-gray-600">{person.phone}</p>
                  {!person.isActive && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex gap-2 self-start">
                  <button
                    onClick={() => handleEdit(person)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => person.id && handleDelete(person.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Dialog */}
      <FirestoreErrorDialog
        error={indexError}
        projectId={projectId}
        isOpen={showErrorDialog}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </>
  );
}
