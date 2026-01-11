'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

/* ================= TYPES ================= */

interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: any;
}

/* ================= SAFE HELPERS ================= */

const safeString = (v: unknown, fallback = '') =>
  typeof v === 'string' ? v : fallback;

const safeDate = (v: any) => {
  try {
    if (!v) return '—';
    if (v?.toDate) return v.toDate().toLocaleDateString();
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  } catch {
    return '—';
  }
};

/* ================= COMPONENT ================= */

export default function UsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /* ---------- ADMIN GUARD ---------- */

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  /* ---------- FETCH USERS ---------- */

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));

      const usersData: User[] = snap.docs.map((doc) => {
        const data = doc.data();

        return {
          uid: doc.id,
          name: safeString(data.name, 'Unknown'),
          email: safeString(data.email),
          phone: safeString(data.phone),
          role: data.role === 'admin' ? 'admin' : 'user',
          createdAt: data.createdAt ?? null,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  /* ---------- SEARCH FILTER ---------- */

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = users.filter((u) => {
      const name = safeString(u.name).toLowerCase();
      const email = safeString(u.email).toLowerCase();
      return name.includes(term) || email.includes(term);
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  /* ---------- STATS ---------- */

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    withPhone: users.filter((u) => !!u.phone).length,
  };

  /* ---------- LOADING / GUARD ---------- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">Total Users</div>
            <div className="text-4xl font-bold text-primary-600 mt-2">
              {stats.total}
            </div>
          </div>
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">Admins</div>
            <div className="text-4xl font-bold text-blue-600 mt-2">
              {stats.admins}
            </div>
          </div>
          <div className="card p-8">
            <div className="text-gray-600 text-sm font-medium">With Phone</div>
            <div className="text-4xl font-bold text-green-600 mt-2">
              {stats.withPhone}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Users</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.uid}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        {u.phone ? (
                          <span className="text-green-600">{u.phone}</span>
                        ) : (
                          <span className="text-yellow-600 text-xs">
                            Not provided
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {safeDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {u.phone ? (
                          <div className="flex gap-3">
                            <a
                              href={`https://wa.me/${u.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              💬
                            </a>
                            <a
                              href={`tel:${u.phone}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              📞
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-600"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            📊 User Management Information
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Total users registered</li>
            <li>✓ Admin users can access the dashboard</li>
            <li>✓ Old user records are safely handled</li>
            <li>✓ WhatsApp and Call shortcuts enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}