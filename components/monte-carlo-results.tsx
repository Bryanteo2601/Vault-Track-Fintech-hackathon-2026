import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { MonteCarloSimulation, generateHistogramData } from '@/lib/monte-carlo-engine';

interface MonteCarloResultsProps {
  simulation: MonteCarloSimulation;
  initialValue: number;
}

export function MonteCarloResults({ simulation, initialValue }: MonteCarloResultsProps) {
  const colors = useAppColors();

  const histogramData = useMemo(() => {
    return generateHistogramData(simulation.finalValues, 15);
  }, [simulation.finalValues]);

  const formatCurrency = (value: number) => {
    return `SGD ${Math.round(value).toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getOutcomeColor = (value: number) => {
    const percentChange = (value - initialValue) / initialValue;
    if (percentChange > 0.1) return colors.success;
    if (percentChange < -0.1) return colors.error;
    return colors.warning;
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {/* Key Metrics */}
      <View style={[styles.metricsGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.metricCard}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Expected Return</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
            {formatPercentage(simulation.expectedReturn)}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Volatility (Std Dev)</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.warning }}>
            {formatPercentage(simulation.stdDev / initialValue)}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Mean Outcome</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            {formatCurrency(simulation.mean)}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Median Outcome</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            {formatCurrency(simulation.medianOutcome)}
          </Text>
        </View>
      </View>

      {/* Outcome Scenarios */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>12-Month Outcome Scenarios</Text>

      <View style={{ gap: 12, marginBottom: 20 }}>
        {/* Best 5% */}
        <View style={[styles.outcomeCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.success }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 4 }}>Best 5% Outcome</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>
                {formatCurrency(simulation.best5Percent)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                Return: {formatPercentage((simulation.best5Percent - initialValue) / initialValue)}
              </Text>
            </View>
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
        </View>

        {/* Median */}
        <View style={[styles.outcomeCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.warning }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 4 }}>Median Outcome (50%)</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warning }}>
                {formatCurrency(simulation.medianOutcome)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                Return: {formatPercentage((simulation.medianOutcome - initialValue) / initialValue)}
              </Text>
            </View>
            <Text style={{ fontSize: 24 }}>📊</Text>
          </View>
        </View>

        {/* Worst 5% */}
        <View style={[styles.outcomeCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.error }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 4 }}>Worst 5% Outcome</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.error }}>
                {formatCurrency(simulation.worst5Percent)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                Return: {formatPercentage((simulation.worst5Percent - initialValue) / initialValue)}
              </Text>
            </View>
            <Text style={{ fontSize: 24 }}>⚠️</Text>
          </View>
        </View>
      </View>

      {/* Confidence Interval */}
      <View style={[styles.confidenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>90% Confidence Interval</Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>Lower Bound (5%)</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.error }}>
              {formatCurrency(simulation.confidenceInterval.lower)}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: colors.primary,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>Upper Bound (95%)</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
              {formatCurrency(simulation.confidenceInterval.upper)}
            </Text>
          </View>
        </View>
      </View>

      {/* Histogram */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Distribution of Outcomes</Text>

      <View style={[styles.histogramContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {histogramData.map((bin, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: colors.muted, flex: 1 }}>{bin.bin}</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.foreground, marginLeft: 8 }}>
                {bin.count} ({bin.percentage.toFixed(1)}%)
              </Text>
            </View>
            <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.max(bin.percentage * 2, 5)}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Risk Summary */}
      <View style={[styles.riskSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>Risk Summary</Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>Probability of Loss</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>
              {((simulation.finalValues.filter((v) => v < initialValue).length / simulation.finalValues.length) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>Probability of Gain &gt; 10%</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>
              {((simulation.finalValues.filter((v) => v > initialValue * 1.1).length / simulation.finalValues.length) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>Average Maximum Drawdown</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>
              {(
                (simulation.maxDrawdowns.reduce((a, b) => a + b, 0) / simulation.maxDrawdowns.length) *
                100
              ).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metricsGrid: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  outcomeCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  confidenceCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  histogramContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  riskSummary: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
});
