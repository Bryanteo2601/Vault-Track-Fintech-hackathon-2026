import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { DiversificationMetrics, getDiversificationLevelDescription } from '@/lib/diversification-analyzer';

interface DiversificationCardProps {
  metrics: DiversificationMetrics;
}

export function DiversificationCard({ metrics }: DiversificationCardProps) {
  const colors = useAppColors();
  const levelDesc = getDiversificationLevelDescription(metrics.level);

  const getScoreColor = () => {
    if (metrics.level === 'well-diversified') return colors.success;
    if (metrics.level === 'moderate') return colors.warning;
    return colors.error;
  };

  const getProgressBarColor = () => {
    const score = metrics.diversificationScore;
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
          Diversification Analysis
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {levelDesc.description}
        </Text>
      </View>

      {/* Score Section */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.muted }}>Diversification Score</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: getScoreColor() }}>
            {metrics.diversificationScore.toFixed(1)}/100
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${Math.min(metrics.diversificationScore, 100)}%`,
              backgroundColor: getProgressBarColor(),
            }}
          />
        </View>
      </View>

      {/* Level Badge */}
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: getScoreColor() + '20',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: getScoreColor() }}>
          {levelDesc.label} • {levelDesc.riskLevel} Risk
        </Text>
      </View>

      {/* HHI Value */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 12 }}>
        <Text style={{ fontSize: 11, color: colors.muted }}>Herfindahl-Hirschman Index</Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>
          {metrics.hhi.toFixed(4)}
        </Text>
      </View>

      {/* Top Holdings */}
      {metrics.topHoldings.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Top Holdings
          </Text>
          {metrics.topHoldings.map((holding, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 10, color: colors.muted }}>{holding.assetClass}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ height: 4, width: 40, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(holding.weight * 100, 100)}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: colors.foreground, width: 40, textAlign: 'right' }}>
                  {holding.percentage}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Recommendations
          </Text>
          {metrics.recommendations.map((rec, idx) => (
            <View key={idx} style={{ marginBottom: 6, flexDirection: 'row', gap: 8 }}>
              <Text style={{ fontSize: 10, color: colors.muted }}>•</Text>
              <Text style={{ fontSize: 10, color: colors.muted, flex: 1, lineHeight: 14 }}>
                {rec}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
});
