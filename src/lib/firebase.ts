import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase (only in browser)
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

if (isBrowser) {
  if (!firebaseConfig.apiKey) {
    console.warn(
      'Firebase config missing. Please set NEXT_PUBLIC_FIREBASE_* environment variables.'
    );
  } else {
    try {
      // Initialize Firebase app (only once)
      if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        firebaseApp = getApps()[0];
      }

      firebaseAuth = getAuth(firebaseApp);
      firebaseDb = getFirestore(firebaseApp);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }
}

// Helper function to get db with runtime error (only in browser)
function getDb(): Firestore {
  if (!isBrowser) {
    // During SSR/SSG, return a dummy object to prevent crashes
    // This should never be called during static generation
    throw new Error(
      'Firebase Firestore cannot be accessed during server-side rendering or static generation.'
    );
  }
  
  if (!firebaseDb) {
    throw new Error(
      'Firebase is not initialized. Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set.'
    );
  }
  return firebaseDb;
}

// Helper function to get auth with runtime error (only in browser)
function getAuthInstance(): Auth {
  if (!isBrowser) {
    // During SSR/SSG, return a dummy object to prevent crashes
    throw new Error(
      'Firebase Auth cannot be accessed during server-side rendering or static generation.'
    );
  }
  
  if (!firebaseAuth) {
    throw new Error(
      'Firebase Auth is not initialized. Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set.'
    );
  }
  return firebaseAuth;
}

// Export safe proxies that only work in browser
// During SSR/SSG, accessing these will be gracefully skipped
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    // During SSR, just return undefined for any property access
    // This prevents errors during static generation
    if (!isBrowser) {
      return undefined;
    }
    return getDb()[prop as keyof Firestore];
  },
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    // During SSR, just return undefined for any property access
    if (!isBrowser) {
      return undefined;
    }
    return getAuthInstance()[prop as keyof Auth];
  },
});

// Export app directly (can be null during SSR)
export const app = firebaseApp;

// Export the raw instances for advanced use cases
export { firebaseApp, firebaseAuth, firebaseDb };

export default firebaseApp;
