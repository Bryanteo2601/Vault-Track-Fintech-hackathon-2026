import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import {
  CPF_INTEREST_RATES,
  CPF_HEALTHCARE,
  getOAInterestRate,
  getSMRAInterestRate,
} from '@/lib/cpf-constants';
import { formatCurrency } from '@/lib/store';

interface CPFInfoCardsProps {
  oaBalance: number;
  smraBalance: number; // SA + MA + RA combined
}

export function CPFInfoCards({ oaBalance, smraBalance }: CPFInfoCardsProps) {
  const colors = useAppColors();

  const oaRate = getOAInterestRate(oaBalance);
  const smraRate = getSMRAInterestRate(smraBalance);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>Interest Rates & Healthcare</Text>

      {/* Interest Rates Grid */}
      <View style={styles.grid}>
        {/* OA Interest */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>💼</Text>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>OA Interest Rate</Text>
          </View>
          <Text style={[styles.rate, { color: colors.primary }]}>{oaRate}%</Text>
          <Text style={[styles.rateNote, { color: colors.muted }]}>
            {oaBalance <= 60000
              ? 'Base rate on first SGD 60,000'
              : `Base + Additional on balance above SGD 60,000`}
          </Text>
        </View>

        {/* SMRA Interest */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>🏦</Text>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>SMRA Interest Rate</Text>
          </View>
          <Text style={[styles.rate, { color: colors.success }]}>{smraRate}%</Text>
          <Text style={[styles.rateNote, { color: colors.muted }]}>
            Applies to SA, MA, and RA accounts
          </Text>
        </View>
      </View>

      {/* Healthcare Info */}
      <View style={[styles.healthcareCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>🏥</Text>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Basic Healthcare Sum (BHS)</Text>
        </View>

        <View style={styles.healthcareContent}>
          <View style={styles.healthcareItem}>
            <Text style={[styles.itemLabel, { color: colors.muted }]}>BHS Amount</Text>
            <Text style={[styles.itemValue, { color: colors.foreground }]}>
              {formatCurrency(CPF_HEALTHCARE.BHS)}
            </Text>
          </View>

          <View style={styles.healthcareItem}>
            <Text style={[styles.itemLabel, { color: colors.muted }]}>Annual Withdrawal Limit</Text>
            <Text style={[styles.itemValue, { color: colors.foreground }]}>
              {formatCurrency(CPF_HEALTHCARE.MA_WITHDRAWAL_LIMIT)}
            </Text>
          </View>

          <View style={[styles.healthcareNote, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <Text style={[styles.noteText, { color: colors.primary }]}>
              ℹ️ MediSave is meant for healthcare expenses and approved medical insurance. Maintain the BHS to ensure you have adequate healthcare protection.
            </Text>
          </View>
        </View>
      </View>

      {/* Rate Explanation */}
      <View style={[styles.explanationBox, { backgroundColor: colors.border + '30' }]}>
        <Text style={[styles.explanationTitle, { color: colors.foreground }]}>How Rates Work</Text>
        <View style={styles.explanationItem}>
          <Text style={[styles.bulletPoint, { color: colors.muted }]}>•</Text>
          <Text style={[styles.explanationText, { color: colors.muted }]}>
            OA earns lower interest (2.5% base) for flexibility
          </Text>
        </View>
        <View style={styles.explanationItem}>
          <Text style={[styles.bulletPoint, { color: colors.muted }]}>•</Text>
          <Text style={[styles.explanationText, { color: colors.muted }]}>
            SMRA earns higher interest (4% base) for retirement savings
          </Text>
        </View>
        <View style={styles.explanationItem}>
          <Text style={[styles.bulletPoint, { color: colors.muted }]}>•</Text>
          <Text style={[styles.explanationText, { color: colors.muted }]}>
            Additional 1% earned on balances above SGD 60,000 in both accounts
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  rate: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  rateNote: {
    fontSize: 10,
    lineHeight: 13,
  },
  healthcareCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  healthcareContent: {
    marginTop: 12,
  },
  healthcareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLabel: {
    fontSize: 12,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthcareNote: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 12,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 15,
  },
  explanationBox: {
    borderRadius: 12,
    padding: 14,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 12,
    marginTop: 1,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
