// lib/firebase-rtdb.ts
import { getDatabase } from 'firebase/database'
import app from './firebase'

export const rtdb = getDatabase(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
)