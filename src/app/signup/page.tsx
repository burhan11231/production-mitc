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

import { Laptop } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

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

  const currentYear = new Date().getFullYear();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ---------------- EMAIL SIGNUP ---------------- */

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

      await updateProfile(user, {
        displayName: form.name,
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: 'user',
        photoURL: '',
        authProviders: ['password'],
        createdAt: serverTimestamp(),
      });

      toast.success('Account created successfully');
      router.push('/profile');
    } catch (error: any) {
      const code = error?.code;

      if (code === 'auth/email-already-in-use') {
        toast.error('Account already exists. Please sign in.');
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

  /* ---------------- GOOGLE SIGNUP ---------------- */

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

  return (
    <div className="relative flex bg-sky-50/60 min-h-[calc(100vh-64px)]">

      {/* LEFT – DESKTOP ILLUSTRATION */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <Laptop
          size={260}
          strokeWidth={1}
          className="text-sky-700 opacity-90"
        />
      </div>

      {/* RIGHT – SIGNUP */}
      <div className="w-full lg:w-1/2 px-6 py-6 sm:py-10">
        <div className="max-w-md mx-auto">

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-600 mb-8">
            Join MITC community
          </p>

          <form onSubmit={handleSignup} className="space-y-4">

            <div>
              <label className="field-label">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="example@gmail.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Phone (optional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Phone number"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black transition disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <div className="my-8 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="mt-8 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600">
              Sign in
            </Link>
          </p>

        </div>
      </div>

      {/* AUTH FOOTER – SAFE AREA AWARE */}
      <div
        className="absolute left-0 right-0 text-center text-xs text-gray-400"
        style={{
          bottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <span>© MITC {currentYear}</span>
          <span className="opacity-50">·</span>
          <Link href="/privacy" className="hover:text-gray-600">
            Privacy
          </Link>
          <span className="opacity-50">·</span>
          <Link href="/terms" className="hover:text-gray-600">
            Terms
          </Link>
        </div>
      </div>

    </div>
  );
}