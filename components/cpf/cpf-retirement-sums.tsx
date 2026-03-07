import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { CPF_RETIREMENT_SUMS } from '@/lib/cpf-constants';
import { formatCurrency } from '@/lib/store';

interface CPFRetirementSumsProps {
  currentRA: number;
}

export function CPFRetirementSums({ currentRA }: CPFRetirementSumsProps) {
  const colors = useAppColors();

  const sums = [
    {
      name: 'Basic Retirement Sum (BRS)',
      amount: CPF_RETIREMENT_SUMS.BRS,
      description: 'Minimum amount to receive monthly CPF LIFE payouts',
      icon: '📋',
    },
    {
      name: 'Full Retirement Sum (FRS)',
      amount: CPF_RETIREMENT_SUMS.FRS,
      description: 'Benchmark retirement target for a comfortable retirement',
      icon: '🎯',
    },
    {
      name: 'Enhanced Retirement Sum (ERS)',
      amount: CPF_RETIREMENT_SUMS.ERS,
      description: 'Higher amount for increased monthly payouts',
      icon: '🏆',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Retirement Sums</Text>

      {sums.map((sum, idx) => {
        const progress = Math.min((currentRA / sum.amount) * 100, 100);
        const isReached = currentRA >= sum.amount;

        return (
          <View key={idx} style={[styles.sumCard, idx < sums.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12, marginBottom: 12 }]}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>{sum.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sumName, { color: colors.foreground }]}>{sum.name}</Text>
                  <Text style={[styles.sumDescription, { color: colors.muted }]}>{sum.description}</Text>
                </View>
              </View>
              <Text style={[styles.amount, { color: isReached ? colors.success : colors.primary }]}>
                {formatCurrency(sum.amount)}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: isReached ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>

            {/* Progress text */}
            <View style={styles.progressText}>
              <Text style={[styles.progressLabel, { color: colors.muted }]}>
                {formatCurrency(currentRA)} / {formatCurrency(sum.amount)}
              </Text>
              <Text style={[styles.progressPercent, { color: isReached ? colors.success : colors.primary }]}>
                {progress.toFixed(0)}%
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  sumCard: {},
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginTop: 2,
  },
  sumName: {
    fontSize: 13,
    fontWeight: '600',
  },
  sumDescription: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
});
