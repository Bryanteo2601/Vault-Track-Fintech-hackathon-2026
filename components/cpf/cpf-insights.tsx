import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { CPFInsight } from '@/lib/cpf-calculations';

interface CPFInsightsProps {
  insights: CPFInsight[];
}

export function CPFInsights({ insights }: CPFInsightsProps) {
  const colors = useAppColors();

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>Smart Insights</Text>

      {insights.map((insight, idx) => {
        let backgroundColor = colors.surface;
        let borderColor = colors.border;
        let iconBgColor = colors.border;

        if (insight.type === 'warning') {
          backgroundColor = colors.error + '10';
          borderColor = colors.error;
          iconBgColor = colors.error + '20';
        } else if (insight.type === 'opportunity') {
          backgroundColor = colors.success + '10';
          borderColor = colors.success;
          iconBgColor = colors.success + '20';
        } else {
          backgroundColor = colors.primary + '10';
          borderColor = colors.primary;
          iconBgColor = colors.primary + '20';
        }

        return (
          <View
            key={idx}
            style={[
              styles.insightCard,
              { backgroundColor, borderColor, borderWidth: 1 },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
              <Text style={styles.icon}>{insight.icon}</Text>
            </View>

            <View style={styles.content}>
              <Text style={[styles.insightTitle, { color: colors.foreground }]}>
                {insight.title}
              </Text>
              <Text style={[styles.insightDescription, { color: colors.muted }]}>
                {insight.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
