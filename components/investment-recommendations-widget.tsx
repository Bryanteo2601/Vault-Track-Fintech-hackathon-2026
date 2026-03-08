import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/use-app-colors';
import { cn } from '@/lib/utils';
import { LifeStage } from '@/lib/types';
import {
  getInvestmentRecommendation,
  calculateAllocation,
  shouldRebalance,
  getRebalancingSuggestions,
} from '@/lib/investment-recommendations';
import { Holding } from '@/lib/types';

interface InvestmentRecommendationsWidgetProps {
  lifeStage: LifeStage;
  holdings: Holding[];
}

export function InvestmentRecommendationsWidget({
  lifeStage,
  holdings,
}: InvestmentRecommendationsWidgetProps) {
  const router = useRouter();
  const colors = useAppColors();

  const recommendation = getInvestmentRecommendation(lifeStage);
  const currentAllocation = calculateAllocation(holdings);
  const needsRebalancing = shouldRebalance(currentAllocation, recommendation.recommendedAllocation);
  const suggestions = getRebalancingSuggestions(currentAllocation, recommendation.recommendedAllocation);

  const AllocationBar = ({
    label,
    current,
    recommended,
  }: {
    label: string;
    current: number;
    recommended: number;
  }) => {
    const diff = recommended - current;
    const isUnder = diff > 0;

    return (
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs font-semibold text-foreground">{label}</Text>
          <View className="flex-row gap-2">
            <Text className="text-xs text-muted">
              Current: <Text className="font-semibold text-foreground">{current}%</Text>
            </Text>
            <Text className="text-xs text-muted">
              Target: <Text className="font-semibold text-foreground">{recommended}%</Text>
            </Text>
          </View>
        </View>

        {/* Current allocation bar */}
        <View className="h-2 bg-surface rounded-full mb-1 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(current, 100)}%`,
              backgroundColor:
                label === 'Stocks'
                  ? colors.primary
                  : label === 'Bonds'
                    ? colors.success
                    : colors.warning,
            }}
          />
        </View>

        {/* Recommended allocation bar */}
        <View className="h-1 bg-border rounded-full overflow-hidden opacity-50">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(recommended, 100)}%`,
              backgroundColor:
                label === 'Stocks'
                  ? colors.primary
                  : label === 'Bonds'
                    ? colors.success
                    : colors.warning,
            }}
          />
        </View>

        {/* Difference indicator */}
        {Math.abs(diff) > 5 && (
          <Text
            className={cn('text-xs mt-1 font-semibold', isUnder ? 'text-warning' : 'text-error')}
          >
            {isUnder ? '↑' : '↓'} {Math.abs(diff)}% {isUnder ? 'below' : 'above'} target
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="bg-surface border border-border rounded-2xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-muted mb-1">INVESTMENT STRATEGY</Text>
          <Text className="text-lg font-bold text-foreground">
            {recommendation.riskProfile === 'aggressive'
              ? 'Aggressive Growth'
              : recommendation.riskProfile === 'moderate-aggressive'
                ? 'Growth'
                : recommendation.riskProfile === 'moderate'
                  ? 'Balanced'
                  : recommendation.riskProfile === 'conservative-moderate'
                    ? 'Conservative Growth'
                    : 'Conservative'}
          </Text>
        </View>
        {needsRebalancing && (
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: colors.warning + '20' }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.warning }}>
              REBALANCE
            </Text>
          </View>
        )}
      </View>

      {/* Allocation comparison */}
      <View className="mb-4 pb-4 border-b border-border">
        <AllocationBar
          label="Stocks"
          current={currentAllocation.stocks}
          recommended={recommendation.recommendedAllocation.stocks}
        />
        <AllocationBar
          label="Bonds"
          current={currentAllocation.bonds}
          recommended={recommendation.recommendedAllocation.bonds}
        />
        <AllocationBar
          label="Alternatives"
          current={currentAllocation.alternatives}
          recommended={recommendation.recommendedAllocation.alternatives}
        />
      </View>

      {/* Rationale */}
      <View className="mb-4 pb-4 border-b border-border">
        <Text className="text-xs font-semibold text-muted mb-2">WHY THIS ALLOCATION</Text>
        <Text className="text-xs text-muted leading-relaxed">
          {recommendation.rationale}
        </Text>
      </View>

      {/* Rebalancing suggestions */}
      {needsRebalancing && suggestions.length > 0 && (
        <View className="mb-4 pb-4 border-b border-border">
          <Text className="text-xs font-semibold text-warning mb-2">REBALANCING NEEDED</Text>
          <View className="gap-2">
            {suggestions.slice(0, 2).map((suggestion, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={12} color={colors.warning} />
                <Text className="text-xs text-muted flex-1">{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action button */}
      <Pressable
        onPress={() => router.push('/(tabs)/investments' as any)}
        className="bg-primary rounded-lg py-2 px-3 flex-row items-center justify-center gap-2 active:opacity-80"
      >
        <MaterialIcons name="trending-up" size={16} color={colors.background} />
        <Text className="text-center text-xs font-semibold text-background">
          View Portfolio
        </Text>
      </Pressable>
    </View>
  );
}
