import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GrowthMetrics, formatCAGR, getGrowthStatus } from '@/lib/private-asset-analytics';
import { useColors } from '@/hooks/use-colors';
import { formatCurrency } from '@/lib/store';

interface PortfolioGrowthChartProps {
  metrics: GrowthMetrics;
}

export function PortfolioGrowthChart({ metrics }: PortfolioGrowthChartProps) {
  const colors = useColors();

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

  // Calculate simple bar chart visualization
  const chartData = useMemo(() => {
    if (metrics.timeSeriesData.length === 0) return [];
    
    // Use last 6 data points for readability
    const recentData = metrics.timeSeriesData.slice(-6);
    const maxValue = Math.max(...recentData.map(d => d.value), 1);
    
    return recentData.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: point.value,
      height: (point.value / maxValue) * 150,
    }));
  }, [metrics.timeSeriesData]);

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

      {/* Chart */}
      {metrics.timeSeriesData.length >= 2 ? (
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            <View style={styles.barsContainer}>
              {chartData.map((bar, index) => (
                <View key={index} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: bar.height,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: colors.muted }]}>{bar.date}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={[styles.chartNote, { color: colors.muted }]}>
            Last {chartData.length} valuation points
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
  chart: {
    height: 180,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
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
