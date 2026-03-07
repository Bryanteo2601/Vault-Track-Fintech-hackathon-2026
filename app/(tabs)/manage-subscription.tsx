/**
 * Manage Subscription Screen
 * Comprehensive subscription management and upgrade flow
 * Accessible from Profile > Manage Subscription
 */

import { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscription-types';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    // TODO: Integrate with payment provider
    console.log(`Upgrading to ${tier} with ${billingCycle} billing`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-bold text-foreground">Manage Subscription</Text>
              <Text className="text-sm text-muted mt-1">Upgrade to unlock premium features</Text>
            </View>
            <Pressable onPress={handleBack} className="active:opacity-60">
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Current Plan */}
          <View className="bg-surface border border-border rounded-2xl p-6 mb-8">
            <Text className="text-sm text-muted mb-2">Current Plan</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">Free</Text>
                <Text className="text-sm text-muted mt-1">No cost • Limited features</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>ACTIVE</Text>
              </View>
            </View>
          </View>

          {/* Billing Cycle Toggle */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-foreground mb-3">Billing Cycle</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setBillingCycle('monthly')}
                className="flex-1 p-3 rounded-lg items-center active:opacity-80"
                style={{
                  backgroundColor: billingCycle === 'monthly' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: billingCycle === 'monthly' ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: billingCycle === 'monthly' ? colors.background : colors.foreground }}
                >
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setBillingCycle('annual')}
                className="flex-1 p-3 rounded-lg items-center active:opacity-80"
                style={{
                  backgroundColor: billingCycle === 'annual' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: billingCycle === 'annual' ? colors.primary : colors.border,
                }}
              >
                <View className="items-center">
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: billingCycle === 'annual' ? colors.background : colors.foreground }}
                  >
                    Annual
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: billingCycle === 'annual' ? colors.background : colors.muted }}
                  >
                    Save 20%
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Pricing Plans */}
          <View className="gap-4 mb-8">
            {/* Pro Plan */}
            <View
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: selectedTier === 'pro' ? colors.primary : colors.border,
                borderWidth: selectedTier === 'pro' ? 2 : 1,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xl font-bold text-foreground">Pro</Text>
                  <Text className="text-xs text-muted mt-1">Perfect for serious investors</Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '30' : '300'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/month' : '/year'}</Text>
                </View>
              </View>

              <View className="border-t border-border pt-4 mb-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">Financial health breakdown</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">Diversification analysis</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">CPF retirement projections</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">50 AI chats/month</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleUpgrade('pro')}
                className="p-3 rounded-lg items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-sm" style={{ color: colors.background }}>
                  {selectedTier === 'pro' ? 'Selected' : 'Choose Pro'}
                </Text>
              </Pressable>
            </View>

            {/* Premium Plan */}
            <View
              className="rounded-2xl p-6 border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: selectedTier === 'premium' ? colors.primary : colors.primary + '40',
              }}
            >
              <View className="absolute top-3 right-3 px-2 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>RECOMMENDED</Text>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xl font-bold text-foreground">Premium</Text>
                  <Text className="text-xs text-muted mt-1">Everything + AI wealth coach</Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '50' : '400'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/month' : '/year'}</Text>
                </View>
              </View>

              <View className="border-t border-border pt-4 mb-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">All Pro features</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">AI wealth coach</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">Portfolio stress testing</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">Unlimited AI chats</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text className="text-sm text-muted">Global retirement planner</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleUpgrade('premium')}
                className="p-3 rounded-lg items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-sm" style={{ color: colors.background }}>
                  {selectedTier === 'premium' ? 'Selected' : 'Choose Premium'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Billing Info */}
          <View className="bg-background border border-border rounded-2xl p-4 mb-8">
            <Text className="text-sm font-semibold text-foreground mb-3">Billing Information</Text>
            <View className="gap-2">
              <View className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={16} color={colors.muted} style={{ marginTop: 2 }} />
                <Text className="text-xs text-muted flex-1">
                  Your subscription will renew automatically on the same date each month or year.
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={16} color={colors.muted} style={{ marginTop: 2 }} />
                <Text className="text-xs text-muted flex-1">
                  You can cancel anytime from your account settings. No questions asked.
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={16} color={colors.muted} style={{ marginTop: 2 }} />
                <Text className="text-xs text-muted flex-1">
                  Annual plans save you 20% compared to monthly billing.
                </Text>
              </View>
            </View>
          </View>

          {/* FAQ */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">Frequently Asked Questions</Text>
            <View className="bg-background border border-border rounded-2xl p-4 gap-3">
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1">Can I change my plan later?</Text>
                <Text className="text-xs text-muted">Yes, you can upgrade or downgrade at any time. Changes take effect immediately.</Text>
              </View>
              <View className="border-t border-border pt-3">
                <Text className="text-xs font-semibold text-foreground mb-1">What payment methods do you accept?</Text>
                <Text className="text-xs text-muted">We accept all major credit cards, debit cards, and digital wallets.</Text>
              </View>
              <View className="border-t border-border pt-3">
                <Text className="text-xs font-semibold text-foreground mb-1">Is there a free trial?</Text>
                <Text className="text-xs text-muted">The Free tier is your trial. Upgrade to Pro or Premium whenever you're ready.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
