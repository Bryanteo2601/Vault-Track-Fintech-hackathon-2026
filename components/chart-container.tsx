import { View, Text } from 'react-native';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  height = 300,
}: ChartContainerProps) {
  return (
    <View className="bg-surface border border-border rounded-lg p-4 overflow-hidden">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-muted mt-1">{subtitle}</Text>
        )}
      </View>

      {/* Chart Area */}
      <View style={{ height }} className="bg-background rounded border border-border border-opacity-30 p-4 relative">
        {/* Gridlines */}
        <View className="absolute inset-0 opacity-10">
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pos) => (
            <View
              key={`h-${pos}`}
              className="absolute w-full border-t border-muted"
              style={{ top: `${pos * 100}%` }}
            />
          ))}
          {/* Vertical gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pos) => (
            <View
              key={`v-${pos}`}
              className="absolute h-full border-l border-muted"
              style={{ left: `${pos * 100}%` }}
            />
          ))}
        </View>

        {/* Chart Content */}
        <View className="flex-1 relative z-10">
          {children}
        </View>
      </View>
    </View>
  );
}
