'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: any;
  read: boolean;
}

export default function LeadsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  const [storage, setStorage] = useState<{
    total: number;
    percent: number;
    blocked: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/contact/status', { cache: 'no-store' })
      .then(res => res.json())
      .then(setStorage)
      .catch(() => setStorage(null));
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLeads();
    }
  }, [user]);

  useEffect(() => {
    let filtered = leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(lead.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => 
        filterStatus === 'unread' ? !lead.read : lead.read
      );
    }

    setFilteredLeads(filtered);
  }, [searchTerm, leads, filterStatus]);

  const fetchLeads = async () => {
    try {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const leadsData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  const markAsRead = async (leadId: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { read: true });
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, read: true } : lead
        )
      );
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, read: true });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteDoc(doc(db, 'leads', leadId));

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        toast.error('Authentication expired. Please log in again.');
        return;
      }

      await fetch('/api/contact/decrement', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);

      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lead');
    }
  };

  const unreadCount = leads.filter(l => !l.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf9f7] to-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  // Filter configuration to map UI labels to state values
  const filterOptions = [
    { label: 'Inquiry Log', value: 'all' },
    { label: 'Pending Inquiries', value: 'unread' },
    { label: 'Reviewed Inquiries', value: 'read' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] via-[#fefefe] to-[#f5f3f0]">
      {/* Header */}
      <div className="relative border-b border-gray-200/50 bg-white/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {storage && (
              <div className="mb-8 w-full rounded-2xl border p-5 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">Leads Storage</h3>
                  <span className="text-sm text-gray-600">
                    {storage.total.toLocaleString()} / 50,000
                  </span>
                </div>

                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full ${
                      storage.percent >= 90 ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${storage.percent}%` }}
                  />
                </div>

                {storage.percent >= 90 && (
                  <p className="mt-3 text-sm text-red-600 font-medium">
                    Storage almost full. Delete old leads or upgrade Firebase.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 shadow-lg shadow-gray-900/5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 capitalize ${
                    filterStatus === option.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                  {option.value === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedLead ? (
          /* Detail View */
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-gray-200/50 shadow-xl shadow-gray-900/5">
            <button
              onClick={() => setSelectedLead(null)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-8 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>

            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{selectedLead.name}</h2>
                  <div className="flex items-center gap-3">
                    
                    <span className="text-sm text-gray-500">
                      {new Date(selectedLead.createdAt?.toDate?.() || selectedLead.createdAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Email</span>
                  </div>
                  <p className="text-gray-900 font-medium break-all">{selectedLead.email}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Phone</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedLead.phone || 'Not provided'}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Status</span>
                  </div>
                  <p className={`font-semibold ${selectedLead.read ? 'text-gray-600' : 'text-blue-600'}`}>
                    {selectedLead.read ? 'Reviewed' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Message</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              {/* Warning if no phone */}
              {!selectedLead.phone && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">No Phone Number Provided</p>
                      <p className="text-sm text-amber-800">This customer didn't provide a phone number. You can only contact them via email.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                {selectedLead.phone && (
                  <>
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Now
                    </a>
                  </>
                )}
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
                
                <button
                  onClick={() => deleteLead(selectedLead.id)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl transition-all duration-200 border border-red-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Lead
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {leadsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading leads...</p>
              </div>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    if (!lead.read) markAsRead(lead.id);
                    setSelectedLead(lead);
                  }}
                  className={`bg-white/60 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-gray-900/10 hover:-translate-y-1 ${
                    !lead.read 
                      ? 'border-blue-200 shadow-lg shadow-blue-600/10 bg-gradient-to-br from-blue-50/50 to-white/60' 
                      : 'border-gray-200/50 shadow-lg shadow-gray-900/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
                        {!lead.read && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{lead.email}</span>
                        </p>
                        {lead.phone && (
                          <p className="text-gray-600 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {lead.phone}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-700 line-clamp-2 mb-3">{lead.message}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 border border-gray-200/50 shadow-lg text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'New customer inquiries will appear here'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}