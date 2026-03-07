/**
 * Subscription Card Component
 * Displays current subscription status for profile screen
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useFeatureGate } from '@/hooks/use-feature-gate';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-types';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  onManagePress: () => void;
}

export function SubscriptionCard({ onManagePress }: SubscriptionCardProps) {
  const colors = useColors();
  const { subscription, isLoading } = useFeatureGate();

  if (isLoading) {
    return (
      <View
        className="rounded-2xl p-6 items-center justify-center h-32"
        style={{ backgroundColor: colors.surface }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!subscription) {
    return null;
  }

  const currentTier = subscription.tier;
  const plan = SUBSCRIPTION_PLANS[currentTier];
  const renewalDate = new Date(subscription.renewalDate);
  const daysUntilRenewal = Math.ceil(
    (renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine if user can upgrade
  const canUpgrade = currentTier !== 'premium';

  return (
    <View className="gap-3">
      {/* Header */}
      <Text
        className="text-lg font-bold"
        style={{ color: colors.foreground }}
      >
        Subscription
      </Text>

      {/* Subscription Card */}
      <View
        className="rounded-2xl p-4 gap-4"
        style={{ backgroundColor: colors.surface }}
      >
        {/* Tier Info */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1 flex-1">
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name={
                  currentTier === 'premium'
                    ? 'verified-user'
                    : currentTier === 'pro'
                    ? 'star'
                    : 'info'
                } as any
                size={20}
                color={plan.color}
              />
              <Text
                className="font-bold text-lg"
                style={{ color: colors.foreground }}
              >
                {plan.name}
              </Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {plan.description}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${plan.color}20` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: plan.color }}
            >
              {subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>

        {/* Pricing */}
        {plan.monthlyPrice > 0 && (
          <View className="gap-1">
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Monthly Price
            </Text>
            <Text
              className="font-bold text-lg"
              style={{ color: colors.primary }}
            >
              SGD {plan.monthlyPrice}
              <Text style={{ fontSize: 12 }}>/month</Text>
            </Text>
          </View>
        )}

        {/* Renewal Info */}
        <View
          className="p-3 rounded-lg gap-1"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="schedule" size={16} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 12 }} className="flex-1">
              Renews in {daysUntilRenewal} days
            </Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 11 }}>
            {renewalDate.toLocaleDateString()}
          </Text>
        </View>

        {/* Features Count */}
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="check-circle" size={16} color={colors.success} />
          <Text style={{ color: colors.foreground, fontSize: 12 }}>
            {plan.features.length} features included
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 pt-2">
          <Pressable
            onPress={onManagePress}
            className="p-3 rounded-lg items-center active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-semibold"
              style={{ fontSize: 13, color: colors.background }}
            >
              Manage Subscription
            </Text>
          </Pressable>

          {canUpgrade && (
            <Pressable
              onPress={onManagePress}
              className="p-3 rounded-lg items-center active:opacity-80 flex-row gap-2 justify-center"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
            >
              <MaterialIcons name="trending-up" size={16} color={colors.primary} />
              <Text
                className="font-semibold"
                style={{ fontSize: 13, color: colors.primary }}
              >
                View Upgrade Options
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
