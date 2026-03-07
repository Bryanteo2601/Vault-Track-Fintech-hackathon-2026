/**
 * Subscription Management Screen
 * Displays current subscription, tier comparison, and upgrade options
 */

import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useFeatureGate } from '@/hooks/use-feature-gate';
import { useAuth } from '@/hooks/use-auth';
import { upgradeSubscription, cancelSubscription } from '@/lib/subscription-service';
import { TierComparison } from '@/components/subscription/tier-comparison';
import { SubscriptionTier, SUBSCRIPTION_PLANS } from '@/lib/subscription-types';
import { cn } from '@/lib/utils';

export default function SubscriptionScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { subscription, isLoading: isLoadingSubscription } = useFeatureGate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const currentTier = subscription?.tier || 'free';
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user) return;

    try {
      setIsUpgrading(true);
      const success = await upgradeSubscription(String(user.id), tier, 'monthly');
      if (success) {
        // Show success message
        alert(`Successfully upgraded to ${SUBSCRIPTION_PLANS[tier].name}!`);
        setShowComparison(false);
      } else {
        alert('Failed to upgrade subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    try {
      setIsUpgrading(true);
      const success = await cancelSubscription(String(user.id));
      if (success) {
        alert('Subscription cancelled. You will be downgraded to Free at the end of your billing period.');
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoadingSubscription) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6 gap-2" style={{ backgroundColor: colors.surface }}>
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.foreground }}
          >
            Subscription
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            Manage your plan and unlock premium features
          </Text>
        </View>

        {/* Current Plan Card */}
        <View className="px-4 py-4 gap-4">
          <View
            className="rounded-2xl p-6 gap-4"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Tier Badge */}
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  {currentPlan.name} Plan
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {currentPlan.description}
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full items-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  ACTIVE
                </Text>
              </View>
            </View>

            {/* Pricing */}
            <View className="gap-1">
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Monthly Price
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.primary }}
              >
                SGD {currentPlan.monthlyPrice}
                <Text style={{ fontSize: 14 }}>/month</Text>
              </Text>
            </View>

            {/* Renewal Info */}
            {subscription && (
              <View
                className="p-3 rounded-lg gap-1"
                style={{ backgroundColor: colors.background }}
              >
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Feature Count */}
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={{ color: colors.foreground, fontSize: 13 }}>
                {currentPlan.features.length} features included
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View className="gap-3">
            <Text
              className="font-semibold"
              style={{ color: colors.foreground, fontSize: 14 }}
            >
              Included Features
            </Text>
            {currentPlan.features.slice(0, 8).map((feature) => (
              <View key={feature.id} className="flex-row items-center gap-3">
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={colors.success}
                />
                <View className="flex-1 gap-0.5">
                  <Text
                    style={{ color: colors.foreground, fontSize: 13 }}
                    className="font-medium"
                  >
                    {feature.name}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
            {currentPlan.features.length > 8 && (
              <Text
                style={{ color: colors.primary, fontSize: 13 }}
                className="font-semibold"
              >
                + {currentPlan.features.length - 8} more features
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-2 pt-4">
            {currentTier !== 'premium' && (
              <Pressable
                onPress={() => setShowComparison(true)}
                disabled={isUpgrading}
                className="p-3 rounded-lg items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: colors.background, fontSize: 14 }}
                >
                  {isUpgrading ? 'Processing...' : 'View Upgrade Options'}
                </Text>
              </Pressable>
            )}

            {currentTier !== 'free' && (
              <Pressable
                onPress={handleCancel}
                disabled={isUpgrading}
                className="p-3 rounded-lg items-center active:opacity-80"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: colors.foreground, fontSize: 14 }}
                >
                  Cancel Subscription
                </Text>
              </Pressable>
            )}
          </View>

          {/* Billing Info */}
          <View
            className="p-4 rounded-lg gap-2"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="info" size={16} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 12 }} className="flex-1">
                All subscriptions auto-renew. You can cancel anytime from this screen.
              </Text>
            </View>
          </View>
        </View>

        {/* Tier Comparison Modal Content */}
        {showComparison && (
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.foreground }}
              >
                Compare Plans
              </Text>
              <Pressable
                onPress={() => setShowComparison(false)}
                className="p-2 active:opacity-80"
              >
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>
            <TierComparison
              currentTier={currentTier}
              onSelectTier={handleUpgrade}
              isLoading={isUpgrading}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
