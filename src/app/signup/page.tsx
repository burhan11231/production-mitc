'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be 6+ characters');

    setIsLoading(true);
    try {
      // 1. Create Auth User
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Update Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // 3. Store in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: '',
        role: 'user', // Default role
        photoURL: '', // Initial empty photo
        createdAt: serverTimestamp(), // Use server time for accuracy
      });

      toast.success('Account created successfully!');
      router.push('/profile');
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Check if user already exists in Firestore so we don't overwrite 'role' or 'createdAt'
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // If NEW user, create document
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          phone: user.phoneNumber || '',
          role: 'user',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
        });
      } else {
        // If EXISTING user, just update their photo or name if needed (optional)
        await setDoc(userRef, {
          photoURL: user.photoURL || '',
          name: user.displayName || userSnap.data().name
        }, { merge: true });
      }

      toast.success('Signed in with Google!');
      router.push('/profile');
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-center text-gray-600 font-medium">Join MITC community</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          <div className="space-y-1">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition" required />
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50">
            {isLoading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
        </div>

        <button onClick={handleGoogleSignup} disabled={isLoading} className="w-full flex justify-center items-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
