import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { calcPortfolioByAssetClass } from '@/lib/store';
import {
  PREDEFINED_SCENARIOS,
  generateStressTestReport,
  type StressTestScenario,
} from '@/lib/stress-test-types';
import { runMonteCarloSimulation } from '@/lib/monte-carlo-engine';
import { MonteCarloResults } from '@/components/monte-carlo-results';

const { width } = Dimensions.get('window');

type StressTestTab = 'scenarios' | 'monte-carlo';

export default function StressTestScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data } = useAppData();
  const [selectedScenario, setSelectedScenario] = useState<StressTestScenario | null>(null);
  const [activeTab, setActiveTab] = useState<StressTestTab>('scenarios');

  // Get actual portfolio data from user
  const portfolioByClass = useMemo(() => calcPortfolioByAssetClass(data.holdings), [data.holdings]);
  const totalValue = useMemo(() => {
    return data.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  }, [data.holdings]);

  const portfolioData = useMemo(() => ({
    totalValue,
    assets: {
      'Stocks': portfolioByClass.stocks || 0,
      'Bonds': portfolioByClass.bonds || 0,
      'Crypto': portfolioByClass.crypto || 0,
      'ETFs': portfolioByClass.etf || 0,
      'REITs': portfolioByClass.reits || 0,
      'Commodities': portfolioByClass.commodities || 0,
      'Options': portfolioByClass.options || 0,
      'Futures': portfolioByClass.futures || 0,
    },
  }), [totalValue, portfolioByClass]);

  // Generate stress test report
  const stressReport = useMemo(() => {
    const scenarios = Object.entries(PREDEFINED_SCENARIOS).map(([key, scenario]) => ({
      ...scenario,
      id: key,
    })) as StressTestScenario[];

    return generateStressTestReport(portfolioData.totalValue, portfolioData.assets, scenarios);
  }, [portfolioData]);

  const worstCase = stressReport.worstCaseScenario;
  const bestCase = stressReport.bestCaseScenario;

  // Run Monte Carlo simulation
  const monteCarloResults = useMemo(() => {
    return runMonteCarloSimulation(totalValue, portfolioData.assets, 1000, 12);
  }, [totalValue, portfolioData]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return '#FFA500';
      default:
        return colors.success;
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 }}>
        <Pressable onPress={() => router.replace('/(tabs)/index' as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconSymbol name="chevron.left" size={24} color={colors.accent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }}>Back</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>Portfolio Stress Test</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>Simulate market scenarios and assess portfolio resilience</Text>
      </View>

      {/* Tab Switcher */}
      {totalValue > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Pressable
            onPress={() => setActiveTab('scenarios')}
            style={({ pressed }) => [
              styles.tabButton,
              {
                backgroundColor: activeTab === 'scenarios' ? colors.primary : colors.surface,
                opacity: pressed ? 0.8 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === 'scenarios' ? 'white' : colors.foreground }}>Market Scenarios</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('monte-carlo')}
            style={({ pressed }) => [
              styles.tabButton,
              {
                backgroundColor: activeTab === 'monte-carlo' ? colors.primary : colors.surface,
                opacity: pressed ? 0.8 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === 'monte-carlo' ? 'white' : colors.foreground }}>Monte Carlo</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        {totalValue === 0 && (
          <View style={[styles.emptyStateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28, marginBottom: 12 }}>📊</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>No Portfolio Data</Text>
            <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 }}>Add holdings to your investment portfolio to run stress tests and see how your portfolio performs under different market scenarios.</Text>
          </View>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && totalValue > 0 && (
          <>
        {/* Portfolio Resilience Score */}
        {totalValue > 0 && (
          <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Portfolio Resilience Score</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>
                {stressReport.portfolioResilience.toFixed(0)}/100
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${stressReport.portfolioResilience}%`,
                  backgroundColor: stressReport.portfolioResilience > 70 ? colors.success : colors.warning,
                }}
              />
            </View>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
              {stressReport.portfolioResilience > 70 ? '✅ Good resilience' : '⚠️ Low resilience to market shocks'}
            </Text>
          </View>
        )}

        {/* Worst vs Best Case */}
        {totalValue > 0 && (
          <>
            {/* Predefined Scenarios */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Market Scenarios</Text>

            {stressReport.scenarios.map((result, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedScenario(stressReport.scenarios[idx] as any)}
                style={({ pressed }) => [
                  styles.scenarioCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: getRiskColor(result.riskLevel),
                    borderLeftWidth: 4,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                      {result.scenarioName}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
                      Probability: {(PREDEFINED_SCENARIOS[result.scenarioId as StressTestScenario['scenario']]?.probability || 0) * 100}%
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Impact</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: getRiskColor(result.riskLevel) }}>
                          {result.percentageChange.toFixed(1)}%
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Amount</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: getRiskColor(result.riskLevel) }}>
                          SGD {result.dollarChange.toLocaleString()}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Recovery</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>
                          {result.timeToRecover}mo
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>
                      {result.riskLevel === 'critical' ? '🔴' : result.riskLevel === 'high' ? '🟠' : result.riskLevel === 'medium' ? '🟡' : '🟢'}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>{result.riskLevel}</Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {/* AI Chat Button */}
            <Pressable
              onPress={() => router.push('/stress-test-ai-chat' as any)}
              style={({ pressed }) => [
                styles.aiButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 16, color: 'white', marginRight: 8 }}>💬</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Ask AI About Stress Tests</Text>
            </Pressable>

            {/* Recommendations */}
            {stressReport.recommendations.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommendations</Text>
                <View style={[styles.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {stressReport.recommendations.map((rec, idx) => (
                    <Text key={idx} style={{ fontSize: 12, color: colors.muted, marginBottom: 8, lineHeight: 18 }}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </>
        )}
          </>
        )}

        {/* Monte Carlo Tab */}
        {activeTab === 'monte-carlo' && totalValue > 0 && (
          <MonteCarloResults simulation={monteCarloResults} initialValue={totalValue} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  scoreCard: {
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
  caseCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  scenarioCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  aiButton: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
});
