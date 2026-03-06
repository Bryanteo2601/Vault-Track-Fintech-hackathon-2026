import { View, Text } from 'react-native';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  isPositive,
  subtext,
  icon,
}: MetricCardProps) {
  return (
    <View className="bg-surface border border-border rounded-lg p-4 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
          {label}
        </Text>
        {icon}
      </View>

      {/* Value */}
      <View className="mb-2">
        <Text className="text-2xl font-bold text-foreground font-mono">
          {value}
          {unit && <Text className="text-sm text-muted ml-1">{unit}</Text>}
        </Text>
      </View>

      {/* Change / Subtext */}
      {change !== undefined ? (
        <Text
          className={`text-xs font-medium ${
            isPositive ? 'text-success' : 'text-error'
          }`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
        </Text>
      ) : subtext ? (
        <Text className="text-xs text-muted">{subtext}</Text>
      ) : null}
    </View>
  );
}
