import { View, Text, ScrollView } from 'react-native';

interface Column {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  striped?: boolean;
  compact?: boolean;
}

export function DataTable({
  columns,
  data,
  striped = true,
  compact = false,
}: DataTableProps) {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <View className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <View className="bg-surface border-b border-border flex-row">
        {columns.map((col) => (
          <View
            key={col.key}
            style={{ flex: col.width || 1 }}
            className={`px-4 ${compact ? 'py-2' : 'py-3'} border-r border-border last:border-r-0`}
          >
            <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
              {col.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Body */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {data.map((row, rowIndex) => (
            <View
              key={rowIndex}
              className={`flex-row border-b border-border last:border-b-0 ${
                striped && rowIndex % 2 === 1 ? 'bg-hover' : ''
              }`}
            >
              {columns.map((col) => {
                const value = row[col.key];
                const formatted = col.format ? col.format(value) : value;

                return (
                  <View
                    key={`${rowIndex}-${col.key}`}
                    style={{ flex: col.width || 1 }}
                    className={`px-4 ${compact ? 'py-2' : 'py-3'} border-r border-border last:border-r-0 justify-center`}
                  >
                    <Text
                      className={`text-sm text-foreground font-mono ${getAlignClass(
                        col.align
                      )}`}
                    >
                      {formatted}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Empty State */}
      {data.length === 0 && (
        <View className="py-8 items-center justify-center">
          <Text className="text-muted text-sm">No data available</Text>
        </View>
      )}
    </View>
  );
}
