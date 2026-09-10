import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser
} from 'firebase/auth'

// Firebase Configuration using Vite Environment Variables with safe fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCampusOpsDemoKeyForTesting12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campusops-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campusops-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campusops-auth.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "83912049102",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:83912049102:web:91023a8b7c6d5e4f"
}

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

/**
 * Format user_id or email into valid email format
 */
export const formatAuthEmail = (input: string): string => {
  const trimmed = input.trim()
  if (trimmed.includes('@')) {
    return trimmed
  }
  // If user inputs ID like "INC-1042" or "sandul", convert to email format
  return `${trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, '')}@campusops.edu`
}

/**
 * Firebase Authentication Helper Functions
 */
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup
}
export type { FirebaseUser }
