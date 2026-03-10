import { Text, View, ScrollView } from 'react-native';
import { UserProfile } from '@/lib/types';
import { getLifeStageName, getLifeStageDescription, getRecommendedGoals, getKeyFocusAreas } from '@/lib/life-stage';
import { cn } from '@/lib/utils';

interface LifeStageCardProps {
  userProfile?: UserProfile;
}

export function LifeStageCard({ userProfile }: LifeStageCardProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!userProfile || !userProfile.lifeStage) {
    return (
      <View className="bg-surface rounded-xl p-4 mb-4">
        <Text className="text-sm font-semibold text-muted mb-2">LIFE STAGE</Text>
        <Text className="text-base text-foreground">
          Add your birth date to see personalized financial guidance for your life stage.
        </Text>
      </View>
    );
  }

  const stageName = getLifeStageName(userProfile.lifeStage);
  const description = getLifeStageDescription(userProfile.lifeStage);
  const goals = getRecommendedGoals(userProfile.lifeStage);
  const focusAreas = getKeyFocusAreas(userProfile.lifeStage);

  const getStageIcon = (stage: string) => {
    const icons: Record<string, string> = {
      fresh_entrant: '🚀',
      starting_family: '👨‍👩‍👧',
      supporting_parents: '👴',
      dual_responsibility: '⚖️',
      pre_retiree: '⏰',
      golden_years: '🌟',
    };
    return icons[stage] || '💰';
  };

  return (
    <ScrollView className="mb-4">
      <View className="bg-surface rounded-xl p-4 mb-4">
        <View className="flex-row items-center gap-3 mb-3">
          <Text className="text-4xl">{getStageIcon(userProfile.lifeStage)}</Text>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted mb-1">
              Age {userProfile.birthDate ? calculateAge(userProfile.birthDate) : 'N/A'}
            </Text>
            <Text className="text-lg font-bold text-foreground">
              {stageName}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-muted leading-relaxed mb-4">
          {description}
        </Text>

        {/* Key Focus Areas */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Key Focus Areas
          </Text>
          <View className="gap-2">
            {focusAreas.map((area, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="text-primary font-bold">•</Text>
                <Text className="text-sm text-muted flex-1">{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommended Goals */}
        <View>
          <Text className="text-sm font-semibold text-foreground mb-2">
            Recommended Financial Goals
          </Text>
          <View className="gap-2">
            {goals.map((goal, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="text-success font-bold">✓</Text>
                <Text className="text-sm text-muted flex-1">{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
