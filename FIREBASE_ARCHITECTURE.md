# Firebase Architecture & Implementation Guide

## Overview

The Wealth Wellness Hub uses Firebase for secure authentication and data storage. This document explains the architecture, data flow, and implementation details.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          FirebaseAuthProvider (Context)              │   │
│  │  - Manages global auth state                         │   │
│  │  - Listens to auth state changes                     │   │
│  │  - Syncs user data from Firestore                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Firebase Auth Service (firebase-auth.ts)      │   │
│  │  - signUp()                                          │   │
│  │  - signIn()                                          │   │
│  │  - logOut()                                          │   │
│  │  - sendPasswordReset()                               │   │
│  │  - updateUserWealthData()                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Firebase SDK (Authentication & Firestore)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │      Firebase Backend                │
        ├──────────────────────────────────────┤
        │  Authentication Service              │
        │  - Email/Password auth               │
        │  - Session management                │
        │  - Password reset                    │
        ├──────────────────────────────────────┤
        │  Firestore Database                  │
        │  - users/{uid} collection            │
        │  - Real-time sync                    │
        │  - Security Rules enforcement        │
        └──────────────────────────────────────┘
```

## File Structure

```
wealth-wellness-hub/
├── lib/
│   ├── firebase-config.ts              # Firebase initialization
│   ├── firebase-auth.ts                # Auth service functions
│   └── firebase-auth-context.tsx       # Auth context provider
├── app/
│   ├── _layout.tsx                     # Root layout with auth routing
│   ├── auth/
│   │   ├── _layout.tsx                 # Auth stack layout
│   │   ├── login.tsx                   # Login screen
│   │   ├── signup.tsx                  # Sign up screen
│   │   └── forgot-password.tsx         # Password reset screen
│   └── (tabs)/
│       ├── _layout.tsx                 # Tab navigation
│       ├── index.tsx                   # Dashboard (protected)
│       ├── banks.tsx                   # Banks (protected)
│       ├── investments.tsx             # Investments (protected)
│       ├── loans.tsx                   # Loans (protected)
│       ├── insurance.tsx               # Insurance (protected)
│       └── profile.tsx                 # Profile (protected)
├── components/
│   └── protected-route.tsx             # Route protection wrapper
├── FIREBASE_SETUP.md                   # Setup instructions
└── FIREBASE_ARCHITECTURE.md            # This file
```

## Data Flow

### Sign Up Flow

```
User fills signup form
        ↓
signUp(email, password, displayName)
        ↓
Firebase Auth: createUserWithEmailAndPassword()
        ↓
Firebase Auth: updateProfile(displayName)
        ↓
Firestore: Create users/{uid} document
        ↓
FirebaseAuthProvider detects auth state change
        ↓
onAuthStateChanged() fires
        ↓
onSnapshot(users/{uid}) subscribes to user data
        ↓
App navigates to (tabs) (protected routes)
```

### Login Flow

```
User enters email & password
        ↓
signIn(email, password)
        ↓
Firebase Auth: signInWithEmailAndPassword()
        ↓
onAuthStateChanged() fires
        ↓
onSnapshot(users/{uid}) subscribes to user data
        ↓
App navigates to (tabs) (protected routes)
```

### Logout Flow

```
User taps "Sign Out" button
        ↓
logOut()
        ↓
Firebase Auth: signOut()
        ↓
onAuthStateChanged() fires with null user
        ↓
FirebaseAuthProvider sets user = null
        ↓
App navigates to auth/login (public route)
```

### Update User Data Flow

```
User modifies wealth data (banks, loans, etc.)
        ↓
updateUserWealthData(uid, data)
        ↓
Firestore: setDoc(users/{uid}, data, { merge: true })
        ↓
Firestore Security Rules validate:
  - request.auth.uid == uid (user owns document)
  - Immutable fields not modified (uid, email, createdAt)
        ↓
onSnapshot() listener fires
        ↓
userData updates in FirebaseAuthProvider
        ↓
UI re-renders with new data
```

## Authentication Flow

### Protected Routes

The app uses conditional rendering based on auth state:

```typescript
// In app/_layout.tsx
function RootLayoutContent() {
  const { user, loading } = useFirebaseAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Stack>
      {user ? (
        <Stack.Screen name="(tabs)" />  // Protected app screens
      ) : (
        <Stack.Screen name="auth" />    // Public auth screens
      )}
    </Stack>
  );
}
```

### Using Auth in Components

```typescript
// In any component
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

export function MyComponent() {
  const { user, userData, loading, error } = useFirebaseAuth();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotLoggedIn />;

  return (
    <View>
      <Text>{user.displayName}</Text>
      <Text>{userData?.email}</Text>
    </View>
  );
}
```

## Firestore Data Model

### Users Collection

**Path:** `users/{uid}`

**Document Schema:**

```typescript
interface FirebaseUser {
  uid: string;                          // Firebase Auth UID (immutable)
  email: string;                        // User's email (immutable)
  displayName: string;                  // User's display name (mutable)
  photoURL?: string;                    // User's profile photo URL (mutable)
  createdAt: Timestamp;                 // Account creation (immutable)
  updatedAt: Timestamp;                 // Last update (auto-updated)
  
  // Wealth data (all mutable)
  bankAccounts: BankAccount[];
  loans: Loan[];
  holdings: Holding[];
  insurancePolicies: InsurancePolicy[];
  creditScore: CreditScoreData;
}
```

### Sub-Collections (Future Enhancement)

For better scalability, consider moving large arrays to sub-collections:

```
users/{uid}/
  ├── bankAccounts/{accountId}
  ├── loans/{loanId}
  ├── holdings/{holdingId}
  └── insurancePolicies/{policyId}
```

## Security Rules Explained

### Rule 1: User Document Access

```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

**What it does:**
- Only authenticated users can access their own document
- `request.auth.uid` is the Firebase Auth UID of the logged-in user
- `userId` is the document ID (which equals the user's UID)
- Both read and write operations are allowed

**Example:**
- User A (uid: "abc123") can read/write `users/abc123`
- User A cannot read/write `users/xyz789`
- Unauthenticated users cannot access any documents

### Rule 2: Field Validation

```firestore
allow write: if request.auth.uid == userId &&
  !request.resource.data.diff(resource.data).affectedKeys()
    .hasAny(['uid', 'email', 'createdAt']);
```

**What it does:**
- Prevents modification of sensitive fields
- `request.resource.data` = new data being written
- `resource.data` = existing data
- `.diff().affectedKeys()` = fields that changed
- `.hasAny(['uid', 'email', 'createdAt'])` = checks if any immutable fields changed

**Example:**
- User can update `displayName` ✅
- User can update `bankAccounts` ✅
- User cannot update `uid` ❌
- User cannot update `email` ❌
- User cannot update `createdAt` ❌

### Rule 3: Default Deny

```firestore
match /{document=**} {
  allow read, write: if false;
}
```

**What it does:**
- Denies all access to any other collections
- Ensures only `users` collection is accessible
- Prevents accidental data leaks

## Error Handling

### Authentication Errors

```typescript
const result = await signIn(email, password);

if (!result.success) {
  // result.error contains error message:
  // - "User not found"
  // - "Incorrect password"
  // - "Invalid email address"
  // - "User account has been disabled"
  console.error(result.error);
}
```

### Firestore Errors

```typescript
try {
  const userData = await getUserData(uid);
} catch (error) {
  // Common errors:
  // - "permission-denied" (security rules blocked access)
  // - "not-found" (document doesn't exist)
  // - "unavailable" (service temporarily unavailable)
  console.error(error.message);
}
```

## Best Practices

### 1. Never Store Secrets in Frontend

✅ **Good:**
```typescript
// Environment variables (public config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,  // Public
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,  // Public
};
```

❌ **Bad:**
```typescript
// Never hardcode or expose private keys
const serviceAccount = {
  private_key: "...",  // NEVER in frontend
  client_secret: "...",  // NEVER in frontend
};
```

### 2. Use Security Rules for Validation

✅ **Good:**
```firestore
// Server-side validation in security rules
allow write: if request.auth.uid == userId &&
  request.resource.data.email == resource.data.email;
```

❌ **Bad:**
```typescript
// Don't rely only on client-side validation
if (email.includes('@')) {
  // This can be bypassed!
  await updateUser(email);
}
```

### 3. Handle Auth State Changes

✅ **Good:**
```typescript
// Listen to auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User logged in
    } else {
      // User logged out
    }
  });
  return () => unsubscribe();
}, []);
```

❌ **Bad:**
```typescript
// Don't assume user is always logged in
const user = auth.currentUser;  // May be null!
```

### 4. Secure Sensitive Operations

✅ **Good:**
```typescript
// Use Cloud Functions for sensitive operations
// (not implemented yet, but recommended for production)
const result = await functions.httpsCallable('updateUserRole')({
  newRole: 'admin',
});
```

❌ **Bad:**
```typescript
// Don't let frontend modify sensitive fields
await updateDoc(doc(db, 'users', uid), {
  role: 'admin',  // Anyone could change this!
});
```

## Testing

### Manual Testing Checklist

- [ ] Sign up with valid email and password
- [ ] Verify user document created in Firestore
- [ ] Sign in with correct credentials
- [ ] Sign in fails with incorrect password
- [ ] Sign in fails with non-existent email
- [ ] Password reset email sent successfully
- [ ] Update user profile data
- [ ] Verify data synced to Firestore
- [ ] Sign out successfully
- [ ] Redirected to login after sign out
- [ ] Cannot access protected routes without login

### Firestore Rules Testing

```firestore
// Test: User can read own document
match /users/abc123 {
  allow read: if request.auth.uid == 'abc123';  // ✅ Allowed
  allow read: if request.auth.uid == 'xyz789';  // ❌ Denied
}

// Test: User cannot modify immutable fields
allow write: if !request.resource.data.diff(resource.data)
  .affectedKeys().hasAny(['uid', 'email', 'createdAt']);
// ✅ Allowed: { displayName: "New Name" }
// ❌ Denied: { uid: "new_uid" }
```

## Monitoring & Debugging

### Enable Firebase Debug Logging

```typescript
// In firebase-config.ts (development only)
if (process.env.NODE_ENV === 'development') {
  enableLogging(true);
}
```

### Check Firestore Usage

1. Firebase Console → Firestore → Usage
2. Monitor read/write operations
3. Check for unusual patterns

### View Authentication Logs

1. Firebase Console → Authentication → Logs
2. See sign-up, sign-in, and error events
3. Monitor for suspicious activity

## Next Steps for Production

1. **Enable Email Verification**
   - Require users to verify email before using app
   - Reduces spam and fake accounts

2. **Implement Cloud Functions**
   - Move sensitive logic to backend
   - Validate data server-side
   - Send emails, webhooks, etc.

3. **Add Multi-Factor Authentication (MFA)**
   - Enhance security for sensitive accounts
   - Support SMS and authenticator apps

4. **Implement Role-Based Access Control (RBAC)**
   - Add admin roles
   - Restrict certain features by role
   - Use Cloud Functions to validate roles

5. **Add Audit Logging**
   - Log all data modifications
   - Track user actions
   - Detect suspicious activity

6. **Backup Strategy**
   - Enable Firestore backups
   - Test restore procedures
   - Document recovery process

## Troubleshooting Guide

### Issue: "Missing or insufficient permissions"

**Cause:** Firestore Security Rules are blocking access

**Solution:**
1. Check that user is authenticated
2. Verify document ID matches user's UID
3. Check Security Rules in Firebase Console
4. Ensure rules are published (not in draft)

### Issue: User document not created

**Cause:** Error during sign-up

**Solution:**
1. Check browser console for errors
2. Verify Firestore is enabled
3. Check Firebase Auth user was created
4. Verify environment variables are correct

### Issue: Data not syncing to Firestore

**Cause:** `updateUserWealthData()` not called or failed

**Solution:**
1. Check that function is called after data changes
2. Verify user is authenticated
3. Check browser console for errors
4. Verify Firestore Security Rules allow write

### Issue: Infinite redirect loop

**Cause:** Auth state listener not properly initialized

**Solution:**
1. Check `FirebaseAuthProvider` is at root level
2. Verify `useFirebaseAuth()` is called inside provider
3. Check for circular dependencies
4. Clear browser cache and reload

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
