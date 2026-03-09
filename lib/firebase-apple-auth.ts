import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  signInWithCredential,
  OAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase-config';

/**
 * Apple Sign-In Service
 * Handles Apple authentication and Firebase integration
 */

export const signInWithApple = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Only available on iOS
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Apple Sign-In is only available on iOS',
      };
    }

    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign-In is not available on this device',
      };
    }

    // Request Apple authentication credentials
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // If the user cancelled, credential will be null
    if (!credential) {
      return {
        success: false,
        error: 'Apple Sign-In was cancelled',
      };
    }

    // Create Firebase OAuthProvider credential
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken || '',
      rawNonce: (credential as any).nonce,
    });

    // Sign in to Firebase with the Apple credential
    const result = await signInWithCredential(auth, firebaseCredential);

    // Extract user info from Apple credential
    const user = result.user;
    const appleUser = (credential as any).user;

    // Store additional user info if available
    const userData = {
      uid: user.uid,
      email: user.email || credential.email,
      displayName: user.displayName || 
        (credential.fullName 
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : 'Apple User'),
      photoURL: user.photoURL,
      provider: 'apple',
      appleUser,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
    };
  } catch (error) {
    const err = error as Error;
    
    // Handle specific error cases
    if (err.message?.includes('ERR_SKIPPED_OR_CANCELLED')) {
      return {
        success: false,
        error: 'Apple Sign-In was cancelled',
      };
    }

    if (err.message?.includes('ERR_INVALID_OPERATION')) {
      return {
        success: false,
        error: 'Apple Sign-In is not available',
      };
    }

    return {
      success: false,
      error: err.message || 'Apple Sign-In failed',
    };
  }
};

/**
 * Check if Apple Sign-In is available on the current device
 */
export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
};

export default {
  signInWithApple,
  isAppleSignInAvailable,
};
