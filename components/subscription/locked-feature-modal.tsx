/**
 * Locked Feature Upgrade Modal
 * Shows when user tries to access a locked Pro or Premium feature
 * Routes to Profile > Manage Subscription when user taps upgrade
 */

import { View, Text, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/use-app-colors';
import { SubscriptionTier } from '@/lib/subscription-types';

interface LockedFeatureModalProps {
  visible: boolean;
  featureName: string;
  requiredTier: SubscriptionTier;
  description: string;
  onClose: () => void;
  onUpgrade: () => void;
}

export function LockedFeatureModal({
  visible,
  featureName,
  requiredTier,
  description,
  onClose,
  onUpgrade,
}: LockedFeatureModalProps) {
  const colors = useAppColors();

  const tierInfo = {
    pro: {
      name: 'Pro',
      price: 'SGD 30/month',
    },
    premium: {
      name: 'Premium',
      price: 'SGD 50/month',
    },
  };

  const tier = tierInfo[requiredTier as keyof typeof tierInfo] || tierInfo.pro;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="w-full rounded-t-3xl p-6 gap-4"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Header */}
          <View className="items-center mb-2">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <MaterialIcons name="lock" size={24} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-foreground">{featureName}</Text>
            <Text className="text-sm text-muted mt-2 text-center">{description}</Text>
          </View>

          {/* Tier Badge */}
          <View
            className="p-4 rounded-xl items-center"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xs text-muted mb-1">Available in</Text>
            <Text className="text-lg font-bold text-foreground">{tier.name}</Text>
            <Text className="text-sm font-semibold mt-1" style={{ color: colors.primary }}>
              {tier.price}
            </Text>
          </View>

          {/* Features Preview */}
          <View>
            <Text className="text-xs font-semibold text-muted mb-2 uppercase">What you'll unlock</Text>
            <View className="gap-2">
              {requiredTier === 'pro' && (
                <>
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
                </>
              )}
              {requiredTier === 'premium' && (
                <>
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
                </>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2 pt-2">
            <Pressable
              onPress={onUpgrade}
              className="p-3 rounded-lg items-center active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="font-bold text-sm" style={{ color: colors.background }}>
                Manage Subscription
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="p-3 rounded-lg items-center active:opacity-80"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="font-semibold text-sm" style={{ color: colors.foreground }}>
                Maybe Later
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
