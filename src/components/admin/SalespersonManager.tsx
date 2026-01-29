'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

import { useAdminSalespersons } from '@/hooks/useAdminSalespersons'
import { Salesperson } from '@/lib/firestore-models'
import { compressImage, validateImageFile } from '@/lib/image-utils'

/* ================= TYPES ================= */

interface FormData extends Omit<Salesperson, 'id' | 'createdAt' | 'updatedAt'> {}

const ROLES = ['Sales', 'Support', 'Manager', 'Technician'] as const

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

  // Form State
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

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [tagInput, setTagInput] = useState('')

  /* ================= DERIVED ================= */

  // Calculate next order for new items only
  const nextOrder = useMemo(
    () => (salespersons?.length ?? 0),
    [salespersons]
  )

  const filteredSalespersons = useMemo(() => {
    let list = [...salespersons]

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter(p => p.isActive)
    } else if (statusFilter === 'inactive') {
      list = list.filter(p => !p.isActive)
    }

    // 2. Role Filter
    if (roleFilter !== 'all') {
      list = list.filter(p => p.role === roleFilter)
    }

    // 3. Search Filter (Normalized Phone Search)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const cleanSearch = searchTerm.replace(/\D/g, '') // Remove non-digits for phone search
      
      list = list.filter(p => {
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesEmail = p.email.toLowerCase().includes(q)
        // Check phone only if user typed digits, otherwise ignore
        const matchesPhone = cleanSearch 
          ? p.phone.replace(/\D/g, '').includes(cleanSearch) 
          : false
        
        return matchesName || matchesEmail || matchesPhone
      })
    }

    // 4. Sort by Order
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [salespersons, searchTerm, statusFilter, roleFilter])

  /* ================= HANDLERS ================= */

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
      
      setFormData(prev => ({ ...prev, imageUrl: compressed }))
      toast.success('Image ready')
    } catch {
      toast.error('Image processing failed')
    } finally {
      toast.dismiss()
      setIsImageProcessing(false)
      // Reset input so same file can be selected again if needed
      e.target.value = ''
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

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

    // ✅ FIX: Restore scroll position on cancel
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    if (isImageProcessing) {
      toast.error('Please wait for image processing')
      return
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields')
      return
    }

    // --- DIFF CALCULATION ---
    let diff: Partial<FormData> | null = null

    if (editingId) {
      if (!originalData) {
        toast.error('Original data missing')
        return
      }

      // Calculate diff, explicitly excluding 'order'
      diff = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          if (key === 'order') return false 
          return JSON.stringify(value) !== JSON.stringify(originalData[key as keyof FormData])
        })
      )

      if (Object.keys(diff).length === 0) {
        toast.error('No changes made')
        return
      }
    }

    setIsSaving(true)

    try {
      if (editingId && diff) {
        // ✅ CRITICAL FIX: Explicitly enforce original order
        await updateSalesperson(editingId, {
          ...diff,
          order: originalData!.order, 
        })
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

  const addTag = () => {
  const value = tagInput.trim()
  if (!value) return

  if (formData.specializations.length >= 10) {
    toast.error('Maximum 10 specializations allowed')
    return
  }

  // 🔒 NORMALIZED DUPLICATE CHECK (ADD HERE)
  const normalized = value.toLowerCase()

  if (
    formData.specializations
      .map(t => t.toLowerCase())
      .includes(normalized)
  ) {
    toast.error('Tag already added')
    return
  }

  setFormData(prev => ({
    ...prev,
    specializations: [...prev.specializations, value],
  }))

  setTagInput('')
}


const removeTag = (tag: string) => {
  setFormData(prev => ({
    ...prev,
    specializations: prev.specializations.filter(t => t !== tag),
  }))
}


  /* ================= RENDER ================= */

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
    <div className="pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>

        {!showForm && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm active:scale-95 transition-transform"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* ============ FORM SECTION ============ */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            {/* Mobile Close Button */}
            <button 
              onClick={resetForm} 
              className="md:hidden text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
            {/* BASIC INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Name *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as FormData['role'] }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* BIO */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Short description..."
              />
            </div>


{/* SPECIALIZATIONS / TAGS */}
<div>
  <label className="block text-sm font-medium mb-1.5 text-gray-700">
    Specializations (max 10)
  </label>

  <div className="flex gap-2">
    <input
      value={tagInput}
      onChange={e => setTagInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          addTag()
        }
      }}
      placeholder="e.g. Laptop Repair, MacBooks"
      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <button
      type="button"
      onClick={addTag}
      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
    >
      Add
    </button>
  </div>

  {/* Tags */}
  {formData.specializations.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {formData.specializations.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-blue-700 hover:text-red-600"
          >
            &times;
          </button>
        </span>
      ))}
    </div>
  )}

  <p className="mt-1 text-xs text-gray-500">
    Used to show expertise on public profile
  </p>
</div>

            

            {/* IMAGE UPLOAD */}
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <label className="block text-sm font-medium mb-3 text-gray-700">Profile Image</label>
              
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                      className="absolute top-0 right-0 bg-red-600 text-white p-1 shadow-md hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-gray-500">JPG, PNG up to 5MB.</p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:flex-1 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSaving || isImageProcessing}
                className="w-full sm:flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold shadow-md transition-colors"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ FILTERS & VIEW CONTROL ============ */}
      {!showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search name, email, or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 pt-2">
            Showing <span className="font-bold text-gray-900">{filteredSalespersons.length}</span> results
          </div>
        </div>
      )}

      {/* ============ EMPTY STATE ============ */}
      {!showForm && filteredSalespersons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <p className="text-gray-600 font-medium">No team members found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new member.</p>
        </div>
      )}

      {/* ============ LIST VIEW ============ */}
      {!showForm && viewMode === 'list' && filteredSalespersons.length > 0 && (
        <div className="space-y-3">
          {filteredSalespersons.map(person => (
            <div
              key={person.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
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
                
                <div className="flex-1 sm:min-w-[200px]">
                  <p className="font-semibold text-gray-900">{person.name}</p>
                  <p className="text-sm text-gray-500">{person.role} • {person.email}</p>
                </div>
              </div>

              {/* Badges/Status for Mobile */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  person.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {person.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0">
                <button
                  onClick={() => handleEdit(person)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
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
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
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
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalespersons.map(person => (
            <div
              key={person.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-32 bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
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
                
                <div className="absolute top-3 right-3">
                   <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${
                    person.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {person.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{person.name}</h3>
                <p className="text-sm font-medium text-blue-600 mb-4">{person.role}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>{person.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEdit(person)}
                    className="py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
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
                    className="py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ CONFIRM DIALOG ============ */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {confirmDialog.action === 'delete' ? 'Delete Member' : 'Update Status'}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {confirmDialog.action} <span className="font-semibold text-gray-900">"{confirmDialog.salespersonName}"</span>?
                {confirmDialog.action === 'delete' && ' This action cannot be undone.'}
              </p>

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
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
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
                  className={`flex-1 py-3 text-white rounded-lg font-semibold shadow-md transition-colors ${
                    confirmDialog.action === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
