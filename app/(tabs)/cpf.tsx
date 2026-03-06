import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { calculateCPFContribution, calculateRetirementAdequacy, CPF_WITHDRAWAL_LIMITS } from '@/lib/cpf-types';

const { width } = Dimensions.get('window');

export default function CPFScreen() {
  const colors = useAppColors();
  const router = useRouter();

  // Sample CPF data - in production, this would come from AppDataContext
  const cpfData = {
    oa: { balance: 185000, accountType: 'OA' as const },
    sa: { balance: 95000, accountType: 'SA' as const },
    ma: { balance: 68000, accountType: 'MA' as const },
  };

  const totalCPF = cpfData.oa.balance + cpfData.sa.balance + cpfData.ma.balance;

  // Calculate retirement adequacy
  const retirementAnalysis = useMemo(() => {
    return calculateRetirementAdequacy(cpfData.sa.balance, cpfData.oa.balance, 35, 4000);
  }, [cpfData]);

  // Calculate monthly contribution (assuming 5500 monthly salary)
  const monthlyContribution = useMemo(() => {
    return calculateCPFContribution(5500);
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>CPF Accounts</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>Central Provident Fund (Singapore)</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        {/* Total CPF Balance */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Total CPF Balance</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: 'white', marginBottom: 12 }}>SGD {totalCPF.toLocaleString()}</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Across all accounts</Text>
        </View>

        {/* CPF Account Cards */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Breakdown</Text>

        {/* OA - Ordinary Account */}
        <Pressable
          onPress={() => router.push('cpf-oa' as any)}
          style={({ pressed }) => [
            styles.accountCard,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>💼</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Ordinary Account (OA)</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Housing, Education, Investment</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>SGD {cpfData.oa.balance.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>
                {((cpfData.oa.balance / totalCPF) * 100).toFixed(0)}% of total CPF
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </View>
        </Pressable>

        {/* SA - Special Account */}
        <Pressable
          onPress={() => router.push('cpf-sa' as any)}
          style={({ pressed }) => [
            styles.accountCard,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>🏦</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Special Account (SA)</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Retirement Savings</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>SGD {cpfData.sa.balance.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>
                {((cpfData.sa.balance / totalCPF) * 100).toFixed(0)}% of total CPF
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </View>
        </Pressable>

        {/* MA - Medisave Account */}
        <Pressable
          onPress={() => router.push('cpf-ma' as any)}
          style={({ pressed }) => [
            styles.accountCard,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>🏥</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Medisave Account (MA)</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Healthcare Savings</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>SGD {cpfData.ma.balance.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>
                {((cpfData.ma.balance / totalCPF) * 100).toFixed(0)}% of total CPF
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </View>
        </Pressable>

        {/* Monthly Contribution */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Contribution</Text>
        <View style={[styles.contributionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>Employee Contribution</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>SGD {monthlyContribution.employeeContribution.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>Employer Contribution</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>SGD {monthlyContribution.employerContribution.toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>Total Monthly</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>SGD {monthlyContribution.totalContribution.toFixed(2)}</Text>
          </View>
        </View>

        {/* Retirement Readiness */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Retirement Readiness</Text>
        <View
          style={[
            styles.retirementCard,
            {
              backgroundColor: colors.surface,
              borderColor: retirementAnalysis.isAdequate ? colors.success : colors.warning,
              borderLeftWidth: 4,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 20 }}>{retirementAnalysis.isAdequate ? '✅' : '⚠️'}</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                {retirementAnalysis.isAdequate ? 'On Track for Retirement' : 'Below Retirement Target'}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>Minimum sum: SGD {CPF_WITHDRAWAL_LIMITS.minimumSumForRetirement.toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>Years of Coverage</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                {retirementAnalysis.yearsOfCoverage.toFixed(1)} years
              </Text>
            </View>
            {retirementAnalysis.shortfall > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>Monthly Shortfall</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>SGD {retirementAnalysis.shortfall.toLocaleString()}</Text>
              </View>
            )}
          </View>

          {retirementAnalysis.recommendations.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>Recommendations</Text>
              {retirementAnalysis.recommendations.map((rec, idx) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.muted, marginBottom: 4, lineHeight: 16 }}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  accountCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  contributionCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  retirementCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
});
