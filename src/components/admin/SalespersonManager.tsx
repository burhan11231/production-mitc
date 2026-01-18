'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAdminSalespersons } from '@/hooks/useAdminSalespersons'
import { Salesperson } from '@/lib/firestore-models'
import { compressImage, validateImageFile } from '@/lib/image-utils'
import toast from 'react-hot-toast'


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

const ROLES = ['Sales', 'Support', 'Manager']

interface ConfirmDialogState {
  isOpen: boolean
  action: 'delete' | 'activate' | 'deactivate' | null
  salespersonId: string | null
  salespersonName: string
}

export default function AdminTeamManager() {
  const {
  salespersons: activeSalespersons,
  isLoading,
  addSalesperson,
  updateSalesperson,
  deleteSalesperson,
} = useAdminSalespersons()

  // ALL salespersons (both active and inactive) - need separate hook or query
  const [allSalespersons, setAllSalespersons] = useState<Salesperson[]>([])
  const [filteredSalespersons, setFilteredSalespersons] = useState<Salesperson[]>([])

  // UI States
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Confirmation Dialog
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

  

  // Fetch all salespersons (active + inactive)
  

  // Simulate fetching all salespersons - in real app, use separate hook
  useEffect(() => {
    setAllSalespersons(activeSalespersons)
  }, [activeSalespersons])

  // Apply filters and search
  useEffect(() => {
    let filtered = allSalespersons

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(sp => sp.isActive)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(sp => !sp.isActive)
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(sp => sp.role === roleFilter)
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(sp =>
        sp.name.toLowerCase().includes(term) ||
        sp.email.toLowerCase().includes(term) ||
        sp.phone.includes(searchTerm)
      )
    }

    // Sort by order
    filtered = filtered.sort((a, b) => (a.order || 0) - (b.order || 0))

    setFilteredSalespersons(filtered)
  }, [allSalespersons, searchTerm, statusFilter, roleFilter])

  /* ============ Image Upload ============ */
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

  /* ============ Specialization ============ */
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

  /* ============ Form Helpers ============ */
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
      order: allSalespersons.length,
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
        toast.success('Team member updated')
      } else {
        await addSalesperson(formData)
        toast.success('Team member added')
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ============ Delete Action ============ */
  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      action: 'delete',
      salespersonId: id,
      salespersonName: name,
    })
  }

  const confirmDelete = async () => {
    if (confirmDialog.salespersonId) {
      await deleteSalesperson(confirmDialog.salespersonId)
      setConfirmDialog({ isOpen: false, action: null, salespersonId: null, salespersonName: '' })
    }
  }

  /* ============ Status Toggle ============ */
  const handleStatusToggle = (person: Salesperson) => {
    const action = person.isActive ? 'deactivate' : 'activate'
    setConfirmDialog({
      isOpen: true,
      action: action as any,
      salespersonId: person.id || null,
      salespersonName: person.name,
    })
  }

  const confirmStatusChange = async () => {
    if (confirmDialog.salespersonId && confirmDialog.action) {
      const newStatus = confirmDialog.action === 'activate'
      await updateSalesperson(confirmDialog.salespersonId, {
        isActive: newStatus
      })
      setConfirmDialog({ isOpen: false, action: null, salespersonId: null, salespersonName: '' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">Loading team members…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* ============ HEADER ============ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Team Member
            </button>
          )}
        </div>

        {/* ============ FORM SECTION ============ */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? '✏️ Edit Team Member' : '➕ Add New Team Member'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">WhatsApp</label>
                  <input
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Display Order <span className="text-xs text-gray-400">(lower = first)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    min="0"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Areas of Expertise
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {AVAILABLE_SPECIALIZATIONS.map(spec => {
                    const isSelected = (formData.specializations || []).includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-3.5 py-2.5 text-sm rounded-lg border-2 font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {spec}
                      </button>
                    )
                  })}
                </div>
                {formData.specializations && formData.specializations.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2.5">
                    {formData.specializations.length} selected
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Professional Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Tell us about this team member..."
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Profile Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <svg className="h-6 w-6 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                    </div>
                  </label>
                  {formData.imageUrl && (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active on website
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white py-2.5 rounded-lg font-semibold transition-all"
                >
                  {isSaving ? 'Saving…' : editingId ? 'Update Member' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold transition-all"
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
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="all">All Roles</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredSalespersons.length}</span> of <span className="font-semibold text-gray-900">{allSalespersons.length}</span> members
              </p>
              {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setRoleFilter('all')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============ EMPTY STATE ============ */}
        {filteredSalespersons.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2H0v-2a9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first team member'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setRoleFilter('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ============ LIST VIEW ============ */}
        {viewMode === 'list' && filteredSalespersons.length > 0 && !showForm && (
          <div className="space-y-3">
            {filteredSalespersons.map(person => (
              <div
                key={person.id}
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-cyan-400">
                    {person.imageUrl ? (
                      <Image src={person.imageUrl} alt={person.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white font-bold text-lg">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-lg">{person.name}</p>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {person.role}
                      </span>
                      {!person.isActive && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{person.email}</p>
                    <p className="text-sm text-gray-600">{person.phone}</p>

                    {person.specializations && person.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {person.specializations.slice(0, 3).map(spec => (
                          <span key={spec} className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                            {spec}
                          </span>
                        ))}
                        {person.specializations.length > 3 && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">
                            +{person.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 self-end md:self-center">
                  <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                  <button
                    onClick={() => handleStatusToggle(person)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      person.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={person.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {person.isActive ? '✓ Active' : '○ Inactive'}
                  </button>

                  <button
                    onClick={() => handleEdit(person)}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClick(person.id || '', person.name)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ GRID VIEW ============ */}
        {viewMode === 'grid' && filteredSalespersons.length > 0 && !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredSalespersons.map(person => (
              <div
                key={person.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {/* Card Header */}
                <div className="relative h-32 bg-gradient-to-br from-blue-400 to-cyan-400">
                  {person.imageUrl ? (
                    <Image src={person.imageUrl} alt={person.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white font-bold text-4xl">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                      person.isActive ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {person.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-bold text-gray-900">{person.name}</p>
                    <p className="text-sm text-blue-600 font-medium">{person.role}</p>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{person.email}</p>
                    <p>{person.phone}</p>
                  </div>

                  {person.specializations && person.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {person.specializations.slice(0, 2).map(spec => (
                        <span key={spec} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                          {spec}
                        </span>
                      ))}
                      {person.specializations.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{person.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {person.bio && (
                    <p className="text-xs text-gray-600 italic line-clamp-2">\"{person.bio}\"</p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => handleEdit(person)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(person)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      person.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {person.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(person.id || '', person.name)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ CONFIRMATION DIALOG ============ */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              {confirmDialog.action === 'delete' && (
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
              {(confirmDialog.action === 'activate' || confirmDialog.action === 'deactivate') && (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">
                  {confirmDialog.action === 'delete' && 'Delete Team Member?'}
                  {confirmDialog.action === 'activate' && 'Activate Member?'}
                  {confirmDialog.action === 'deactivate' && 'Deactivate Member?'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {confirmDialog.action === 'delete' && `Remove ${confirmDialog.salespersonName} from the system?`}
                  {confirmDialog.action === 'activate' && `Activate ${confirmDialog.salespersonName}?`}
                  {confirmDialog.action === 'deactivate' && `Deactivate ${confirmDialog.salespersonName}?`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, action: null, salespersonId: null, salespersonName: '' })}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.action === 'delete' ? confirmDelete : confirmStatusChange}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-all ${
                  confirmDialog.action === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.action === 'delete' && 'Delete'}
                {confirmDialog.action === 'activate' && 'Activate'}
                {confirmDialog.action === 'deactivate' && 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      
    </>
  )
}