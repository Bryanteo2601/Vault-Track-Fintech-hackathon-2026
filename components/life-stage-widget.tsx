import { View, Text, ScrollView } from 'react-native';
import { useAppData } from '@/lib/app-data-context';
import { generateAgeBasedFinancialAdvice } from '@/lib/age-dynamic-advisor';
import { useColors } from '@/hooks/use-colors';

export function LifeStageWidget() {
  const { data } = useAppData();
  const colors = useColors();

  const advice = generateAgeBasedFinancialAdvice(data.userProfile?.birthDate);

  if (advice.age < 0) {
    return null; // Don't show if no valid birthdate
  }

  const lifeStageColors: Record<string, string> = {
    early_adulthood: '#FF6B6B',
    early_career: '#4ECDC4',
    family_building: '#45B7D1',
    pre_retirement: '#FFA07A',
    retirement: '#98D8C8',
  };

  const stageColor = lifeStageColors[advice.lifeStage.stage] || colors.primary;

  return (
    <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-sm text-muted mb-1">Life Stage</Text>
        <View className="flex-row items-center gap-2">
          <View
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stageColor }}
          />
          <Text className="text-xl font-bold text-foreground">
            {advice.lifeStage.displayName}
          </Text>
          <Text className="text-sm text-muted ml-auto">{advice.age} years</Text>
        </View>
      </View>

      {/* Key Focus Areas */}
      <View className="mb-4">
        <Text className="text-xs font-semibold text-muted uppercase mb-2">
          Key Focus Areas
        </Text>
        <View className="gap-2">
          {advice.lifeStage.primaryFocus.slice(0, 3).map((focus: string, index: number) => (
            <View key={index} className="flex-row items-start gap-2">
              <Text className="text-primary font-bold">•</Text>
              <Text className="flex-1 text-sm text-foreground">{focus}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Insight */}
      {advice.insights.length > 0 && (
        <View className="bg-background rounded-lg p-3 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase mb-1">
            {advice.insights[0].category}
          </Text>
          <Text className="text-sm font-semibold text-foreground mb-1">
            {advice.insights[0].title}
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            {advice.insights[0].message}
          </Text>
        </View>
      )}
    </View>
  );
}
