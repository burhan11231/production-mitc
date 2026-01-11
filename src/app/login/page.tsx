'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

/* ---------------- CONFIG ---------------- */

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  /* ---------------- RATE LIMIT HELPERS ---------------- */

  const keyFail = `login_fail_${email}`;
  const keyLock = `login_lock_${email}`;

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  useEffect(() => {
    if (!email) return;
    const lock = localStorage.getItem(keyLock);
    if (lock) setLockedUntil(Number(lock));
  }, [email]);

  const recordFailure = () => {
    const count = Number(localStorage.getItem(keyFail) || 0) + 1;
    localStorage.setItem(keyFail, String(count));

    if (count >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCK_TIME_MS;
      localStorage.setItem(keyLock, String(until));
      setLockedUntil(until);
      toast.error('Too many failed attempts. Account locked for 5 minutes.');
    }
  };

  const clearFailures = () => {
    localStorage.removeItem(keyFail);
    localStorage.removeItem(keyLock);
    setLockedUntil(null);
  };

  /* ---------------- EMAIL LOGIN ---------------- */

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      const mins = Math.ceil((lockedUntil! - Date.now()) / 60000);
      return toast.error(`Account locked. Try again in ${mins} min`);
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearFailures();
      toast.success('Welcome back');
      router.push('/');
    } catch (error: any) {
      const code = error?.code;

      recordFailure();

      if (code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (code === 'auth/too-many-requests') {
        toast.error('Too many requests. Try again later');
      } else if (code === 'auth/user-disabled') {
        toast.error('This account has been disabled');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google');
      router.push('/');
    } catch (error: any) {
      const code = error?.code;

      if (code === 'auth/account-exists-with-different-credential') {
        toast.error(
          'Email already registered with password. Login using email, then connect Google from profile.'
        );
      } else if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups.');
      } else if (code === 'auth/popup-closed-by-user') {
        toast('Google login cancelled');
      } else {
        toast.error('Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PASSWORD RESET ---------------- */

  const handleResetPassword = async () => {
    if (!email) {
      return toast.error('Enter your email first');
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
      setShowForgot(false);
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Sign In
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Access your MITC account
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLocked}
            className="input"
          />

          {isLocked && (
            <p className="text-sm text-red-600 font-medium text-center">
              Account locked for 5 minutes due to failed attempts
            </p>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setShowForgot(!showForgot)}
          className="mt-3 text-sm text-blue-600 font-medium w-full text-center"
        >
          Forgot password?
        </button>

        {showForgot && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-2">
              Reset password via email
            </p>
            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
            >
              Send Reset Email
            </button>
          </div>
        )}

        <div className="my-6 text-center text-sm text-gray-400">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border rounded-xl py-3 font-semibold hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-blue-600">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}