import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
    console.error(`Missing Firebase config: ${key}. Check firebase-config.ts`);
  }
}

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  // Initialize Firebase - use existing app if already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Firebase Authentication with persistence
  // For React Native/Expo, use browserLocalPersistence which works across platforms
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });

  // Initialize Cloud Firestore
  db = getFirestore(app);

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth, db, app };
export default app;
