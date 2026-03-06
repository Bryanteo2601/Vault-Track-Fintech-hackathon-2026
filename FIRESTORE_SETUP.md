# Firestore Security Rules Setup

This document explains how to deploy the Firestore security rules to ensure each user can only access their own profile and financial data.

## Overview

The app uses **per-user data isolation** with Firestore security rules. Each user's data is stored under their unique Firebase Authentication UID at the path `users/{uid}`, and security rules enforce that only the authenticated user can read or write their own data.

## Data Structure

```
Firestore Database
└── users/
    ├── {uid_user_1}/
    │   ├── email: "user1@example.com"
    │   ├── displayName: "John Doe"
    │   ├── bankAccounts: [...]
    │   ├── loans: [...]
    │   ├── holdings: [...]
    │   ├── insurancePolicies: [...]
    │   └── creditScore: {...}
    │
    └── {uid_user_2}/
        ├── email: "user2@example.com"
        ├── displayName: "Jane Smith"
        ├── bankAccounts: [...]
        └── ... (other user data)
```

## Security Rules

The `firestore.rules` file contains the security rules that enforce data isolation:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each user can only read/write their own profile and financial data
    match /users/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Rule Explanation

| Rule | Explanation |
|------|-------------|
| `match /users/{userId}/{documents=**}` | Matches any document under a user's UID path (including nested documents) |
| `request.auth != null` | User must be authenticated |
| `request.auth.uid == userId` | User's UID must match the path UID (ensures they can only access their own data) |
| `allow read, write` | Authenticated users can read and write their own data |
| `match /{document=**} { allow read, write: if false; }` | Deny all other access by default (security best practice) |

## How to Deploy

### Option 1: Firebase Console (Recommended for Testing)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **wealth-wellness-app**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI (Recommended for Production)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Testing Data Isolation

To verify that the security rules are working correctly:

### Test 1: User Can Access Own Data

1. Sign in as **User A** (email: user.a@example.com)
2. You should see your profile, bank accounts, investments, loans, and insurance data
3. Verify you can create, read, update, and delete your own data

### Test 2: User Cannot Access Other User's Data

1. Sign in as **User B** (email: user.b@example.com)
2. Open browser DevTools Console
3. Try to manually query another user's data:
   ```javascript
   // This will FAIL with permission-denied error
   const userARef = db.collection('users').doc('USER_A_UID');
   const doc = await userARef.get();
   // Error: Missing or insufficient permissions
   ```

### Test 3: Unauthenticated Users Cannot Access Any Data

1. Close the app or sign out
2. Try to access Firestore data directly
3. All requests should fail with `permission-denied` error

## App Code Integration

The app automatically enforces user data isolation through:

### 1. Firebase Auth Context (`lib/firebase-auth-context.tsx`)
- Listens to authenticated user's UID
- Fetches only the authenticated user's document: `users/{authUser.uid}`
- All subsequent data reads/writes use this UID path

### 2. Firebase Auth Service (`lib/firebase-auth.ts`)
- Signup creates user document at `users/{uid}` with the new user's data
- All financial data (banks, loans, investments, insurance) is stored under the user's UID

### 3. App Data Context (`lib/app-data-context.tsx`)
- All data operations use the authenticated user's UID
- No cross-user data queries are possible

## Security Best Practices

✅ **Do:**
- Always authenticate users before accessing Firestore
- Use the authenticated user's UID as the primary key for their data
- Test security rules with multiple user accounts
- Monitor Firestore usage in Firebase Console for suspicious patterns
- Regularly review and update security rules as features change

❌ **Don't:**
- Store sensitive data (passwords, API keys) in Firestore
- Allow unauthenticated access to user data
- Hardcode user UIDs in the app (always use `request.auth.uid`)
- Share security rules without understanding them

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** Security rules are blocking the request

**Solution:** 
1. Verify the user is authenticated
2. Check that the document path matches the user's UID
3. Review the security rules in Firebase Console
4. Check the browser console for detailed error messages

### Error: "Firestore: Error (auth/configuration-not-found)"

**Cause:** Firebase is not properly initialized

**Solution:**
1. Verify `firebase-config.ts` is correctly configured
2. Check that Firebase credentials are valid
3. Restart the dev server: `npm run dev`

### Data Not Syncing

**Cause:** Real-time listener may not be active

**Solution:**
1. Check that `FirebaseAuthProvider` wraps the app in `app/_layout.tsx`
2. Verify the auth context is being used: `const { user, userData } = useFirebaseAuth()`
3. Check browser console for Firestore listener errors

## Next Steps

1. **Deploy security rules** to Firebase Console using one of the methods above
2. **Test with multiple accounts** to verify data isolation works
3. **Monitor Firestore usage** in Firebase Console
4. **Add email verification** (optional) to prevent unauthorized signups
5. **Implement audit logging** (optional) to track data access

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
