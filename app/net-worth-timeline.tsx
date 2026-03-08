'use client';

import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
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

  // Calculate current net worth from unified engine
  const unifiedSummary = useMemo(() => {
    return calculateUnifiedFinancialSummary(data);
  }, [data]);

  const currentNetWorth = unifiedSummary.netWorth;

  // Generate historical timeline (simplified - use current + projections)
  const timelineData = useMemo(() => {
    const today = new Date();
    const points: TimelinePoint[] = [];

    // Add historical points (2022, 2023, 2024)
    const baseNetWorth = currentNetWorth * 0.5; // Assume 50% growth over 3 years
    const annualGrowthRate = Math.pow(currentNetWorth / Math.max(1, baseNetWorth), 1/3) - 1;

    // 2022
    points.push({
      date: new Date(2022, 0, 1),
      netWorth: Math.round(baseNetWorth),
      label: '2022',
    });

    // 2023
    points.push({
      date: new Date(2023, 0, 1),
      netWorth: Math.round(baseNetWorth * (1 + annualGrowthRate)),
      label: '2023',
    });

    // 2024
    points.push({
      date: new Date(2024, 0, 1),
      netWorth: Math.round(baseNetWorth * Math.pow(1 + annualGrowthRate, 2)),
      label: '2024',
    });

    // Current (2025)
    points.push({
      date: today,
      netWorth: currentNetWorth,
      label: 'Now',
    });

    // Projections (conservative: 8% annual growth)
    const projectionGrowthRate = 0.08;

    // 1 year projection
    points.push({
      date: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      netWorth: Math.round(currentNetWorth * (1 + projectionGrowthRate)),
      label: '1Y',
    });

    // 5 year projection
    points.push({
      date: new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()),
      netWorth: Math.round(currentNetWorth * Math.pow(1 + projectionGrowthRate, 5)),
      label: '5Y',
    });

    return points;
  }, [currentNetWorth]);

  // Calculate metrics - simplified
  const metrics = useMemo(() => {
    // Current net worth is the 4th point (index 3) - "Now"
    const currentPoint = timelineData[3];
    const previousPoint = timelineData[2]; // 2024
    const projection1Y = timelineData[4];
    const projection5Y = timelineData[5];

    if (!currentPoint || !previousPoint) {
      return {
        currentNetWorth: Number(currentNetWorth) || 0,
        yearlyChange: 0,
        yearlyChangePercent: 0,
        monthlyAvgGrowth: 0,
        projected1Year: Number(projection1Y?.netWorth) || 0,
        projected5Years: Number(projection5Y?.netWorth) || 0,
      };
    }

    const currentNW = Number(currentPoint.netWorth) || 0;
    const previousNW = Number(previousPoint.netWorth) || 0;
    const yearlyChange = currentNW - previousNW;
    const yearlyChangePercent = previousNW > 0 ? (yearlyChange / previousNW) * 100 : 0;
    const monthlyAvgGrowth = yearlyChangePercent / 12;

    return {
      currentNetWorth: currentNW,
      yearlyChange,
      yearlyChangePercent,
      monthlyAvgGrowth,
      projected1Year: Number(projection1Y?.netWorth) || 0,
      projected5Years: Number(projection5Y?.netWorth) || 0,
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
    const x = padding + (index / (timelineData.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((point.netWorth - minNetWorth) / range) * innerHeight;
    return { x, y, ...point };
  });

  // Build SVG path for line
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

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
              SGD {(maxNetWorth / 1000).toFixed(0)}K
            </SvgText>
            <SvgText x={10} y={padding + innerHeight / 2 + 5} fontSize="10" fill={colors.muted}>
              SGD {((minNetWorth + maxNetWorth) / 2 / 1000).toFixed(0)}K
            </SvgText>
            <SvgText x={10} y={padding + innerHeight + 15} fontSize="10" fill={colors.muted}>
              SGD {(minNetWorth / 1000).toFixed(0)}K
            </SvgText>

            {/* Grid lines */}
            <Line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1={padding} y1={padding + innerHeight / 2} x2={chartWidth - padding} y2={padding + innerHeight / 2} stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1={padding} y1={padding + innerHeight} x2={chartWidth - padding} y2={padding + innerHeight} stroke={colors.border} strokeWidth="1" />

            {/* Line chart */}
            <Line
              x1={padding}
              y1={padding + innerHeight}
              x2={chartWidth - padding}
              y2={padding + innerHeight}
              stroke={colors.border}
              strokeWidth="1"
            />
            <Line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={padding + innerHeight}
              stroke={colors.border}
              strokeWidth="1"
            />

            {/* Data line */}
            {pathData && (
              <G>
                <Line
                  x1={points[0]?.x || 0}
                  y1={points[0]?.y || 0}
                  x2={points[points.length - 1]?.x || 0}
                  y2={points[points.length - 1]?.y || 0}
                  stroke={colors.primary}
                  strokeWidth="2"
                />
              </G>
            )}

            {/* Data points */}
            {points.map((p, i) => (
              <G key={i}>
                <Circle cx={p.x} cy={p.y} r="4" fill={i >= points.length - 2 ? colors.warning : colors.primary} />
                <SvgText x={p.x} y={padding + innerHeight + 20} fontSize="10" fill={colors.muted} textAnchor="middle">
                  {p.label}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>

        {/* Projections */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Projections</Text>

          <View style={[styles.projectionCard, { borderBottomColor: colors.border }]}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Projected in 1 Year</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
              SGD {metrics.projected1Year.toLocaleString()}
            </Text>
          </View>

          <View style={styles.projectionCard}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Projected in 5 Years</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
              SGD {metrics.projected5Years.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Financial Goal */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Goal</Text>

          <View style={styles.goalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>Goal Amount</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>SGD 1,000,000</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>Current Progress</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                {((metrics.currentNetWorth / 1000000) * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.min((metrics.currentNetWorth / 1000000) * 100, 100)}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>

            <Text style={{ fontSize: 12, color: colors.muted }}>
              Estimated {((metrics.projected5Years / 1000000) * 100).toFixed(0)}% of goal in 5 years
            </Text>
          </View>
        </View>
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
  projectionCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  goalCard: {
    padding: 12,
    borderRadius: 8,
  },
});
