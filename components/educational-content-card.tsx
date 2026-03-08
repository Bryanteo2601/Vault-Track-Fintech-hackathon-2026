import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppData } from '@/lib/app-data-context';
import { generateAgeBasedFinancialAdvice } from '@/lib/age-dynamic-advisor';
import { useColors } from '@/hooks/use-colors';
import { MaterialIcons } from '@expo/vector-icons';

export function EducationalContentCard() {
  const { data } = useAppData();
  const colors = useColors();

  const advice = generateAgeBasedFinancialAdvice(data.userProfile?.birthDate);
  const topics = advice.lifeStage.educationTopics;

  if (topics.length === 0) {
    return null;
  }

  const topicIcons: Record<string, string> = {
    'Emergency Fund': 'shield',
    'CPF Planning': 'savings',
    'Insurance Coverage': 'health-and-safety',
    'Debt Management': 'trending-down',
    'Investment Basics': 'trending-up',
    'Tax Planning': 'receipt-long',
    'Retirement Planning': 'event-note',
    'Estate Planning': 'description',
    'Budgeting': 'pie-chart',
    'Diversification': 'hub',
  };

  return (
    <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-sm text-muted font-semibold mb-1">LEARNING PATH</Text>
        <Text className="text-lg font-bold text-foreground">
          Recommended Topics for Your Stage
        </Text>
      </View>

      {/* Topics Grid */}
      <View className="gap-2">
        {topics.slice(0, 4).map((topic: string, index: number) => (
          <Pressable
            key={index}
            className="flex-row items-center gap-3 bg-background rounded-lg p-3 active:opacity-70"
          >
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
              <MaterialIcons
                name={(topicIcons[topic] || 'lightbulb') as any}
                size={20}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{topic}</Text>
              <Text className="text-xs text-muted">Learn more →</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* View All Link */}
      {topics.length > 4 && (
        <Pressable className="mt-3 py-2 active:opacity-70">
          <Text className="text-sm font-semibold text-primary">
            View all {topics.length} topics →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
