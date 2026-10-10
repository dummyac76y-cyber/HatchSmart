import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, microsoftProvider, isDemoMode } from './firebase';

interface AuthContextType {
  user: User | DemoUser | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  isDemoUser: boolean;
}

const demoUser: DemoUser = {
  uid: 'demo-user-001',
  email: 'researcher@smarthatch.edu',
  displayName: 'Dr. Research',
  photoURL: null,
  emailVerified: true,
  isDemoUser: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo] = useState(isDemoMode);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, auto-login with demo user
      setUser(demoUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    if (isDemoMode) {
      // Demo mode: accept any credentials
      if (email && password.length >= 6) {
        setUser({ ...demoUser, email });
        return;
      }
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    if (isDemoMode) {
      setUser({ ...demoUser, email, displayName });
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Registration failed. Please try again.');
      }
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    if (isDemoMode) {
      setUser({ ...demoUser, displayName: 'Google User', email: 'user@gmail.com' });
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add it to Firebase console.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
      throw err;
    }
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    setError(null);
    if (isDemoMode) {
      setUser({ ...demoUser, displayName: 'Microsoft User', email: 'user@outlook.com' });
      return;
    }
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else {
        setError('Microsoft sign-in failed. Please try again.');
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    if (isDemoMode) {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (err: any) {
      setError('Logout failed. Please try again.');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    if (isDemoMode) {
      // Demo mode: simulate success
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
      throw err;
    }
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    setError(null);
    if (isDemoMode) {
      setUser((prev) => prev ? { ...prev, displayName: name } : null);
      return;
    }
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
        setUser({ ...auth.currentUser, displayName: name });
      } catch (err: any) {
        setError('Failed to update profile.');
        throw err;
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        login,
        register,
        loginWithGoogle,
        loginWithMicrosoft,
        logout,
        resetPassword,
        updateDisplayName,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
