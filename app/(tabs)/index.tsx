import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, FlatList, GestureResponderEvent } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { useRouter } from 'expo-router';
import {
  calcNetWorth,
  calcTotalAssets,
  calcTotalLiabilities,
  calcWellnessScore,
  getCreditScoreDetails,
  formatCurrency,
  calcPortfolioByAssetClass,
} from '@/lib/store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Svg, { Circle, G } from 'react-native-svg';

// ─── Wellness Gauge ───────────────────────────────────────────────────────────
function WellnessGauge({ score }: { score: number }) {
  const colors = useAppColors();
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const gaugeColor =
    score >= 75 ? colors.success :
    score >= 50 ? colors.warning :
    colors.error;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={colors.border} strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={gaugeColor} strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugeScore, { color: gaugeColor }]}>{score}</Text>
        <Text style={[styles.gaugeLabel, { color: colors.muted }]}>Wellness Score</Text>
      </View>
    </View>
  );
}

// ─── Asset Allocation Bar ─────────────────────────────────────────────────────
function AssetAllocationBar({ data }: { data: { label: string; value: number; color: string }[] }) {
  const colors = useAppColors();
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <View style={styles.allocBar}>
      <View style={styles.allocBarTrack}>
        {data.map((d, i) => (
          <View
            key={i}
            style={[styles.allocBarSegment, { flex: d.value / total, backgroundColor: d.color }]}
          />
        ))}
      </View>
      <View style={styles.allocLegend}>
        {data.map((d, i) => (
          <View key={i} style={styles.allocLegendItem}>
            <View style={[styles.allocDot, { backgroundColor: d.color }]} />
            <Text style={[styles.allocLegendText, { color: colors.muted }]}>
              {d.label} {((d.value / total) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Health Metric Card ───────────────────────────────────────────────────────
function HealthMetricCard({ label, value, subtitle, color, onPress }: { label: string; value: string; subtitle: string; color: string; onPress?: () => void }) {
  const colors = useAppColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.metricSub, { color: colors.muted }]}>{subtitle}</Text>
    </Pressable>
  );
}

// ─── AI Recommendation Card ───────────────────────────────────────────────────
function AIRecommendationCard({ icon, title, description, type }: { icon: string; title: string; description: string; type: 'opportunity' | 'warning' | 'info' }) {
  const colors = useAppColors();
  const typeColor = type === 'opportunity' ? colors.success : type === 'warning' ? colors.warning : colors.primary;
  const typeBg = type === 'opportunity' ? 'rgba(0,200,150,0.1)' : type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(26,60,94,0.1)';

  return (
    <View style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: typeColor }]}>
      <View style={[styles.aiIconWrap, { backgroundColor: typeBg }]}>
        <Text style={styles.aiIcon}>{icon}</Text>
      </View>
      <View style={styles.aiContent}>
        <Text style={[styles.aiTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.aiDesc, { color: colors.muted }]}>{description}</Text>
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data, isLoading } = useAppData();

  const netWorth = useMemo(() => calcNetWorth(data), [data]);
  const totalAssets = useMemo(() => calcTotalAssets(data), [data]);
  const totalLiabilities = useMemo(() => calcTotalLiabilities(data), [data]);
  const wellnessScore = useMemo(() => calcWellnessScore(data), [data]);
  const cbsScore = useMemo(() => getCreditScoreDetails(data.creditScore), [data.creditScore]);
  const portfolioByClass = useMemo(() => calcPortfolioByAssetClass(data.holdings), [data.holdings]);

  const bankBalance = useMemo(
    () => data.bankAccounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0),
    [data.bankAccounts]
  );
  const investmentValue = useMemo(
    () => data.holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0),
    [data.holdings]
  );
  const insuranceValue = useMemo(
    () => data.insurancePolicies.reduce((s, p) => s + p.coverageAmount * 0.05, 0),
    [data.insurancePolicies]
  );

  const allocationData = [
    { label: 'Banks', value: bankBalance, color: '#1A3C5E' },
    { label: 'Investments', value: investmentValue, color: '#00C896' },
    { label: 'Insurance', value: insuranceValue, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const dta = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidAssets = data.bankAccounts
    .filter(a => ['savings', 'daily'].includes(a.accountType))
    .reduce((s, a) => s + a.balance, 0);
  const monthlyDebt = data.loans.reduce((s, l) => s + l.monthlyInstalment, 0);
  const liquidityMonths = monthlyDebt > 0 ? Math.round(liquidAssets / monthlyDebt) : 99;

  const assetClassCount = Object.keys(portfolioByClass).length;

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const aiRecommendations = useMemo(() => {
    const recs = [];
    if (dta > 60) {
      recs.push({ icon: '⚠️', title: 'High Debt-to-Asset Ratio', description: `Your debt is ${dta.toFixed(0)}% of total assets. Consider accelerating loan repayments to improve financial resilience.`, type: 'warning' as const });
    }
    if (assetClassCount < 4) {
      recs.push({ icon: '✨', title: 'Diversify Your Portfolio', description: `You hold ${assetClassCount} asset class${assetClassCount !== 1 ? 'es' : ''}. Adding bonds or REITs can reduce volatility and improve risk-adjusted returns.`, type: 'opportunity' as const });
    }
    if (liquidityMonths < 6) {
      recs.push({ icon: '💧', title: 'Build Emergency Fund', description: `Your liquid assets cover ${liquidityMonths} months of debt payments. Aim for 6 months to protect against income disruptions.`, type: 'warning' as const });
    }
    if (cbsScore.score >= 1825) {
      recs.push({ icon: '🏆', title: 'Excellent Credit Standing', description: `Your CBS score of ${cbsScore.score} (${cbsScore.grade}) qualifies you for preferential loan rates. Consider refinancing existing loans.`, type: 'info' as const });
    }
    if (recs.length === 0) {
      recs.push({ icon: '🎯', title: 'Strong Financial Health', description: 'Your wealth wellness metrics are looking great. Continue your current strategy and review quarterly.', type: 'info' as const });
    }
    return recs.slice(0, 3);
  }, [dta, assetClassCount, liquidityMonths, cbsScore]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your wealth data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >


        <View style={styles.content}>
          {/* Net Worth + Wellness Score */}
          <Pressable onPress={() => router.push('/net-worth-timeline' as any)} style={({ pressed }) => [styles.heroCard, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Total Net Worth</Text>
              <Text style={styles.heroValue}>{formatCurrency(netWorth)}</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Assets</Text>
                  <Text style={[styles.heroStatValue, { color: '#00C896' }]}>{formatCurrency(totalAssets)}</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Liabilities</Text>
                  <Text style={[styles.heroStatValue, { color: '#F87171' }]}>{formatCurrency(totalLiabilities)}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Tap to view timeline →</Text>
            </View>
            <WellnessGauge score={wellnessScore} />
          </Pressable>

          {/* Asset Allocation */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Asset Allocation</Text>
            <AssetAllocationBar data={allocationData} />
          </View>

          {/* Financial Health Metrics */}
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Financial Health</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
            <View style={styles.metricsRow}>
              <HealthMetricCard
                label="Diversification"
                value={`${assetClassCount}/8`}
                subtitle="Asset classes"
                color={assetClassCount >= 5 ? colors.success : assetClassCount >= 3 ? colors.warning : colors.error}
                onPress={() => router.push('/diversification-analysis')}
              />
              <HealthMetricCard
                label="Liquidity"
                value={`${Math.min(liquidityMonths, 99)}mo`}
                subtitle="Emergency cover"
                color={liquidityMonths >= 6 ? colors.success : liquidityMonths >= 3 ? colors.warning : colors.error}
                onPress={() => router.push('/liquidity-analysis')}
              />
              <HealthMetricCard
                label="Debt Ratio"
                value={`${dta.toFixed(0)}%`}
                subtitle="Debt-to-assets"
                color={dta <= 40 ? colors.success : dta <= 60 ? colors.warning : colors.error}
                onPress={() => router.push('/debt-analysis')}
              />
              <HealthMetricCard
                label="Credit Score"
                value={cbsScore.score.toString()}
                subtitle={`Grade ${cbsScore.grade}`}
                color={cbsScore.color}
              />
            </View>
          </ScrollView>

          {/* AI Recommendations */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>AI Recommendations</Text>
            <Pressable onPress={() => router.push('/ai-chat')} style={{ padding: 8 }}>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>Chat →</Text>
            </Pressable>
          </View>
          {aiRecommendations.map((rec, i) => (
            <AIRecommendationCard key={i} {...rec} />
          ))}
          
          {/* AI Chat Button */}
          <Pressable 
            onPress={() => router.push('/ai-chat')}
            style={({ pressed }) => [{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              💬 Ask AI Financial Advisor
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  headerDate: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 4, letterSpacing: -1 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  heroStat: { gap: 2 },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  heroStatValue: { fontSize: 14, fontWeight: '700' },
  heroStatDivider: { width: 1, height: 32 },
  gaugeContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeScore: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  gaugeLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  allocBar: { gap: 10 },
  allocBarTrack: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 },
  allocBarSegment: { borderRadius: 5 },
  allocLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  allocLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  allocDot: { width: 8, height: 8, borderRadius: 4 },
  allocLegendText: { fontSize: 12 },
  sectionLabel: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  metricsScroll: { marginHorizontal: -16 },
  metricsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  metricCard: {
    width: 110,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  metricLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  metricSub: { fontSize: 10, textAlign: 'center' },
  aiCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  aiIcon: { fontSize: 18 },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  aiDesc: { fontSize: 12, lineHeight: 18 },
});
