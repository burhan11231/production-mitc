// lib/firebase-rtdb.ts
import { getDatabase } from 'firebase/database'
import app from './firebase'

const rtdbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!

export const rtdb = getDatabase(app, rtdbUrl)