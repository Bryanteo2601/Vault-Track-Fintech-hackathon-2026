import { describe, it, expect } from 'vitest';

/**
 * Firebase Configuration Validation Tests
 * Verifies that all required Firebase environment variables are set
 */

describe('Firebase Configuration', () => {
  it('should have all required environment variables set', () => {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ];

    requiredEnvVars.forEach((envVar) => {
      const value = process.env[envVar];
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(typeof value).toBe('string');
    });
  });

  it('should have valid Firebase API Key format', () => {
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^AIza[a-zA-Z0-9_-]{35}$/);
  });

  it('should have valid Firebase Auth Domain format', () => {
    const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN;
    expect(authDomain).toBeDefined();
    expect(authDomain).toMatch(/^[a-z0-9-]+\.firebaseapp\.com$/);
  });

  it('should have valid Firebase Project ID format', () => {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    expect(projectId).toBeDefined();
    expect(projectId).toMatch(/^[a-z0-9-]+$/);
  });

  it('should have valid Firebase Storage Bucket format', () => {
    const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
    expect(storageBucket).toBeDefined();
    expect(storageBucket).toMatch(/^[a-z0-9-]+\.firebasestorage\.app$/);
  });

  it('should have valid Firebase Messaging Sender ID format', () => {
    const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    expect(messagingSenderId).toBeDefined();
    expect(messagingSenderId).toMatch(/^\d+$/);
  });

  it('should have valid Firebase App ID format', () => {
    const appId = process.env.VITE_FIREBASE_APP_ID;
    expect(appId).toBeDefined();
    expect(appId).toMatch(/^1:\d+:web:[a-f0-9]+$/);
  });

  it('should construct valid Firebase config object', () => {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };

    // Verify all fields are present and non-empty
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(typeof value).toBe('string');
    });

    // Verify config has expected structure
    expect(firebaseConfig).toHaveProperty('apiKey');
    expect(firebaseConfig).toHaveProperty('authDomain');
    expect(firebaseConfig).toHaveProperty('projectId');
    expect(firebaseConfig).toHaveProperty('storageBucket');
    expect(firebaseConfig).toHaveProperty('messagingSenderId');
    expect(firebaseConfig).toHaveProperty('appId');
  });
});
