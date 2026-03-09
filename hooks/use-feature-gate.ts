/**
 * Feature Gating Hook
 * Provides feature access checks and gating logic
 */

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { getUserSubscription, getSubscriptionUsage } from '../lib/subscription-service';
import { hasFeatureAccess, getLockedFeaturesForTier, Feature } from '../lib/subscription-types';
import type { UserSubscription, SubscriptionUsage } from '../lib/subscription-types';
import type { User } from '../lib/_core/auth';

interface UseFeatureGateResult {
  subscription: UserSubscription | null;
  usage: SubscriptionUsage | null;
  hasAccess: (featureId: string) => boolean;
  lockedFeatures: Feature[];
  isLoading: boolean;
  error: string | null;
}

export function useFeatureGate(): UseFeatureGateResult {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userId = String(user.id);
        const [subData, usageData] = await Promise.all([
          getUserSubscription(userId),
          getSubscriptionUsage(userId),
        ]);

        setSubscription(subData);
        setUsage(usageData);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const hasAccess = (featureId: string): boolean => {
    if (!subscription) return false;

    return hasFeatureAccess(subscription.tier, featureId, subscription.singpassVerified);
  };

  const lockedFeatures = subscription ? getLockedFeaturesForTier(subscription.tier) : [];

  return {
    subscription,
    usage,
    hasAccess,
    lockedFeatures,
    isLoading,
    error,
  };
}

/**
 * Hook to check if user can perform AI operation
 */
export function useCanPerformAI(): {
  canPerform: boolean;
  remaining: number;
  isLoading: boolean;
} {
  const { subscription, usage, isLoading } = useFeatureGate();

  const canPerform =
    (subscription?.tier === 'premium' ||
      (subscription?.tier === 'pro' &&
        usage &&
        usage.aiChatsLimit > 0 &&
        usage.aiChatsUsed < usage.aiChatsLimit)) ?? false;

  const remaining =
    subscription?.tier === 'premium'
      ? -1
      : usage && usage.aiChatsLimit > 0
        ? Math.max(0, usage.aiChatsLimit - usage.aiChatsUsed)
        : 0;

  return {
    canPerform,
    remaining,
    isLoading,
  };
}

/**
 * Hook to check if user can perform stress test
 */
export function useCanPerformStressTest(): {
  canPerform: boolean;
  remaining: number;
  isLoading: boolean;
} {
  const { subscription, usage, isLoading } = useFeatureGate();

  const canPerform =
    (subscription?.tier === 'premium' &&
      (usage?.stressTestsLimit === -1 || (usage && usage.stressTestsUsed < (usage?.stressTestsLimit || 0)))) ?? false;

  const remaining =
    subscription?.tier === 'premium' && usage
      ? usage.stressTestsLimit === -1
        ? -1
        : Math.max(0, usage.stressTestsLimit - (usage.stressTestsUsed || 0))
      : 0;

  return {
    canPerform,
    remaining,
    isLoading,
  };
}

/**
 * Hook to check Singpass verification status
 */
export function useSingpassVerification(): {
  isVerified: boolean;
  isLoading: boolean;
} {
  const { subscription, isLoading } = useFeatureGate();

  return {
    isVerified: subscription?.singpassVerified || false,
    isLoading,
  };
}
