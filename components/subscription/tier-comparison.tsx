/**
 * Subscription Tier Comparison Component
 * Shows all tiers with features and pricing
 */

import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { SUBSCRIPTION_PLANS, SubscriptionTier, Feature } from '@/lib/subscription-types';
import { cn } from '@/lib/utils';

interface TierComparisonProps {
  currentTier: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
  isLoading?: boolean;
}

export function TierComparison({
  currentTier,
  onSelectTier,
  isLoading = false,
}: TierComparisonProps) {
  const colors = useColors();
  const tiers: SubscriptionTier[] = ['free', 'pro', 'premium'];

  return (
    <ScrollView className="flex-1">
      <View className="p-4 gap-4">
        {/* Tier Cards */}
        {tiers.map((tier) => {
          const plan = SUBSCRIPTION_PLANS[tier];
          const isCurrentTier = tier === currentTier;
          const isBetterTier = tiers.indexOf(tier) > tiers.indexOf(currentTier);

          return (
            <View
              key={tier}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: isCurrentTier ? 2 : 1,
                borderColor: isCurrentTier ? colors.primary : colors.border,
              }}
            >
              {/* Badge */}
              {isCurrentTier && (
                <View
                  className="px-3 py-1 items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.background }}
                  >
                    CURRENT PLAN
                  </Text>
                </View>
              )}

              {/* Tier Header */}
              <View className="p-4 gap-2">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  {plan.name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {plan.description}
                </Text>
              </View>

              {/* Pricing */}
              <View className="px-4 pb-4 gap-2">
                <View className="flex-row items-baseline gap-2">
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    SGD {plan.monthlyPrice}
                  </Text>
                  <Text style={{ color: colors.muted }}>per month</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  or SGD {plan.annualPrice} per year (save{' '}
                  {plan.monthlyPrice > 0
                    ? Math.round(
                        ((plan.monthlyPrice * 12 - plan.annualPrice) /
                          (plan.monthlyPrice * 12)) *
                          100
                      )
                    : 0}
                  %)
                </Text>
              </View>

              {/* Features List */}
              <View className="px-4 pb-4 gap-2">
                {plan.features.slice(0, 5).map((feature) => (
                  <View key={feature.id} className="flex-row items-center gap-2">
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color={colors.success}
                    />
                    <Text
                      style={{ color: colors.foreground, fontSize: 13 }}
                      className="flex-1"
                    >
                      {feature.name}
                    </Text>
                  </View>
                ))}
                {plan.features.length > 5 && (
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    + {plan.features.length - 5} more features
                  </Text>
                )}
              </View>

              {/* Action Button */}
              <View className="px-4 pb-4">
                {isCurrentTier ? (
                  <View
                    className="p-3 rounded-lg items-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: colors.muted, fontSize: 14 }}
                    >
                      Your Current Plan
                    </Text>
                  </View>
                ) : isBetterTier ? (
                  <Pressable
                    onPress={() => onSelectTier(tier)}
                    disabled={isLoading}
                    className="p-3 rounded-lg items-center active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: colors.background, fontSize: 14 }}
                    >
                      {isLoading ? 'Processing...' : 'Upgrade Now'}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    className="p-3 rounded-lg items-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ color: colors.muted, fontSize: 14 }}
                    >
                      Downgrade
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Billing Info */}
        <View className="p-4 rounded-lg gap-2" style={{ backgroundColor: colors.background }}>
          <Text
            className="font-semibold"
            style={{ color: colors.foreground, fontSize: 13 }}
          >
            💳 Billing Information
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            All subscriptions auto-renew. You can cancel anytime from your account settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
