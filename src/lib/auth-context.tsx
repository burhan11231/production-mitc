'use client';

import {
  onAuthStateChanged,
  signOut,
  User,
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, 'users', authUser.uid));

      if (snap.exists()) {
        const data = snap.data();
        setUser({
          uid: authUser.uid,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role || 'user',
          photoURL: data.photoURL || authUser.photoURL || null,
          providers: authUser.providerData.map(p => p.providerId),
        });
      } else {
        // Safety fallback
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

      setIsLoading(false);
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}