/**
 * Upgrade Modal Component
 * Shows feature benefits and upgrade options
 */

import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { Feature, SubscriptionTier, SUBSCRIPTION_PLANS } from '@/lib/subscription-types';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  visible: boolean;
  feature: Feature;
  currentTier: SubscriptionTier;
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => void;
  isLoading?: boolean;
}

export function UpgradeModal({
  visible,
  feature,
  currentTier,
  onClose,
  onUpgrade,
  isLoading = false,
}: UpgradeModalProps) {
  const colors = useColors();

  // Get the required tier for this feature
  const requiredTier = feature.requiredTier;
  const requiredPlan = SUBSCRIPTION_PLANS[requiredTier];

  // Get available upgrade paths
  const upgradePaths = currentTier === 'free' 
    ? ['pro', 'premium'] as SubscriptionTier[]
    : currentTier === 'pro'
    ? ['premium'] as SubscriptionTier[]
    : [];

  const minimumUpgradeTier = requiredTier;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className="w-11/12 rounded-3xl p-6 gap-6"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Header */}
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <MaterialIcons name="lock" size={24} color={colors.primary} />
              </View>
              <Text
                className="flex-1 font-bold"
                style={{ fontSize: 18, color: colors.foreground }}
              >
                Upgrade to {requiredPlan.name}
              </Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              {requiredPlan.description}
            </Text>
          </View>

          {/* Feature Description */}
          <View className="gap-2 p-4 rounded-2xl" style={{ backgroundColor: colors.background }}>
            <Text
              className="font-semibold"
              style={{ fontSize: 14, color: colors.foreground }}
            >
              {feature.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>
              {feature.description}
            </Text>
          </View>

          {/* Pricing Info */}
          <View className="gap-3">
            <Text
              className="font-semibold"
              style={{ fontSize: 14, color: colors.foreground }}
            >
              Pricing
            </Text>
            <View className="flex-row gap-3">
              <View
                className="flex-1 p-3 rounded-xl items-center"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="font-bold"
                  style={{ fontSize: 18, color: colors.primary }}
                >
                  SGD {requiredPlan.monthlyPrice}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>per month</Text>
              </View>
              <View
                className="flex-1 p-3 rounded-xl items-center"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="font-bold"
                  style={{ fontSize: 18, color: colors.primary }}
                >
                  SGD {requiredPlan.annualPrice}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>per year</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            {/* Upgrade Button */}
            {minimumUpgradeTier !== currentTier && (
              <Pressable
                onPress={() => onUpgrade(minimumUpgradeTier)}
                disabled={isLoading}
                className="p-3 rounded-xl items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="font-semibold"
                  style={{ fontSize: 14, color: colors.background }}
                >
                  {isLoading ? 'Processing...' : `Upgrade to ${requiredPlan.name}`}
                </Text>
              </Pressable>
            )}

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              disabled={isLoading}
              className="p-3 rounded-xl items-center active:opacity-80"
              style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 14, color: colors.foreground }}
              >
                Maybe Later
              </Text>
            </Pressable>
          </View>

          {/* Note about Singpass */}
          {feature.requiresSingpass && (
            <View className="p-3 rounded-lg gap-1" style={{ backgroundColor: `${colors.warning}20` }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="info" size={16} color={colors.warning} />
                <Text
                  className="flex-1 text-xs"
                  style={{ color: colors.warning }}
                >
                  Singpass verification required for CPF features
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
