'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSalespersons } from '@/hooks/useSalespersons'
import { Salesperson } from '@/lib/firestore-models'
import { compressImage, validateImageFile } from '@/lib/image-utils'
import toast from 'react-hot-toast'
import FirestoreErrorDialog from '@/components/FirestoreErrorDialog'

interface FormData extends Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'> {}

const AVAILABLE_SPECIALIZATIONS = [
  'Technical Sales',
  'Enterprise Solutions',
  'Customer Success',
  'Product Expert',
  'Integration Specialist',
  'Account Management',
  'Onboarding',
  'Training & Support',
  'Billing & Licensing',
  'API & Development',
  'Security & Compliance',
  'Data Analytics'
]

export default function SalespersonManager() {
  const {
    salespersons,
    isLoading,
    indexError,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
  } = useSalespersons()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  useEffect(() => {
    if (indexError) setShowErrorDialog(true)
  }, [indexError])

  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'Sales',
    imageUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    bio: '',
    specializations: [], // Initialize empty array
    isActive: true,
    order: salespersons.length,
  })

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''

  /* ---------------- Image Upload ---------------- */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image')
      return
    }

    try {
      toast.loading('Compressing image...')
      const compressed = await compressImage(file, 700)
      setFormData(prev => ({ ...prev, imageUrl: compressed }))
      toast.dismiss()
      toast.success('Image ready')
    } catch (err) {
      toast.dismiss()
      toast.error('Image compression failed')
    }
  }

  /* ---------------- Specialization Handlers ---------------- */

  const toggleSpecialization = (specialization: string) => {
    setFormData(prev => {
      const current = prev.specializations || []
      const isSelected = current.includes(specialization)
      
      return {
        ...prev,
        specializations: isSelected
          ? current.filter(s => s !== specialization)
          : [...current, specialization]
      }
    })
  }

  /* ---------------- Helpers ---------------- */

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Sales',
      imageUrl: '',
      email: '',
      phone: '',
      whatsapp: '',
      bio: '',
      specializations: [],
      isActive: true,
      order: salespersons.length,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill all required fields')
        return
      }

      if (editingId) {
        await updateSalesperson(editingId, formData)
        toast.success('Salesperson updated')
      } else {
        await addSalesperson(formData)
        toast.success('Salesperson added')
      }

      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (person: Salesperson) => {
    setFormData({
      ...person,
      specializations: person.specializations || []
    } as FormData)
    setEditingId(person.id || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('This will permanently delete this team member. Continue?')) return
    await deleteSalesperson(id)
    toast.success('Salesperson deleted')
  }

  if (isLoading) {
    return <div className="py-10 text-center text-gray-600">Loading team…</div>
  }

  /* ---------------- Render ---------------- */

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Manage Team</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              + Add Team Member
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-bold mb-6">
              {editingId ? 'Edit Team Member' : 'Add New Team Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <input
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                {/* Priority Order */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority Order <span className="text-xs text-gray-400">(lower = shown first)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Specializations - NEW SECTION */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Areas of Expertise
                  <span className="text-xs text-gray-400 ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {AVAILABLE_SPECIALIZATIONS.map(spec => {
                    const isSelected = (formData.specializations || []).includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`
                          px-3 py-2 text-sm rounded-lg border-2 transition-all
                          ${isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {spec}
                      </button>
                    )
                  })}
                </div>
                {formData.specializations && formData.specializations.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.specializations.length} selected
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 resize-none"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                  <div className="relative w-20 h-20 mt-3 rounded overflow-hidden">
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-gray-500">
                      Inactive members are hidden from the website but kept for future use.
                    </p>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  {isSaving ? 'Saving…' : editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="grid gap-4">
          {salespersons.map(person => (
            <div key={person.id} className="bg-white border rounded-lg p-6 flex gap-4">
              {person.imageUrl && (
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image src={person.imageUrl} alt={person.name} fill className="object-cover" unoptimized />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-bold">{person.name}</p>
                <p className="text-sm text-blue-600">{person.role}</p>
                <p className="text-sm text-gray-600">{person.email}</p>
                
                {/* Display Specializations */}
                {person.specializations && person.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {person.specializations.map(spec => (
                      <span
                        key={spec}
                        className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {!person.isActive && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(person)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => person.id && handleDelete(person.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FirestoreErrorDialog
        error={indexError}
        projectId={projectId}
        isOpen={showErrorDialog}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </>
  )
}
