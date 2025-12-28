'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData extends User {
  role?: 'user' | 'admin';
  name?: string;
  phone?: string;
  // photoURL must match Firebase User type: string | null (not string | undefined)
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
          const userData = userDocSnap.data();
          
          setUser({
            ...authUser,
            role: userData?.role || 'user',
            name: userData?.name || authUser.displayName || '',
            phone: userData?.phone || '',
            photoURL: userData?.photoURL || authUser.photoURL || null,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(authUser as UserData);
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
