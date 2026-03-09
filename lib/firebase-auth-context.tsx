import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import { FirebaseUser } from './firebase-auth';

interface AuthContextType {
  user: User | null;
  userData: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);

          // Subscribe to user's Firestore document
          const userDocRef = doc(db, 'users', authUser.uid);
          const unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setUserData(docSnap.data() as FirebaseUser);
              }
              setLoading(false);
            },
            (err) => {
              console.error('Error fetching user data:', err);
              setError(err.message);
              setLoading(false);
            }
          );

          // Return cleanup function for Firestore listener
          return () => unsubscribeFirestore();
        } else {
          setUser(null);
          setUserData(null);
          setLoading(false);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
      }
    });

    // Cleanup auth listener
    return () => unsubscribeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access Firebase auth context
 */
export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
