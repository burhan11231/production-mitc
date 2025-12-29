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

function isValidAuthDomain(domain?: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  // Accept official Firebase domains, localhost (with optional port), or an explicit hostname equal to current host
  if (domain.endsWith('.firebaseapp.com') || domain.endsWith('.web.app')) return true;
  if (/^localhost(:\d+)?$/.test(domain)) return true;
  // If running in browser allow using the current hostname as authDomain
  if (isBrowser && domain === window.location.hostname) return true;
  return false;
}

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

      // Validate the authDomain before creating the Auth instance.
      const authDomain = firebaseConfig.authDomain;
      const authDomainValid = isValidAuthDomain(authDomain);

      if (!authDomainValid) {
        console.error(
          'Invalid or missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomain,
          '\nFirebase Auth will NOT be initialized to avoid creating an iframe with an invalid domain.',
          '\nSet NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to your-project.firebaseapp.com or your-project.web.app (or add the domain in Firebase Console -> Authentication -> Authorized domains).'
        );
        // Don't call getAuth(firebaseApp) if the domain is invalid.
        firebaseAuth = null;
      } else {
        firebaseAuth = getAuth(firebaseApp);
      }

      firebaseDb = getFirestore(firebaseApp);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }
}

// Helper function to get db with runtime error (only in browser)
function getDb(): Firestore {
  if (!isBrowser) {
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
    throw new Error(
      'Firebase Auth cannot be accessed during server-side rendering or static generation.'
    );
  }

  if (!firebaseAuth) {
    throw new Error(
      'Firebase Auth is not initialized. This may be because NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing or invalid. ' +
      'Set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to the correct Firebase auth domain (e.g. your-project.firebaseapp.com or your-project.web.app) ' +
      'and ensure the domain is added to Firebase Console -> Authentication -> Authorized domains.'
    );
  }
  return firebaseAuth;
}

// Export safe proxies that only work in browser
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!isBrowser) {
      return undefined;
    }
    return getDb()[prop as keyof Firestore];
  },
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!isBrowser) {
      return undefined;
    }
    // This will throw with a clear message if auth was not initialized due to invalid authDomain
    return getAuthInstance()[prop as keyof Auth];
  },
});

// Export app directly (can be null during SSR)
export const app = firebaseApp;

// Export the raw instances for advanced use cases
export { firebaseApp, firebaseAuth, firebaseDb };

export default firebaseApp;
