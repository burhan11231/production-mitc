'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ---------------- FORM SIGN UP ---------------- */

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = cred.user;

      // Auth display name only
      await updateProfile(user, {
        displayName: form.name,
      });

      // Firestore profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: 'user',
        photoURL: '', // first-letter avatar handled in UI
        authProviders: ['password'],
        createdAt: serverTimestamp(),
      });

      toast.success('Account created successfully');
      router.push('/profile');
    } catch (error: any) {
      const code = error?.code;

      if (code === 'auth/email-already-in-use') {
        toast.error('Account already exists. Please log in.');
      } else if (code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE SIGN UP ---------------- */

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          phone: '',
          role: 'user',
          photoURL: user.photoURL || '',
          authProviders: ['google.com'],
          createdAt: serverTimestamp(),
        });
      }

      toast.success('Signed up with Google');
      router.push('/profile');
    } catch (error: any) {
      const code = error?.code;

      if (code === 'auth/account-exists-with-different-credential') {
        toast.error('Email already exists. Login and connect Google from profile.');
      } else if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups.');
      } else if (code === 'auth/popup-closed-by-user') {
        toast('Google sign-up cancelled');
      } else {
        toast.error('Google sign-up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-600 mb-6">
          Join MITC community
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="name"
            placeholder="Username"
            value={form.name}
            onChange={onChange}
            required
            className="input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            className="input"
          />
          <input
            name="phone"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={onChange}
            className="input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="input"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={onChange}
            required
            className="input"
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-400">
          OR
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full border rounded-xl py-3 font-semibold hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}