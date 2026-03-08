import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { GrowthMetrics, formatCAGR, getGrowthStatus } from '@/lib/private-asset-analytics';
import { useColors } from '@/hooks/use-colors';
import { formatCurrency } from '@/lib/store';
import Svg, { Line, Circle, Text as SvgText, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';

interface PortfolioGrowthChartProps {
  metrics: GrowthMetrics;
}

interface ChartPoint {
  date: string;
  value: number;
  type: 'historical' | 'projection';
  projectionType?: '1Y' | '3Y' | '5Y';
  fullDate?: string;
}

export function PortfolioGrowthChart({ metrics }: PortfolioGrowthChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;
  const chartHeight = 250;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };

  const growthStatus = getGrowthStatus(metrics.cagr);
  const statusColors = {
    excellent: '#22C55E',
    good: '#10B981',
    moderate: '#F59E0B',
    poor: '#EF5350',
    negative: '#EF5350',
  };

  const statusLabels = {
    excellent: 'Excellent Growth',
    good: 'Good Growth',
    moderate: 'Moderate Growth',
    poor: 'Slow Growth',
    negative: 'Declining',
  };

  // Build chart data with historical points and projections
  const chartData = useMemo(() => {
    if (metrics.timeSeriesData.length === 0) return [];

    const data: ChartPoint[] = [];

    // Add historical data points
    metrics.timeSeriesData.forEach((point) => {
      const date = new Date(point.date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      data.push({
        date: label,
        value: point.value,
        type: 'historical',
        fullDate: point.date,
      });
    });

    // Add 1-year projection
    if (metrics.projections.oneYear > 0) {
      data.push({
        date: '1Y',
        value: metrics.projections.oneYear,
        type: 'projection',
        projectionType: '1Y',
      });
    }

    // Add 3-year projection
    if (metrics.projections.threeYear > 0) {
      data.push({
        date: '3Y',
        value: metrics.projections.threeYear,
        type: 'projection',
        projectionType: '3Y',
      });
    }

    // Add 5-year projection
    if (metrics.projections.fiveYear > 0) {
      data.push({
        date: '5Y',
        value: metrics.projections.fiveYear,
        type: 'projection',
        projectionType: '5Y',
      });
    }

    return data;
  }, [metrics.timeSeriesData, metrics.projections]);

  // Calculate chart dimensions
  const chartArea = {
    width: chartWidth - padding.left - padding.right,
    height: chartHeight - padding.top - padding.bottom,
  };

  // Calculate Y-axis domain
  const allValues = chartData.map(d => d.value).filter(v => v > 0);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const yAxisPadding = (maxValue - minValue) * 0.15;
  const yMin = Math.max(0, minValue - yAxisPadding);
  const yMax = maxValue + yAxisPadding;

  // Convert data to SVG coordinates
  const points = chartData.map((point, index) => {
    const x = padding.left + (index / (chartData.length - 1)) * chartArea.width;
    const y = padding.top + chartArea.height - ((point.value - yMin) / (yMax - yMin)) * chartArea.height;
    return { ...point, x, y, index };
  });

  // Generate line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

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
        {metrics.timeSeriesData.length > 0 && (
          <View style={[styles.statusBadge, { backgroundColor: statusColors[growthStatus] }]}>
            <Text style={styles.statusText}>{statusLabels[growthStatus]}</Text>
          </View>
        )}
      </View>

      {/* Line Chart */}
      {chartData.length >= 2 ? (
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

              {/* Line path */}
              <Polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={colors.primary}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((point, index) => {
                const isProjection = point.type === 'projection';
                const dotRadius = isProjection ? 5 : 4;
                const dotColor = isProjection ? colors.warning : colors.primary;

                return (
                  <Circle
                    key={`dot-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={dotRadius}
                    fill={dotColor}
                    stroke={colors.background}
                    strokeWidth="2"
                  />
                );
              })}

              {/* X-axis labels */}
              {points.map((point, index) => {
                const isEveryOther = index % 2 === 0 || point.type === 'projection';
                if (!isEveryOther && chartData.length > 6) return null;

                return (
                  <SvgText
                    key={`x-label-${index}`}
                    x={point.x}
                    y={padding.top + chartArea.height + 20}
                    fontSize="11"
                    fill={colors.muted}
                    textAnchor="middle"
                  >
                    {point.date}
                  </SvgText>
                );
              })}
            </Svg>
          </ScrollView>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.foreground }]}>Historical</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.legendText, { color: colors.foreground }]}>Projection</Text>
            </View>
          </View>

          <Text style={[styles.chartNote, { color: colors.muted }]}>
            {metrics.timeSeriesData.length} historical points + 3 projections (1Y, 3Y, 5Y)
          </Text>
        </View>
      ) : (
        <View style={[styles.emptyChart, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Add more valuations to see growth chart
          </Text>
        </View>
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* CAGR */}
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
            {metrics.projections.oneYear > metrics.totalValue ? '+' : ''}
            {formatCurrency(metrics.projections.oneYear - metrics.totalValue)}
          </Text>
        </View>

        {/* 3Y Projection */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>3-Year Projection</Text>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {formatCurrency(metrics.projections.threeYear)}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.muted }]}>
            {metrics.projections.threeYear > metrics.totalValue ? '+' : ''}
            {formatCurrency(metrics.projections.threeYear - metrics.totalValue)}
          </Text>
        </View>

        {/* 5Y Projection */}
        <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>5-Year Projection</Text>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {formatCurrency(metrics.projections.fiveYear)}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.muted }]}>
            {metrics.projections.fiveYear > metrics.totalValue ? '+' : ''}
            {formatCurrency(metrics.projections.fiveYear - metrics.totalValue)}
          </Text>
        </View>
      </View>

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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
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
  disclaimer: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
