import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * Firebase configuration
 * These are PUBLIC values (not secret keys) - safe to hardcode
 * Get from Firebase Console → Project Settings → Your apps → Web app
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDf0UUuDJ9yDk2g3SvmHhFEEVCRvdJjKp4',
  authDomain: 'wealth-wellness-app.firebaseapp.com',
  projectId: 'wealth-wellness-app',
  storageBucket: 'wealth-wellness-app.firebasestorage.app',
  messagingSenderId: '159659069171',
  appId: '1:159659069171:web:ae2a1e90f4ab52ad1d7186',
};

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase config: ${key}. Check firebase-config.ts`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Enable persistence for React Native
if (Platform.OS !== 'web') {
  try {
    // For native platforms, auth persistence is handled automatically
    // by React Native Firebase
  } catch (error) {
    console.warn('Could not enable auth persistence:', error);
  }
}

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Development: Connect to emulators if needed
// Uncomment to use Firebase emulators for local development
// if (__DEV__) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.warn('Emulator connection error:', error);
//   }
// }

export default app;
