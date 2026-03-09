/**
 * Locked Feature Badge Component
 * Shows lock icon and tier requirement for locked features
 */

import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { SubscriptionTier } from '@/lib/subscription-types';
import { cn } from '@/lib/utils';

interface LockedFeatureBadgeProps {
  requiredTier: SubscriptionTier;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const tierLabels: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

const tierColors: Record<SubscriptionTier, string> = {
  free: '#687076',
  pro: '#0a7ea4',
  premium: '#22C55E',
};

export function LockedFeatureBadge({
  requiredTier,
  onPress,
  size = 'medium',
}: LockedFeatureBadgeProps) {
  const colors = useColors();

  const sizeConfig = {
    small: { iconSize: 16, textSize: 12, padding: 'px-2 py-1' },
    medium: { iconSize: 18, textSize: 13, padding: 'px-3 py-1.5' },
    large: { iconSize: 20, textSize: 14, padding: 'px-4 py-2' },
  };

  const config = sizeConfig[size];
  const tierColor = tierColors[requiredTier];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1 rounded-full',
        config.padding
      )}
      style={{
        backgroundColor: `${tierColor}20`,
        borderWidth: 1,
        borderColor: tierColor,
      }}
    >
      <MaterialIcons name="lock" size={config.iconSize} color={tierColor} />
      <Text
        className="font-semibold"
        style={{
          fontSize: config.textSize,
          color: tierColor,
        }}
      >
        {tierLabels[requiredTier]}
      </Text>
    </Pressable>
  );
}
