/**
 * Feature Gated Section Component
 * Wraps content and shows locked state if user doesn't have access
 */

import { View, Text, Pressable } from 'react-native';
import type { ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { Feature, SubscriptionTier, SUBSCRIPTION_PLANS } from '@/lib/subscription-types';
import { LockedFeatureBadge } from './locked-feature-badge';
import { cn } from '@/lib/utils';

interface FeatureGatedSectionProps {
  featureId: string;
  feature: Feature;
  hasAccess: boolean;
  children: ReactNode;
  onUpgradePress?: () => void;
  showBadgeWhenLocked?: boolean;
}

export function FeatureGatedSection({
  featureId,
  feature,
  hasAccess,
  children,
  onUpgradePress,
  showBadgeWhenLocked = true,
}: FeatureGatedSectionProps) {
  const colors = useColors();

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show locked state
  const requiredPlan = SUBSCRIPTION_PLANS[feature.requiredTier];

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="p-6 gap-4 items-center">
        {/* Lock Icon */}
        <View
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <MaterialIcons name="lock" size={32} color={colors.primary} />
        </View>

        {/* Feature Name */}
        <View className="gap-1 items-center">
          <Text
            className="font-bold text-center"
            style={{ fontSize: 16, color: colors.foreground }}
          >
            {feature.name}
          </Text>
          <Text
            className="text-center"
            style={{ fontSize: 13, color: colors.muted }}
          >
            {feature.description}
          </Text>
        </View>

        {/* Tier Badge */}
        {showBadgeWhenLocked && (
          <LockedFeatureBadge
            requiredTier={feature.requiredTier}
            size="medium"
          />
        )}

        {/* Upgrade Info */}
        <View className="gap-2 items-center">
          <Text
            className="text-sm text-center"
            style={{ color: colors.muted }}
          >
            Upgrade to {requiredPlan.name} to unlock this feature
          </Text>
          <Text
            className="font-semibold text-center"
            style={{ fontSize: 14, color: colors.primary }}
          >
            SGD {requiredPlan.monthlyPrice}/month
          </Text>
        </View>

        {/* Upgrade Button */}
        <Pressable
          onPress={onUpgradePress}
          className="w-full p-3 rounded-lg items-center active:opacity-80 mt-2"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-semibold"
            style={{ fontSize: 14, color: colors.background }}
          >
            Upgrade Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Feature Gated Button Component
 * Shows lock icon if feature is locked
 */
interface FeatureGatedButtonProps {
  featureId: string;
  feature: Feature;
  hasAccess: boolean;
  onPress: () => void;
  onLockPress?: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export function FeatureGatedButton({
  featureId,
  feature,
  hasAccess,
  onPress,
  onLockPress,
  children,
  disabled = false,
}: FeatureGatedButtonProps) {
  const colors = useColors();

  if (hasAccess) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="flex-row items-center gap-2 active:opacity-80"
      >
        {children}
      </Pressable>
    );
  }

  // Show locked button
  return (
    <Pressable
      onPress={onLockPress}
      className="flex-row items-center gap-2 active:opacity-80"
      style={{ opacity: 0.6 }}
    >
      <MaterialIcons name="lock" size={20} color={colors.muted} />
      {children}
    </Pressable>
  );
}
