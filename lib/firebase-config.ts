import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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
  
  // Enable offline persistence for Firestore (web only)
  if (Platform.OS === 'web') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support offline persistence');
      }
    });
  }

  console.log('✅ Firebase initialized successfully');
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error);
  // Log more details about the error
  if (error?.code) {
    console.error('Error code:', error.code);
  }
  if (error?.message) {
    console.error('Error message:', error.message);
  }
}

export { auth, db, app };
export default app;
