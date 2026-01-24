'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

import { useAdminSalespersons } from '@/hooks/useAdminSalespersons'
import { Salesperson } from '@/lib/firestore-models'
import { compressImage, validateImageFile } from '@/lib/image-utils'

/* ================= TYPES ================= */

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
  'Data Analytics',
]

const ROLES = ['Sales', 'Support', 'Manager'] as const

interface ConfirmDialogState {
  isOpen: boolean
  action: 'delete' | 'activate' | 'deactivate' | null
  salespersonId: string | null
  salespersonName: string
}

/* ================= COMPONENT ================= */

export default function AdminTeamManager() {
  const {
    salespersons,
    isLoading,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
  } = useAdminSalespersons()

  /* ================= STATE ================= */

  const [editingId, setEditingId] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<FormData | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isImageProcessing, setIsImageProcessing] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    action: null,
    salespersonId: null,
    salespersonName: '',
  })

  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'Sales',
    imageUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    bio: '',
    specializations: [],
    isActive: true,
    order: 0,
  })


const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
const [roleFilter, setRoleFilter] = useState<string>('all')
const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')


  /* ================= DERIVED ================= */

  const nextOrder = useMemo(
    () => (salespersons?.length ?? 0),
    [salespersons]
  )


const filteredSalespersons = useMemo(() => {
  let list = [...salespersons]

  if (statusFilter === 'active') {
    list = list.filter(p => p.isActive)
  } else if (statusFilter === 'inactive') {
    list = list.filter(p => !p.isActive)
  }

  if (roleFilter !== 'all') {
    list = list.filter(p => p.role === roleFilter)
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase()
    list = list.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(searchTerm)
    )
  }

  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}, [salespersons, searchTerm, statusFilter, roleFilter])


  /* ================= IMAGE HANDLERS ================= */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image')
      return
    }

    try {
      setIsImageProcessing(true)
      toast.loading('Optimizing image…')

      const compressed = await compressImage(file, 700)

      setFormData(prev => ({
        ...prev,
        imageUrl: compressed,
      }))

      toast.success('Image ready')
    } catch {
      toast.error('Image processing failed')
    } finally {
      toast.dismiss()
      setIsImageProcessing(false)
      e.target.value = ''
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  /* ================= SPECIALIZATIONS ================= */

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => {
      const current = prev.specializations || []
      return {
        ...prev,
        specializations: current.includes(spec)
          ? current.filter(s => s !== spec)
          : [...current, spec],
      }
    })
  }

  /* ================= FORM HELPERS ================= */

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
      order: nextOrder,
    })

    setEditingId(null)
    setOriginalData(null)
    setShowForm(false)
    setIsImageProcessing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (isImageProcessing) {
    toast.error('Please wait for image processing')
    return
  }

  if (!formData.name || !formData.email || !formData.phone) {
    toast.error('Please fill all required fields')
    return
  }

  // ---------- PRE-VALIDATION (NO try) ----------
  let diff: Partial<FormData> | null = null

  if (editingId) {
    if (!originalData) {
      toast.error('Original data missing')
      return
    }

    diff = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          JSON.stringify(value) !==
          JSON.stringify(originalData[key as keyof FormData])
      )
    )

    if (Object.keys(diff).length === 0) {
      toast.error('No changes made')
      return
    }
  }

  setIsSaving(true)

  try {
    if (editingId && diff) {
      await updateSalesperson(editingId, diff)
      toast.success('Team member updated')
    } else {
      await addSalesperson({ ...formData, order: nextOrder })
      toast.success('Team member added')
    }

    resetForm()
  } catch (err) {
    console.error('[ADMIN_TEAM_SAVE]', err)
    toast.error('Save failed')
  } finally {
    setIsSaving(false)
  }
}

  const handleEdit = (person: Salesperson) => {
    const clean: FormData = {
      name: person.name,
      role: person.role,
      imageUrl: person.imageUrl || '',
      email: person.email,
      phone: person.phone,
      whatsapp: person.whatsapp || '',
      bio: person.bio || '',
      specializations: person.specializations || [],
      isActive: person.isActive,
      order: person.order || 0,
    }

    setFormData(clean)
    setOriginalData(clean)
    setEditingId(person.id || null)
    setShowForm(true)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-600">Loading team members…</p>
        </div>
      </div>
    )
  }



return (
  <>
    <div className="space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>

        {!showForm && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* ============ FORM ============ */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      role: e.target.value as FormData['role'],
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  value={formData.phone}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* BIO */}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e =>
                  setFormData(prev => ({ ...prev, bio: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg resize-none"
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {formData.imageUrl && (
                <div className="mt-3 relative h-20 w-20 rounded-lg overflow-hidden">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full h-6 w-6"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || isImageProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold"
              >
                {isSaving
                  ? 'Saving…'
                  : editingId
                  ? 'Update Member'
                  : 'Add Member'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


{/* ============ FILTERS & CONTROLS ============ */}
        {!showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={e =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="px-4 py-2.5 border rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Role */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border rounded-lg bg-white"
              >
                <option value="all">All Roles</option>
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* Count */}
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {filteredSalespersons.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {salespersons.length}
              </span>
            </p>
          </div>
        )}

        {/* ============ EMPTY STATE ============ */}
        {!showForm && filteredSalespersons.length === 0 && (
          <div className="text-center py-16 bg-white border rounded-xl">
            <p className="text-gray-600">No team members found</p>
          </div>
        )}

        {/* ============ LIST VIEW ============ */}
        {!showForm && viewMode === 'list' && filteredSalespersons.length > 0 && (
          <div className="space-y-3">
            {filteredSalespersons.map(person => (
              <div
                key={person.id}
                className="bg-white border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-blue-500 text-white flex items-center justify-center font-bold">
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    person.name[0]
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm text-gray-600">{person.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(person)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        action: person.isActive ? 'deactivate' : 'activate',
                        salespersonId: person.id || null,
                        salespersonName: person.name,
                      })
                    }
                    className="px-3 py-1.5 bg-gray-100 rounded-lg"
                  >
                    {person.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        action: 'delete',
                        salespersonId: person.id || null,
                        salespersonName: person.name,
                      })
                    }
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ GRID VIEW ============ */}
        {!showForm && viewMode === 'grid' && filteredSalespersons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSalespersons.map(person => (
              <div
                key={person.id}
                className="bg-white border rounded-xl overflow-hidden"
              >
                <div className="relative h-28 bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    person.name[0]
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm text-gray-600">{person.role}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(person)}
                      className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          action: 'delete',
                          salespersonId: person.id || null,
                          salespersonName: person.name,
                        })
                      }
                      className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ CONFIRM DIALOG ============ */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-lg">
              {confirmDialog.action === 'delete'
                ? 'Delete team member?'
                : confirmDialog.action === 'activate'
                ? 'Activate member?'
                : 'Deactivate member?'}
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    action: null,
                    salespersonId: null,
                    salespersonName: '',
                  })
                }
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!confirmDialog.salespersonId) return

                  if (confirmDialog.action === 'delete') {
                    await deleteSalesperson(confirmDialog.salespersonId)
                  } else {
                    await updateSalesperson(confirmDialog.salespersonId, {
                      isActive: confirmDialog.action === 'activate',
                    })
                  }

                  setConfirmDialog({
                    isOpen: false,
                    action: null,
                    salespersonId: null,
                    salespersonName: '',
                  })
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
)
}