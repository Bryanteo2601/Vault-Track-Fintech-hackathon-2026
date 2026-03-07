import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { calculateMonthlyPayout, CPFUserData } from '@/lib/cpf-calculations';
import { CPF_AGE_MILESTONES } from '@/lib/cpf-constants';
import { formatCurrency } from '@/lib/store';

interface CPFPayoutEstimatorProps {
  data: CPFUserData;
}

export function CPFPayoutEstimator({ data }: CPFPayoutEstimatorProps) {
  const colors = useAppColors();
  const [selectedStartAge, setSelectedStartAge] = useState(65);
  const [topUpAmount, setTopUpAmount] = useState(0);

  const payoutAt65 = useMemo(() => calculateMonthlyPayout(data.ra + topUpAmount, 65), [data.ra, topUpAmount]);
  const payoutAt70 = useMemo(() => calculateMonthlyPayout(data.ra + topUpAmount, 70), [data.ra, topUpAmount]);
  const payoutDifference = payoutAt70 - payoutAt65;
  const percentIncrease = payoutAt65 > 0 ? ((payoutDifference / payoutAt65) * 100).toFixed(0) : 0;

  const isEligible = data.ra >= 180000; // BRS

  const startAges = [65, 66, 67, 68, 69, 70];
  const selectedPayout = selectedStartAge === 65 ? payoutAt65 : payoutAt70;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>CPF LIFE Payout Estimator</Text>

      {!isEligible ? (
        <View style={[styles.eligibilityWarning, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <Text style={[styles.warningText, { color: colors.error }]}>
            ⚠️ Your RA balance is below the Basic Retirement Sum (BRS). You need at least SGD 180,000 to be eligible for CPF LIFE payouts.
          </Text>
        </View>
      ) : (
        <>
          {/* Payout Comparison */}
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonCard}>
              <Text style={[styles.comparisonLabel, { color: colors.muted }]}>Start at 65</Text>
              <Text style={[styles.comparisonAmount, { color: colors.primary }]}>
                {formatCurrency(payoutAt65)}/mo
              </Text>
            </View>

            <View style={[styles.comparisonArrow, { backgroundColor: colors.border }]}>
              <Text style={[styles.arrowText, { color: colors.muted }]}>→</Text>
            </View>

            <View style={styles.comparisonCard}>
              <Text style={[styles.comparisonLabel, { color: colors.muted }]}>Start at 70</Text>
              <Text style={[styles.comparisonAmount, { color: colors.success }]}>
                {formatCurrency(payoutAt70)}/mo
              </Text>
            </View>
          </View>

          {/* Deferment Benefit */}
          {payoutDifference > 0 && (
            <View style={[styles.benefitBox, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
              <Text style={[styles.benefitText, { color: colors.success }]}>
                ✓ Defer 5 years → +SGD {payoutDifference}/mo ({percentIncrease}% increase)
              </Text>
            </View>
          )}

          {/* Age Selector */}
          <View style={styles.ageSelector}>
            <Text style={[styles.selectorLabel, { color: colors.foreground }]}>Choose Start Age</Text>
            <View style={styles.ageButtons}>
              {startAges.map((age) => (
                <Pressable
                  key={age}
                  onPress={() => setSelectedStartAge(age)}
                  style={({ pressed }) => [
                    styles.ageButton,
                    {
                      backgroundColor: selectedStartAge === age ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ageButtonText,
                      { color: selectedStartAge === age ? 'white' : colors.muted },
                    ]}
                  >
                    {age}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Selected Payout */}
          <View style={[styles.selectedPayoutBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <Text style={[styles.selectedLabel, { color: colors.muted }]}>
              Monthly Payout if Starting at Age {selectedStartAge}
            </Text>
            <Text style={[styles.selectedAmount, { color: colors.primary }]}>
              {formatCurrency(selectedPayout)}/month
            </Text>
            <Text style={[styles.selectedNote, { color: colors.muted }]}>
              Estimated based on current RA balance. Actual payout depends on CPF LIFE product chosen.
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Current RA</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatCurrency(data.ra)}</Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Payout Years</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>20+</Text>
            </View>
          </View>
        </>
      )}
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
  eligibilityWarning: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  comparisonCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  comparisonAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  comparisonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
  },
  benefitBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  ageSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  ageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedPayoutBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  selectedAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectedNote: {
    fontSize: 10,
    lineHeight: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
