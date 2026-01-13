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

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  const keyFail = `login_fail_${email}`;
  const keyLock = `login_lock_${email}`;
  const isLocked = Boolean(lockedUntil && Date.now() < lockedUntil);

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
      toast.error('Too many failed attempts. Locked for 5 minutes.');
    }
  };

  const clearFailures = () => {
    localStorage.removeItem(keyFail);
    localStorage.removeItem(keyLock);
    setLockedUntil(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return toast.error('Account temporarily locked');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearFailures();
      toast.success('Welcome back');
      router.push('/');
    } catch {
      recordFailure();
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Logged in with Google');
      router.push('/');
    } catch {
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error('Enter email first');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Reset email sent');
      setShowForgot(false);
    } catch {
      toast.error('Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      
      {/* LEFT PANEL – DESKTOP ONLY */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        <div className="relative z-10 p-16 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">Secure Store Access</h2>
          <p className="text-gray-300 max-w-md mb-10">
            Manage inventory, analytics, and customers securely from one dashboard.
          </p>

          {/* Modern Lock Animation */}
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border border-gray-600 animate-pulse" />
            <div className="absolute inset-6 rounded-full bg-gray-800 flex items-center justify-center shadow-2xl">
              <div className="w-10 h-10 border-2 border-white rounded-md relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-4 border-2 border-white rounded-t-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign In</h1>
          <p className="text-gray-600 mb-8">Access your MITC account</p>

          <form onSubmit={handleEmailLogin} className="space-y-6">

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="peer input-modern"
              />
              <label className="label-modern">Email address</label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLocked}
                className="peer input-modern"
              />
              <label className="label-modern">Password</label>
            </div>

            {isLocked && (
              <p className="text-sm text-red-600 text-center">
                Account locked for 5 minutes
              </p>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => setShowForgot(!showForgot)}
            className="mt-4 text-sm text-blue-600 font-medium w-full text-center"
          >
            Forgot password?
          </button>

          {showForgot && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <button
                onClick={handleResetPassword}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
              >
                Send reset email
              </button>
            </div>
          )}

          <div className="my-6 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-bold text-blue-600">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}