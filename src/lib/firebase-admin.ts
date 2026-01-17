import admin from 'firebase-admin';

const hasApp = admin.apps.length > 0;

if (!hasApp) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export default admin;