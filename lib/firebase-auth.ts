import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { auth, db } from './firebase-config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Firestore user document schema
 */
export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  // Wealth data (synced from local storage)
  bankAccounts?: any[];
  loans?: any[];
  holdings?: any[];
  insurancePolicies?: any[];
  creditScore?: any;
}

/**
 * Sign up with email and password
 * Creates a new Firebase Auth user and initializes their Firestore document
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: User; success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!email || !password || !displayName) {
      throw new Error('Email, password, and display name are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, {
      displayName,
    });

    // Create Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    const userData: FirebaseUser = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      photoURL: user.photoURL || undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      bankAccounts: [],
      loans: [],
      holdings: [],
      insurancePolicies: [],
      creditScore: {
        score: 1500,
        paymentHistory: 0,
        amountsOwed: 0,
        lengthOfCredit: 0,
        creditMix: 0,
        newCredit: 0,
        lastUpdated: new Date().toISOString(),
      },
    };

    await setDoc(userDocRef, userData);

    return { user, success: true };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = 'Sign up failed';

    if (authError.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already in use';
    } else if (authError.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (authError.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (authError.message) {
      errorMessage = authError.message;
    }

    return { user: null as any, success: false, error: errorMessage };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; success: boolean; error?: string }> {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, success: true };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = 'Sign in failed';

    if (authError.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    } else if (authError.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (authError.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (authError.code === 'auth/user-disabled') {
      errorMessage = 'User account has been disabled';
    } else if (authError.message) {
      errorMessage = authError.message;
    }

    return { user: null, success: false, error: errorMessage };
  }
}

/**
 * Sign out the current user
 */
export async function logOut(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message || 'Sign out failed' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = 'Password reset failed';

    if (authError.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    } else if (authError.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (authError.message) {
      errorMessage = authError.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get the current user's Firestore document
 */
export async function getUserData(uid: string): Promise<FirebaseUser | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as FirebaseUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Update user's wealth data in Firestore
 */
export async function updateUserWealthData(uid: string, data: Partial<FirebaseUser>): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message || 'Update failed' };
  }
}
