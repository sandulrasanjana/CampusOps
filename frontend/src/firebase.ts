import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  type User 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqTRVviOvTPzf1-76-ig5AR4s5fuXxHeA",
  authDomain: "campusops-26ed0.firebaseapp.com",
  projectId: "campusops-26ed0",
  storageBucket: "campusops-26ed0.firebasestorage.app",
  messagingSenderId: "294155487081",
  appId: "1:294155487081:web:d78b29b827e098c89b1ff8",
  measurementId: "G-VJ20QYMSWD"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Sign-In Error:", error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out Error:", error);
    throw error;
  }
};

export const formatAuthEmail = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  return `${trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, '')}@campusops.edu`;
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup
};

export type { User as FirebaseUser };
