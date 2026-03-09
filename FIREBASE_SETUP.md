# Firebase Setup Guide for Wealth Wellness Hub

This document provides step-by-step instructions to set up Firebase Authentication and Firestore for the Wealth Wellness Hub app.

## Prerequisites

- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
- Node.js and npm installed locally
- Access to your Firebase project's settings

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts
3. Enable Google Analytics (optional)
4. Wait for the project to be created

## Step 2: Enable Firebase Authentication

1. In the Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable **Email/Password** and **Email link sign-in** (optional)
4. Click **Save**

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll set security rules next)
4. Select your preferred region
5. Click **Create**

## Step 4: Get Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Under **Your apps**, click the **Web** icon to create a web app
3. Copy the Firebase config object
4. You'll need these values for environment variables:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Step 5: Set Environment Variables

Create a `.env.local` file in the project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 6: Deploy Firestore Security Rules

### Firestore Security Rules

Copy the following security rules to your Firestore Database:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Prevent users from modifying certain fields
      allow write: if request.auth.uid == userId &&
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['uid', 'email', 'createdAt']);
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### How to Deploy Rules

1. In the Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the existing rules with the code above
3. Click **Publish**

## Step 7: Create Firestore Collections

The app automatically creates user documents when users sign up. However, you can manually create the `users` collection:

1. In Firestore, click **+ Start collection**
2. Name it `users`
3. Click **Next**
4. Skip adding a document (the app will create them)
5. Click **Done**

## User Document Schema

Each user document in the `users` collection has the following structure:

```typescript
{
  uid: string;                          // Firebase Auth UID (document ID)
  email: string;                        // User's email
  displayName: string;                  // User's display name
  photoURL?: string;                    // User's profile photo URL
  createdAt: Timestamp;                 // Account creation timestamp
  updatedAt: Timestamp;                 // Last update timestamp
  bankAccounts: BankAccount[];          // Array of bank accounts
  loans: Loan[];                        // Array of loans
  holdings: Holding[];                  // Array of investment holdings
  insurancePolicies: InsurancePolicy[]; // Array of insurance policies
  creditScore: CreditScoreData;         // Credit score information
}
```

## Security Rules Explanation

### Rule 1: User Document Access
```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```
- Users can only read and write their own document
- The document ID must match their Firebase Auth UID
- Unauthenticated users cannot access any documents

### Rule 2: Field Validation
```firestore
allow write: if request.auth.uid == userId &&
  !request.resource.data.diff(resource.data).affectedKeys()
    .hasAny(['uid', 'email', 'createdAt']);
```
- Prevents users from modifying sensitive fields:
  - `uid` (immutable)
  - `email` (immutable)
  - `createdAt` (immutable)
- Users can modify other fields like `bankAccounts`, `loans`, `holdings`, etc.

### Rule 3: Default Deny
```firestore
match /{document=**} {
  allow read, write: if false;
}
```
- All other collections are denied by default
- Only the `users` collection is accessible

## Testing the Setup

1. Start the app: `npm run dev`
2. Sign up with a test email and password
3. Check the Firebase Console → Firestore to see your user document created
4. Verify the document ID matches your Firebase Auth UID
5. Try modifying your profile data and confirm it syncs to Firestore

## Troubleshooting

### "Missing or insufficient permissions" Error
- Check that your Firestore Security Rules are deployed correctly
- Verify your Firebase Auth UID matches the document ID in Firestore
- Ensure you're logged in (check `useFirebaseAuth()` hook)

### User Document Not Created
- Check the browser console for errors
- Verify Firebase config environment variables are correct
- Check Firebase Console → Authentication to see if the user was created

### Can't Update User Data
- Verify the field you're updating is not in the immutable list (`uid`, `email`, `createdAt`)
- Check that you're using `updateUserWealthData()` function
- Ensure the Firestore Security Rules allow the write operation

## Production Checklist

- [ ] Environment variables set in production
- [ ] Firestore Security Rules deployed
- [ ] Firebase Authentication enabled
- [ ] Email verification enabled (optional but recommended)
- [ ] Password reset email template customized (optional)
- [ ] Backup enabled for Firestore
- [ ] Monitoring and alerts configured

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
