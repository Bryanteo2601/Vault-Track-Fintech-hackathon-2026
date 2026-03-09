import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { EvaluatedNudge } from '@/lib/nudge-engine';

interface NudgeCardProps {
  nudge: EvaluatedNudge;
  onDismiss?: (nudgeId: string) => void;
}

export function NudgeCard({ nudge, onDismiss }: NudgeCardProps) {
  const router = useRouter();

  const handleAction = () => {
    router.push(nudge.content.actionLink as any);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-error';
      case 'medium':
        return 'border-warning';
      case 'low':
        return 'border-muted';
      default:
        return 'border-border';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10';
      case 'medium':
        return 'bg-warning/10';
      case 'low':
        return 'bg-muted/10';
      default:
        return 'bg-surface';
    }
  };

  return (
    <View
      className={cn(
        'rounded-xl border-l-4 p-4 mb-3',
        getPriorityColor(nudge.priority),
        getPriorityBgColor(nudge.priority)
      )}
    >
      <View className="flex-row items-start gap-3 mb-2">
        <Text className="text-2xl">{nudge.icon}</Text>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-muted mb-1">
            {nudge.category.toUpperCase()}
          </Text>
          <Text className="text-base font-bold text-foreground">
            {nudge.title}
          </Text>
        </View>
      </View>

      <Text className="text-sm font-semibold text-foreground mb-2">
        {nudge.content.headline}
      </Text>

      <Text className="text-sm text-muted leading-relaxed mb-4">
        {nudge.content.body}
      </Text>

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleAction}
          className="flex-1 bg-primary rounded-lg py-2 px-3 active:opacity-80"
        >
          <Text className="text-center text-sm font-semibold text-background">
            {nudge.content.actionLabel}
          </Text>
        </Pressable>
        {onDismiss && (
          <Pressable
            onPress={() => onDismiss(nudge.id)}
            className="px-3 py-2 active:opacity-60"
          >
            <Text className="text-sm text-muted">X</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
