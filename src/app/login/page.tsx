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
    <div className="min-h-screen bg-sky-50/60 flex">

      {/* LEFT SECTION – PROFESSIONAL INFO */}
      <div className="hidden lg:flex w-1/2 items-center justify-center px-16">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            MITC Internal Access
          </h1>
          <p className="text-gray-600 mb-10">
            Secure login for authorised staff. Access tools based on your role
            — Sales, Manager, or Support.
          </p>

          <ul className="space-y-4 text-gray-700">
            <li>• Role-based access control</li>
            <li>• Secure authentication</li>
            <li>• Staff-managed operations</li>
            <li>• Centralised admin control</li>
          </ul>
        </div>
      </div>

      {/* RIGHT SECTION – LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in
          </h2>
          <p className="text-gray-600 mb-10">
            Use your registered credentials
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-6">

            {/* EMAIL */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="peer input-field"
              />
              <label className="floating-label">Email address</label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLocked}
                className="peer input-field"
              />
              <label className="floating-label">Password</label>
            </div>

            {isLocked && (
              <p className="text-sm text-red-600">
                Account locked for 5 minutes
              </p>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black transition disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => setShowForgot(!showForgot)}
            className="mt-4 text-sm text-blue-600 font-medium"
          >
            Forgot password?
          </button>

          {showForgot && (
            <div className="mt-4">
              <button
                onClick={handleResetPassword}
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Send reset email
              </button>
            </div>
          )}

          <div className="my-8 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition"
          >
            Continue with Google
          </button>

          <p className="mt-8 text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}