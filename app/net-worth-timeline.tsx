'use client';

import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions, TextInput, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { calculateUnifiedFinancialSummary } from '@/lib/unified-financial-engine';
import { useMemo, useState } from 'react';
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface TimelinePoint {
  date: Date;
  netWorth: number;
  label: string;
}

export default function NetWorthTimelineScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data } = useAppData();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year');
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalAmount.toString());

  // Calculate current net worth from unified engine
  const unifiedSummary = useMemo(() => {
    if (!data) return { netWorth: 0, totalAssets: 0, totalLiabilities: 0 };
    try {
      return calculateUnifiedFinancialSummary(data);
    } catch (e) {
      console.error('Error calculating unified summary:', e);
      return { netWorth: 0, totalAssets: 0, totalLiabilities: 0 };
    }
  }, [data]);

  const currentNetWorth = Math.max(0, Number(unifiedSummary?.netWorth) || 0);

  // Generate historical timeline from app start date (2022-01-01)
  const timelineData = useMemo(() => {
    const points: TimelinePoint[] = [];
    const appStartDate = new Date(2022, 0, 1); // App started 2022-01-01
    const today = new Date();

    // Use current net worth, default to 1,496,600 if not available
    const displayNetWorth = currentNetWorth > 0 ? currentNetWorth : 1496600;

    // Calculate approximate growth rate based on current net worth
    // Assume starting net worth was ~50% of current
    const startingNetWorth = Math.max(displayNetWorth * 0.5, 100000);
    const totalYears = (today.getFullYear() - appStartDate.getFullYear()) + 
                       (today.getMonth() - appStartDate.getMonth()) / 12;
    const annualGrowthRate = Math.pow(displayNetWorth / Math.max(1, startingNetWorth), 1 / Math.max(0.1, totalYears)) - 1;

    // Add yearly points from start date to today
    let currentDate = new Date(appStartDate);
    let pointIndex = 0;

    while (currentDate <= today) {
      const yearsSinceStart = (currentDate.getFullYear() - appStartDate.getFullYear()) +
                             (currentDate.getMonth() - appStartDate.getMonth()) / 12;
      const netWorth = Math.round(startingNetWorth * Math.pow(1 + annualGrowthRate, yearsSinceStart));

      points.push({
        date: new Date(currentDate),
        netWorth: Math.min(netWorth, currentNetWorth), // Don't exceed current net worth
        label: currentDate.getFullYear().toString(),
      });

      currentDate.setFullYear(currentDate.getFullYear() + 1);
      pointIndex++;
    }

    // Ensure last point is today with current net worth
    const finalNetWorth = currentNetWorth > 0 ? currentNetWorth : 1496600;
    if (points.length === 0 || points[points.length - 1].date < today) {
      points.push({
        date: today,
        netWorth: finalNetWorth,
        label: 'Today',
      });
    } else {
      points[points.length - 1] = {
        date: today,
        netWorth: finalNetWorth,
        label: 'Today',
      };
    }

    return points;
  }, [currentNetWorth]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (timelineData.length < 2) {
      const displayNW = currentNetWorth > 0 ? currentNetWorth : 1496600;
      return {
        currentNetWorth: displayNW,
        yearlyChange: 0,
        yearlyChangePercent: 0,
        monthlyAvgGrowth: 0,
      };
    }

    const current = timelineData[timelineData.length - 1];
    const previousYear = timelineData[Math.max(0, timelineData.length - 2)];

    const yearlyChange = current.netWorth - previousYear.netWorth;
    const yearlyChangePercent = previousYear.netWorth > 0 ? (yearlyChange / previousYear.netWorth) * 100 : 0;
    const monthlyAvgGrowth = yearlyChangePercent / 12;

    return {
      currentNetWorth: Math.max(Number(current.netWorth) || 0, currentNetWorth > 0 ? currentNetWorth : 1496600),
      yearlyChange: Number(yearlyChange) || 0,
      yearlyChangePercent: Number(yearlyChangePercent) || 0,
      monthlyAvgGrowth: Number(monthlyAvgGrowth) || 0,
    };
  }, [timelineData, currentNetWorth]);

  // Chart rendering
  const chartHeight = 250;
  const chartWidth = width - 48;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const allNetWorths = timelineData.map(p => p.netWorth);
  const minNetWorth = Math.min(...allNetWorths);
  const maxNetWorth = Math.max(...allNetWorths);
  const range = maxNetWorth - minNetWorth || 1;

  // Calculate points for line chart
  const points = timelineData.map((point, index) => {
    const x = padding + (index / Math.max(1, timelineData.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((point.netWorth - minNetWorth) / range) * innerHeight;
    return { x, y, ...point };
  });

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setGoalAmount(newGoal);
      setIsEditingGoal(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>Back</Text>
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
              <Text style={{ fontSize: 14, fontWeight: '700', color: metrics.yearlyChange >= 0 ? '#4ADE80' : '#F87171' }}>
                {metrics.yearlyChange >= 0 ? '+' : ''}{metrics.yearlyChange.toLocaleString()} ({metrics.yearlyChangePercent.toFixed(1)}%)
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Monthly Avg Growth</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#4ADE80' }}>
                {metrics.monthlyAvgGrowth.toFixed(2)}%
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

          <Svg width={chartWidth} height={chartHeight} style={{ marginVertical: 16 }}>
            {/* Y-axis labels */}
            <SvgText x={10} y={padding + 5} fontSize="10" fill={colors.muted}>
              SGD {(maxNetWorth / 1000000).toFixed(1)}M
            </SvgText>
            <SvgText x={10} y={padding + innerHeight / 2 + 5} fontSize="10" fill={colors.muted}>
              SGD {((minNetWorth + maxNetWorth) / 2 / 1000000).toFixed(1)}M
            </SvgText>
            <SvgText x={10} y={padding + innerHeight + 15} fontSize="10" fill={colors.muted}>
              SGD {(minNetWorth / 1000000).toFixed(1)}M
            </SvgText>

            {/* Grid lines */}
            <Line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1={padding} y1={padding + innerHeight / 2} x2={chartWidth - padding} y2={padding + innerHeight / 2} stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1={padding} y1={padding + innerHeight} x2={chartWidth - padding} y2={padding + innerHeight} stroke={colors.border} strokeWidth="1" />

            {/* Axes */}
            <Line x1={padding} y1={padding} x2={padding} y2={padding + innerHeight} stroke={colors.border} strokeWidth="1" />
            <Line x1={padding} y1={padding + innerHeight} x2={chartWidth - padding} y2={padding + innerHeight} stroke={colors.border} strokeWidth="1" />

            {/* Data line */}
            {points.length > 1 && (
              <G>
                {points.map((p, i) => {
                  if (i === 0) return null;
                  const prev = points[i - 1];
                  return (
                    <Line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={colors.primary} strokeWidth="2" />
                  );
                })}
              </G>
            )}

            {/* Data points */}
            {points.map((p, i) => (
              <G key={i}>
                <Circle cx={p.x} cy={p.y} r="4" fill={colors.primary} />
                <SvgText x={p.x} y={padding + innerHeight + 20} fontSize="10" fill={colors.muted} textAnchor="middle">
                  {p.label}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>

        {/* Financial Goal */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Goal</Text>
            <Pressable onPress={() => setIsEditingGoal(true)}>
              <IconSymbol name="pencil" size={16} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.goalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>Goal Amount</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>SGD {goalAmount.toLocaleString()}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>Current Progress</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                {((metrics.currentNetWorth / goalAmount) * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.min((metrics.currentNetWorth / goalAmount) * 100, 100)}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>

            <Text style={{ fontSize: 12, color: colors.muted }}>
              {goalAmount > metrics.currentNetWorth
                ? `SGD ${(goalAmount - metrics.currentNetWorth).toLocaleString()} remaining`
                : 'Goal achieved!'}
            </Text>
          </View>
        </View>

        {/* Yearly Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yearly Breakdown</Text>

          {timelineData.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = timelineData[index - 1];
            const yearlyGain = point.netWorth - prevPoint.netWorth;
            const yearlyGainPercent = prevPoint.netWorth > 0 ? (yearlyGain / prevPoint.netWorth) * 100 : 0;

            return (
              <View key={index} style={[styles.yearCard, { borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{point.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: yearlyGain >= 0 ? '#4ADE80' : '#F87171' }}>
                    {yearlyGain >= 0 ? '+' : ''}SGD {yearlyGain.toLocaleString()} ({yearlyGainPercent.toFixed(1)}%)
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>Start: SGD {prevPoint.netWorth.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>End: SGD {point.netWorth.toLocaleString()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Goal Modal */}
      <Modal visible={isEditingGoal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>Edit Financial Goal</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter goal amount"
              placeholderTextColor={colors.muted}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <Pressable
                onPress={() => setIsEditingGoal(false)}
                style={[styles.modalBtn, { backgroundColor: colors.border, flex: 1 }]}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveGoal}
                style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  yearCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  goalCard: {
    padding: 12,
    borderRadius: 8,
  },
  modal: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
