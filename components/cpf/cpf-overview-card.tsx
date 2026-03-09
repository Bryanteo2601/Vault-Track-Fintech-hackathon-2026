import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { CPF_RETIREMENT_SUMS } from '@/lib/cpf-constants';
import { formatCurrency } from '@/lib/store';


interface CPFOverviewCardProps {
  totalBalance: number;
  age: number;
  raBalance: number;
  monthlyPayoutAt65: number;
}

export function CPFOverviewCard({
  totalBalance,
  age,
  raBalance,
  monthlyPayoutAt65,
}: CPFOverviewCardProps) {
  const colors = useAppColors();

  // Determine retirement readiness
  let readinessStatus = 'Below BRS';
  let readinessColor = colors.error;

  if (raBalance >= CPF_RETIREMENT_SUMS.ERS) {
    readinessStatus = 'Above ERS';
    readinessColor = colors.success;
  } else if (raBalance >= CPF_RETIREMENT_SUMS.FRS) {
    readinessStatus = 'At FRS';
    readinessColor = colors.success;
  } else if (raBalance >= CPF_RETIREMENT_SUMS.BRS) {
    readinessStatus = 'At BRS';
    readinessColor = colors.warning;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>Total CPF Balance</Text>
          <Text style={[styles.totalAmount, { color: colors.foreground }]}>
            {formatCurrency(totalBalance)}
          </Text>
        </View>
        <View style={[styles.ageBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.ageBadgeText}>{age}</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {/* RA Balance */}
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.muted }]}>RA Balance</Text>
          <Text style={[styles.gridValue, { color: colors.foreground }]}>
            {formatCurrency(raBalance)}
          </Text>
        </View>

        {/* Monthly Payout at 65 */}
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.muted }]}>Est. Monthly at 65</Text>
          <Text style={[styles.gridValue, { color: colors.primary }]}>
            {formatCurrency(monthlyPayoutAt65)}
          </Text>
        </View>

        {/* Retirement Readiness */}
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.muted }]}>Readiness</Text>
          <Text style={[styles.gridValue, { color: readinessColor }]}>{readinessStatus}</Text>
        </View>

        {/* FRS Target */}
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.muted }]}>FRS Target</Text>
          <Text style={[styles.gridValue, { color: colors.foreground }]}>
            {formatCurrency(CPF_RETIREMENT_SUMS.FRS)}
          </Text>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  ageBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
  },
  gridLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
