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
   LAZY ACCESSORS (CRITICAL)
------------------------------------ */
export function getAdminDb() {
  initAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initAdmin();
  return admin.auth();
}

export function getAdminRtdb() {
  initAdmin();
  return admin.database();
}

export default admin;