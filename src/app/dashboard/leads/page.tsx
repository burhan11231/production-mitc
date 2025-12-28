'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
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
    const filtered = leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

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
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Leads Management</h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{leads.length}</div>
            <p className="text-gray-600 text-sm">Total Messages</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6 mb-8">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Leads Grid or Detail View */}
        {selectedLead ? (
          /* Detail View */
          <div className="card p-8 mb-8">
            <button
              onClick={() => setSelectedLead(null)}
              className="text-primary-600 hover:text-primary-700 font-medium mb-6"
            >
              ← Back to List
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedLead.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedLead.createdAt?.toDate?.() || selectedLead.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className={selectedLead.read ? 'text-gray-600' : 'text-primary-600 font-medium'}>
                      {selectedLead.read ? 'Read' : 'Unread'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              {!selectedLead.phone && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Note:</strong> No phone number provided. Ask customer to update their profile.
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 flex gap-4">
                {selectedLead.phone && (
                  <>
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      💬 WhatsApp
                    </a>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="btn-primary"
                    >
                      📁 Call
                    </a>
                  </>
                )}
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="btn-outline"
                >
                  ✉️ Email
                </a>
                {!selectedLead.read && (
                  <button
                    onClick={() => markAsRead(selectedLead.id)}
                    className="btn-outline"
                  >
                    ✓ Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {leadsLoading ? (
              <div className="flex justify-center py-12">
                <div className="spinner" />
              </div>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    markAsRead(lead.id);
                    setSelectedLead(lead);
                  }}
                  className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                    !lead.read ? 'bg-blue-50 border-l-4 border-l-primary-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{lead.name}</h3>
                      <p className="text-gray-600 text-sm">{lead.email}</p>
                      <p className="text-gray-700 mt-2 line-clamp-2">{lead.message}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {!lead.read && (
                        <span className="inline-block bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-12 text-center">
                <p className="text-gray-600">No leads found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
