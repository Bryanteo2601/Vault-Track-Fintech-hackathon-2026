import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { GrowthMetrics, formatCAGR, getGrowthStatus } from '@/lib/private-asset-analytics';
import { useColors } from '@/hooks/use-colors';
import { formatCurrency } from '@/lib/store';
import Svg, { Line, Circle, Text as SvgText, Polyline } from 'react-native-svg';

interface PortfolioGrowthChartProps {
  metrics: GrowthMetrics;
}

interface ProjectionPoint {
  label: string;
  value: number;
  period: '1Y' | '3Y' | '5Y';
}

export function PortfolioGrowthChart({ metrics }: PortfolioGrowthChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;
  const chartHeight = 250;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };

  const growthStatus = getGrowthStatus(metrics.cagr);
  
  // NEW COLOR LOGIC: Green if positive, Red if not positive
  const statusColors = {
    positive: '#22C55E',  // Green
    negative: '#EF5350',  // Red
  };

  // Removed "Slow Growth" - only show if positive or negative
  const statusLabels = {
    positive: 'Positive Growth',
    negative: 'Negative Growth',
  };

  // Build projection-only data
  const projectionData = useMemo(() => {
    const data: ProjectionPoint[] = [];

    if (metrics.projections.oneYear > 0) {
      data.push({
        label: '1Y',
        value: metrics.projections.oneYear,
        period: '1Y',
      });
    }

    if (metrics.projections.threeYear > 0) {
      data.push({
        label: '3Y',
        value: metrics.projections.threeYear,
        period: '3Y',
      });
    }

    if (metrics.projections.fiveYear > 0) {
      data.push({
        label: '5Y',
        value: metrics.projections.fiveYear,
        period: '5Y',
      });
    }

    return data;
  }, [metrics.projections]);

  // Calculate chart dimensions
  const chartArea = {
    width: chartWidth - padding.left - padding.right,
    height: chartHeight - padding.top - padding.bottom,
  };

  // Calculate Y-axis domain
  const allValues = projectionData.map(d => d.value).filter(v => v > 0);
  const minValue = metrics.totalValue; // Start from current value
  const maxValue = Math.max(...allValues);
  const yAxisPadding = (maxValue - minValue) * 0.15;
  const yMin = Math.max(0, minValue - yAxisPadding);
  const yMax = maxValue + yAxisPadding;

  // Convert data to SVG coordinates
  const points = projectionData.map((point, index) => {
    const x = padding.left + (index / (projectionData.length - 1)) * chartArea.width;
    const y = padding.top + chartArea.height - ((point.value - yMin) / (yMax - yMin)) * chartArea.height;
    return { ...point, x, y, index };
  });

  // Y-axis labels (5 ticks)
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const ratio = i / (yTicks - 1);
    return yMin + ratio * (yMax - yMin);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Wealth Growth Analysis</Text>
        {metrics.methodology !== 'insufficient' && (
          <View style={[styles.statusBadge, { backgroundColor: statusColors[growthStatus] }]}>
            <Text style={styles.statusText}>{statusLabels[growthStatus]}</Text>
          </View>
        )}
      </View>

      {/* Line Chart - Projections Only */}
      {projectionData.length >= 2 ? (
        <View style={styles.chartContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
            <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
              {/* Grid lines */}
              {yTickValues.map((value, i) => {
                const y = padding.top + (chartArea.height * (1 - (value - yMin) / (yMax - yMin)));
                return (
                  <Line
                    key={`grid-${i}`}
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartArea.width}
                    y2={y}
                    stroke={colors.border}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  />
                );
              })}

              {/* Y-axis */}
              <Line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + chartArea.height}
                stroke={colors.muted}
                strokeWidth="1"
              />

              {/* X-axis */}
              <Line
                x1={padding.left}
                y1={padding.top + chartArea.height}
                x2={padding.left + chartArea.width}
                y2={padding.top + chartArea.height}
                stroke={colors.muted}
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              {yTickValues.map((value, i) => {
                const y = padding.top + (chartArea.height * (1 - (value - yMin) / (yMax - yMin)));
                return (
                  <SvgText
                    key={`y-label-${i}`}
                    x={padding.left - 10}
                    y={y + 4}
                    fontSize="11"
                    fill={colors.muted}
                    textAnchor="end"
                  >
                    ${(value / 1000).toFixed(0)}k
                  </SvgText>
                );
              })}

              {/* Line path connecting projections */}
              <Polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={statusColors[growthStatus]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Projection points */}
              {points.map((point, index) => (
                <Circle
                  key={`dot-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={statusColors[growthStatus]}
                  stroke={colors.background}
                  strokeWidth="2"
                />
              ))}

              {/* X-axis labels - Projection periods */}
              {points.map((point, index) => (
                <SvgText
                  key={`x-label-${index}`}
                  x={point.x}
                  y={padding.top + chartArea.height + 20}
                  fontSize="12"
                  fontWeight="600"
                  fill={statusColors[growthStatus]}
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              ))}
            </Svg>
          </ScrollView>

          <Text style={[styles.chartNote, { color: colors.muted }]}>
            Projected wealth growth over 1, 3, and 5 years
          </Text>
        </View>
      ) : (
        <View style={[styles.emptyChart, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Insufficient data for projections
          </Text>
        </View>
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* CAGR - Green if positive, Red if not positive */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>Annualized Growth</Text>
          <Text style={[styles.metricValue, { color: statusColors[growthStatus] }]}>
            {formatCAGR(metrics.cagr)}
          </Text>
          {metrics.yearsElapsed > 0 && (
            <Text style={[styles.metricSubtext, { color: colors.muted }]}>
              {metrics.yearsElapsed.toFixed(1)} years
            </Text>
          )}
        </View>

        {/* 1Y Projection */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>1-Year Projection</Text>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {formatCurrency(metrics.projections.oneYear)}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.muted }]}>
            {metrics.projectionGains.oneYear > 0 ? '+' : ''}
            {formatCurrency(metrics.projectionGains.oneYear)}
          </Text>
        </View>

        {/* 3Y Projection */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>3-Year Projection</Text>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {formatCurrency(metrics.projections.threeYear)}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.muted }]}>
            {metrics.projectionGains.threeYear > 0 ? '+' : ''}
            {formatCurrency(metrics.projectionGains.threeYear)}
          </Text>
        </View>

        {/* 5Y Projection */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>5-Year Projection</Text>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {formatCurrency(metrics.projections.fiveYear)}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.muted }]}>
            {metrics.projectionGains.fiveYear > 0 ? '+' : ''}
            {formatCurrency(metrics.projectionGains.fiveYear)}
          </Text>
        </View>
      </View>

      {/* Methodology Label */}
      <Text style={[styles.methodologyLabel, { color: colors.muted }]}>
        {metrics.methodologyLabel}
      </Text>

      {/* Disclaimer */}
      <Text style={[styles.disclaimer, { color: colors.muted }]}>
        Projections are estimates based on historical CAGR and assume consistent growth rates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 12,
  },
  scrollContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  chartNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyChart: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
  },
  methodologyLabel: {
    fontSize: 11,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  disclaimer: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
