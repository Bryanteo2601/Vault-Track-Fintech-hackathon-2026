import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  generateSampleNetWorthData,
  calculateTimelineMetrics,
  generateYearlyBreakdown,
  getTimelineData,
  type NetWorthTrend,
} from '@/lib/timeline-types';

const { width } = Dimensions.get('window');

export default function NetWorthTimelineScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year');

  // Generate timeline data
  const timelineData = useMemo(() => {
    const rawData = generateSampleNetWorthData();
    return getTimelineData(rawData, period);
  }, [period]);

  const metrics = timelineData.metrics;
  const yearlyData = timelineData.yearlyBreakdown;

  // Find min/max for chart scaling
  const allNetWorths = timelineData.dataPoints.map(d => d.netWorth);
  const minNetWorth = Math.min(...allNetWorths);
  const maxNetWorth = Math.max(...allNetWorths);
  const range = maxNetWorth - minNetWorth;

  // Simple line chart rendering
  const chartHeight = 200;
  const chartWidth = width - 48;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconSymbol name="chevron.left" size={24} color={colors.accent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }}>Back</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>Net Worth Timeline</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>Track your wealth growth over time</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Current Net Worth */}
        <View style={[styles.currentCard, { backgroundColor: colors.primary }]}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Current Net Worth</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: 'white', marginBottom: 8 }}>
            SGD {metrics.currentNetWorth.toLocaleString()}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>12-Month Change</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: metrics.netWorthChange >= 0 ? '#4ADE80' : '#F87171' }}>
                {metrics.netWorthChange >= 0 ? '+' : ''}{metrics.netWorthChange.toLocaleString()} ({metrics.netWorthChangePercent.toFixed(1)}%)
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Monthly Avg Growth</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#4ADE80' }}>
                {(metrics.averageMonthlyGrowth * 100).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 16 }}>
          {(['month', 'quarter', 'year'] as const).map(p => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: period === p ? colors.primary : colors.surface,
                  borderColor: period === p ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: period === p ? 'white' : colors.foreground, textTransform: 'capitalize' }}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Timeline Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Net Worth Over Time</Text>
          <View style={{ height: chartHeight, marginVertical: 16, position: 'relative' }}>
            {/* Y-axis labels */}
            <View style={{ position: 'absolute', left: 0, top: 0, height: chartHeight, justifyContent: 'space-between', paddingRight: 8 }}>
              <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'right' }}>SGD {(maxNetWorth / 1000).toFixed(0)}K</Text>
              <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'right' }}>SGD {((maxNetWorth + minNetWorth) / 2 / 1000).toFixed(0)}K</Text>
              <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'right' }}>SGD {(minNetWorth / 1000).toFixed(0)}K</Text>
            </View>

            {/* Chart area */}
            <View style={{ flex: 1, marginLeft: 50, position: 'relative' }}>
              {/* Grid lines */}
              {[0, 0.5, 1].map((ratio, idx) => (
                <View
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: `${ratio * 100}%`,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: colors.border,
                    opacity: 0.3,
                  }}
                />
              ))}

              {/* Data points and line */}
              <svg style={{ width: '100%', height: '100%' }} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                {/* Line connecting points */}
                {timelineData.dataPoints.length > 1 && (
                  <polyline
                    points={timelineData.dataPoints
                      .map((point, idx) => {
                        const x = (idx / (timelineData.dataPoints.length - 1)) * chartWidth;
                        const y = chartHeight - ((point.netWorth - minNetWorth) / range) * chartHeight;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="2"
                  />
                )}

                {/* Data points */}
                {timelineData.dataPoints.map((point, idx) => {
                  const x = (idx / (timelineData.dataPoints.length - 1)) * chartWidth;
                  const y = chartHeight - ((point.netWorth - minNetWorth) / range) * chartHeight;
                  return (
                    <circle key={idx} cx={x} cy={y} r="3" fill={colors.primary} />
                  );
                })}
              </svg>
            </View>
          </View>

          {/* X-axis labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 50, marginTop: 8 }}>
            {timelineData.dataPoints.length > 0 && (
              <>
                <Text style={{ fontSize: 10, color: colors.muted }}>{timelineData.dataPoints[0].year}</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>
                  {timelineData.dataPoints[Math.floor(timelineData.dataPoints.length / 2)].year}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>
                  {timelineData.dataPoints[timelineData.dataPoints.length - 1].year}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Projections */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Projections</Text>
        <View style={[styles.projectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Projected in 1 Year</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
              SGD {metrics.projectedNetWorth1Year.toLocaleString()}
            </Text>
          </View>
          <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Projected in 5 Years</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
              SGD {metrics.projectedNetWorth5Years.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Financial Goal */}
        {metrics.yearsToFinancialGoal > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Goal</Text>
            <View style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>Goal Amount</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>SGD {metrics.financialGoal.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>Current Progress</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                  {((metrics.currentNetWorth / metrics.financialGoal) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (metrics.currentNetWorth / metrics.financialGoal) * 100)}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                Estimated {metrics.yearsToFinancialGoal.toFixed(1)} years to reach goal
              </Text>
            </View>
          </>
        )}

        {/* Yearly Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yearly Breakdown</Text>
        {yearlyData.map((year, idx) => (
          <View key={idx} style={[styles.yearCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>{year.year}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: year.yearlyGrowth >= 0 ? '#4ADE80' : '#F87171' }}>
                {year.yearlyGrowth >= 0 ? '+' : ''}SGD {year.yearlyGrowth.toLocaleString()} ({year.yearlyGrowthPercent.toFixed(1)}%)
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>Start: SGD {year.startNetWorth.toLocaleString()}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>End: SGD {year.endNetWorth.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: colors.muted }}>High: SGD {year.highestMonth.toLocaleString()}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>Low: SGD {year.lowestMonth.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  currentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  projectionCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  goalCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  yearCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
});
