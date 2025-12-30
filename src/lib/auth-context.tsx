'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData extends Partial<User> {
  uid: string;
  role: 'user' | 'admin';
  name: string;
  email: string;
  phone: string;
  photoURL: string | null;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const dbData = userDocSnap.data();
            setUser({
              ...authUser,
              uid: authUser.uid,
              role: dbData.role || 'user',
              name: dbData.name || authUser.displayName || 'User',
              email: dbData.email || authUser.email || '',
              phone: dbData.phone || '',
              photoURL: dbData.photoURL || authUser.photoURL || null,
            });
          } else {
            // Fallback if doc hasn't been created yet
            setUser({
              uid: authUser.uid,
              role: 'user',
              name: authUser.displayName || 'User',
              email: authUser.email || '',
              phone: '',
              photoURL: authUser.photoURL || null,
            } as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
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
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
