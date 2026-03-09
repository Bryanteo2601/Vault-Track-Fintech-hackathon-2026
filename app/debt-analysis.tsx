import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { generateDebtAnalysis } from '@/lib/metric-insight-engine';

const { width } = Dimensions.get('window');

export default function DebtAnalysisScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data } = useAppData();

  const analysis = useMemo(() => generateDebtAnalysis(data), [data]);

  const statusColor = analysis.status === 'critical' ? colors.error : analysis.status === 'warning' ? colors.warning : colors.success;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Debt Analysis</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Detailed breakdown & recommendations</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        {/* Current Metric Card */}
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: statusColor, borderLeftWidth: 4 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Debt-to-Asset Ratio</Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: statusColor }}>{analysis.currentValue.toFixed(0)}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Target</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.primary }}>{analysis.targetValue}%</Text>
            </View>
          </View>
          <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${Math.min((analysis.currentValue / 100) * 100, 100)}%`,
                backgroundColor: statusColor,
              }}
            />
          </View>
        </View>

        {/* Debt Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Debt Breakdown</Text>
        {analysis.breakdown.items.map((item, idx) => (
          <View key={item.id} style={[styles.debtItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {((item.outstandingAmount / analysis.breakdown.total) * 100).toFixed(1)}% of total debt
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>Outstanding Amount</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>SGD {item.outstandingAmount.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>Monthly Payment</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>SGD {item.monthlyPayment.toLocaleString()}</Text>
              </View>
              {item.interestRate && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>Interest Rate</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{item.interestRate.toFixed(2)}%</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Summary Stats */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Summary</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Total Debt</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>SGD {analysis.breakdown.total.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Monthly Payment</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>SGD {analysis.breakdown.totalMonthlyPayment.toLocaleString()}</Text>
          </View>
        </View>

        {/* Insights */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Insights</Text>
        {analysis.insights.map(insight => (
          <View key={insight.id} style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={{ fontSize: 20 }}>{insight.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{insight.title}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 }}>{insight.description}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Recommendations */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommended Actions</Text>
        {analysis.recommendations.map(rec => (
          <View
            key={rec.id}
            style={[
              styles.recommendationCard,
              {
                backgroundColor: colors.surface,
                borderColor: rec.priority === 'high' ? colors.error : rec.priority === 'medium' ? colors.warning : colors.success,
                borderLeftWidth: 4,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 20 }}>{rec.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 }}>{rec.title}</Text>
                  <View
                    style={{
                      backgroundColor:
                        rec.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color:
                          rec.priority === 'high' ? colors.error : rec.priority === 'medium' ? colors.warning : colors.success,
                        textTransform: 'capitalize',
                      }}
                    >
                      {rec.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, lineHeight: 18 }}>{rec.description}</Text>
            {rec.estimatedImpact && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>Estimated Impact: {rec.estimatedImpact}</Text>
                {rec.timeframe && <Text style={{ fontSize: 11, color: colors.muted }}>Timeframe: {rec.timeframe}</Text>}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  debtItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  insightCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
});
