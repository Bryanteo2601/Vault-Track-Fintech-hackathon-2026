/**
 * Subscription Service
 * Handles subscription data operations with Firestore
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase-config';
import {
  UserSubscription,
  SubscriptionUsage,
  SubscriptionTier,
  BillingCycle,
  AI_USAGE_LIMITS,
} from './subscription-types';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const USAGE_COLLECTION = 'subscription_usage';

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create default free subscription
      const defaultSubscription: UserSubscription = {
        userId,
        tier: 'free',
        billingCycle: 'monthly',
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        singpassVerified: false,
      };
      await setDoc(docRef, defaultSubscription);
      return defaultSubscription;
    }

    return docSnap.data() as UserSubscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Update user's subscription tier
 */
export async function upgradeSubscription(
  userId: string,
  tier: SubscriptionTier,
  billingCycle: BillingCycle
): Promise<boolean> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    const renewalDate = new Date();

    if (billingCycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    await updateDoc(docRef, {
      tier,
      billingCycle,
      status: 'active',
      renewalDate: renewalDate.toISOString(),
    });

    // Reset usage on upgrade
    await resetSubscriptionUsage(userId, tier);

    return true;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return false;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    await updateDoc(docRef, {
      status: 'cancelled',
    });
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Verify Singpass for CPF features
 */
export async function verifySingpass(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    await updateDoc(docRef, {
      singpassVerified: true,
      singpassVerifiedDate: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error verifying Singpass:', error);
    return false;
  }
}

/**
 * Get subscription usage
 */
export async function getSubscriptionUsage(userId: string): Promise<SubscriptionUsage | null> {
  try {
    const docRef = doc(db, USAGE_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create default usage record
      const subscription = await getUserSubscription(userId);
      if (!subscription) return null;

      const limits = AI_USAGE_LIMITS[subscription.tier];
      const defaultUsage: SubscriptionUsage = {
        userId,
        tier: subscription.tier,
        aiChatsUsed: 0,
        aiChatsLimit: limits.chats,
        stressTestsUsed: 0,
        stressTestsLimit: limits.stressTests,
        lastResetDate: new Date().toISOString(),
      };

      await setDoc(docRef, defaultUsage);
      return defaultUsage;
    }

    return docSnap.data() as SubscriptionUsage;
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    return null;
  }
}

/**
 * Increment AI chat usage
 */
export async function incrementAIChatUsage(userId: string): Promise<boolean> {
  try {
    const usage = await getSubscriptionUsage(userId);
    if (!usage) return false;

    // Check if limit exceeded (only for non-unlimited tiers)
    if (usage.aiChatsLimit > 0 && usage.aiChatsUsed >= usage.aiChatsLimit) {
      return false; // Limit exceeded
    }

    const docRef = doc(db, USAGE_COLLECTION, userId);
    await updateDoc(docRef, {
      aiChatsUsed: usage.aiChatsUsed + 1,
    });

    return true;
  } catch (error) {
    console.error('Error incrementing AI chat usage:', error);
    return false;
  }
}

/**
 * Increment stress test usage
 */
export async function incrementStressTestUsage(userId: string): Promise<boolean> {
  try {
    const usage = await getSubscriptionUsage(userId);
    if (!usage) return false;

    // Check if limit exceeded (only for non-unlimited tiers)
    if (usage.stressTestsLimit > 0 && usage.stressTestsUsed >= usage.stressTestsLimit) {
      return false; // Limit exceeded
    }

    const docRef = doc(db, USAGE_COLLECTION, userId);
    await updateDoc(docRef, {
      stressTestsUsed: usage.stressTestsUsed + 1,
    });

    return true;
  } catch (error) {
    console.error('Error incrementing stress test usage:', error);
    return false;
  }
}

/**
 * Reset subscription usage (called on upgrade or monthly reset)
 */
export async function resetSubscriptionUsage(
  userId: string,
  tier: SubscriptionTier
): Promise<boolean> {
  try {
    const limits = AI_USAGE_LIMITS[tier];
    const docRef = doc(db, USAGE_COLLECTION, userId);

    await updateDoc(docRef, {
      tier,
      aiChatsUsed: 0,
      aiChatsLimit: limits.chats,
      stressTestsUsed: 0,
      stressTestsLimit: limits.stressTests,
      lastResetDate: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error resetting subscription usage:', error);
    return false;
  }
}

/**
 * Check if user can perform AI operation
 */
export async function canPerformAIOperation(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || subscription.status !== 'active') return false;

  if (subscription.tier === 'free') return false; // Free tier has no AI access
  if (subscription.tier === 'premium') return true; // Premium has unlimited

  // Pro tier: check usage
  const usage = await getSubscriptionUsage(userId);
  if (!usage) return false;

  return usage.aiChatsUsed < usage.aiChatsLimit;
}

/**
 * Check if user can perform stress test
 */
export async function canPerformStressTest(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || subscription.status !== 'active') return false;

  if (subscription.tier !== 'premium') return false; // Only premium tier

  const usage = await getSubscriptionUsage(userId);
  if (!usage) return false;

  return usage.stressTestsUsed < usage.stressTestsLimit;
}

/**
 * Get remaining usage for user
 */
export async function getRemainingUsage(
  userId: string
): Promise<{ aiChats: number; stressTests: number } | null> {
  const usage = await getSubscriptionUsage(userId);
  if (!usage) return null;

  return {
    aiChats: usage.aiChatsLimit === -1 ? -1 : Math.max(0, usage.aiChatsLimit - usage.aiChatsUsed),
    stressTests:
      usage.stressTestsLimit === -1 ? -1 : Math.max(0, usage.stressTestsLimit - usage.stressTestsUsed),
  };
}
