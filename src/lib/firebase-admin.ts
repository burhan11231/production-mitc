import admin from 'firebase-admin';

/* ------------------------------------
   SAFE SINGLETON INITIALIZER
------------------------------------ */
export function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  }

  return admin;
}

/* ------------------------------------
   CONVENIENCE EXPORTS
------------------------------------ */
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;