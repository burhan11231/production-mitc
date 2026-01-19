'use client';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
} from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth, db } from '@/lib/firebase';

/* ---------------- TYPES ---------------- */

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  photoURL: string | null;
  providers: string[];
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------- PROVIDER ---------------- */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', authUser.uid));

        if (snap.exists()) {
          const data = snap.data();

          setUser({
            uid: authUser.uid,
            name: data.name || authUser.displayName || 'User',
            email: data.email || authUser.email || '',
            phone: data.phone || '',
            role: data.role === 'admin' ? 'admin' : 'user',
            photoURL: data.photoURL || authUser.photoURL || null,
            providers: authUser.providerData.map(p => p.providerId),
          });
        } else {
          // Firestore doc missing → safe fallback
          setUser({
            uid: authUser.uid,
            name: authUser.displayName || 'User',
            email: authUser.email || '',
            phone: '',
            role: 'user',
            photoURL: authUser.photoURL || null,
            providers: authUser.providerData.map(p => p.providerId),
          });
        }
      } catch (err) {
        console.error('[AUTH_LOAD_ERROR]', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}