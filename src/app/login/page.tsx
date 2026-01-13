'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

import { Laptop } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return toast.error('Account temporarily locked');

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearFailures();
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
      router.push('/');
    } catch {
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sky-50/60 flex min-h-[calc(100vh-64px)]">

      {/* LEFT – DESKTOP ILLUSTRATION */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <Laptop
          size={260}
          strokeWidth={1}
          className="text-sky-700 opacity-90"
        />
      </div>

      {/* RIGHT – LOGIN */}
      <div className="w-full lg:w-1/2 px-6 py-6 sm:py-10 flex flex-col">
        <div className="max-w-md mx-auto w-full">

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Sign in
          </h1>
          <p className="text-gray-600 mb-8">
            Use your registered credentials
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLocked}
                className="input-field"
              />
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

          <Link
            href="/reset-password"
            className="inline-block mt-4 text-sm text-blue-600 font-medium"
          >
            Forgot password?
          </Link>

          <div className="my-8 text-center text-sm text-gray-400">OR</div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="mt-8 text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600">
              Create one
            </Link>
          </p>
        </div>

        {/* COPYRIGHT */}
        <p className="mt-10 text-center text-xs text-gray-400">
          © MITC 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}