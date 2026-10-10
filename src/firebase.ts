import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// Firebase configuration
// Replace these values with your actual Firebase project configuration
// These can also be set via environment variables (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('email');
microsoftProvider.addScope('profile');

// Initialize Firestore
export const db = getFirestore(app);

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return (
    firebaseConfig.apiKey !== 'demo-api-key' &&
    firebaseConfig.projectId !== 'demo-project'
  );
};

// Development mode flag
export const isDemoMode = !isFirebaseConfigured();

// Connect to emulators in development (if running)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    console.warn('Could not connect to Firebase emulators:', e);
  }
}

export default app;
