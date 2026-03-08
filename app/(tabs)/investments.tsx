import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { Holding, AssetClass } from '@/lib/types';
import { formatCurrency, calcPortfolioByAssetClass } from '@/lib/store';
import { calculatePortfolioRiskMetrics, getRiskClassificationDetails, formatPortfolioMetrics } from '@/lib/portfolio-risk-analytics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';

// ─── Asset Class Config ───────────────────────────────────────────────────────
const assetClassConfig: Record<AssetClass, { label: string; color: string; icon: string; description: string }> = {
  stocks: { label: 'Stocks', color: '#1A3C5E', icon: '📈', description: 'Equities & shares' },
  crypto: { label: 'Crypto', color: '#F59E0B', icon: '₿', description: 'Digital currencies' },
  etf: { label: 'ETFs', color: '#00C896', icon: '🌐', description: 'Exchange-traded funds' },
  bonds: { label: 'Bonds', color: '#8B5CF6', icon: '📋', description: 'Fixed income' },
  futures: { label: 'Futures', color: '#EF4444', icon: '⚡', description: 'Derivatives contracts' },
  options: { label: 'Options', color: '#EC4899', icon: '🎯', description: 'Options contracts' },
  reits: { label: 'REITs', color: '#06B6D4', icon: '🏢', description: 'Real estate investment trusts' },
  commodities: { label: 'Commodities', color: '#84CC16', icon: '🥇', description: 'Physical assets' },
};

// ─── Pie Chart ────────────────────────────────────────────────────────────────
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const innerR = 50;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle, endAngle: currentAngle, angle };
  });

  function polarToCartesian(angle: number, radius: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(startAngle, r);
    const end = polarToCartesian(endAngle, r);
    const innerStart = polarToCartesian(startAngle, innerR);
    const innerEnd = polarToCartesian(endAngle, innerR);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <Svg width={size} height={size}>
      {slices.map((s, i) => (
        <Path key={i} d={describeArc(s.startAngle, s.endAngle)} fill={s.color} />
      ))}
    </Svg>
  );
}

// ─── Holding Row ──────────────────────────────────────────────────────────────
function HoldingRow({ holding, onEdit, onDelete }: { holding: Holding; onEdit: () => void; onDelete: () => void }) {
  const colors = useAppColors();
  const currentValue = holding.quantity * holding.currentPrice;
  const costBasis = holding.quantity * holding.avgCost;
  const pnl = currentValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <View style={[styles.holdingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.holdingLeft}>
        <View style={[styles.tickerBadge, { backgroundColor: assetClassConfig[holding.assetClass].color + '20' }]}>
          <Text style={[styles.tickerText, { color: assetClassConfig[holding.assetClass].color }]}>{holding.ticker}</Text>
        </View>
        <View style={styles.holdingInfo}>
          <Text style={[styles.holdingName, { color: colors.foreground }]} numberOfLines={1}>{holding.name}</Text>
          <Text style={[styles.holdingQty, { color: colors.muted }]}>
            {holding.quantity} × {holding.currency} {holding.currentPrice.toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.holdingRight}>
        <Text style={[styles.holdingValue, { color: colors.foreground }]}>
          {holding.currency} {currentValue.toLocaleString('en', { maximumFractionDigits: 0 })}
        </Text>
        <Text style={[styles.holdingPnl, { color: isPositive ? colors.success : colors.error }]}>
          {isPositive ? '+' : ''}{pnl.toLocaleString('en', { maximumFractionDigits: 0 })} ({pnlPct.toFixed(1)}%)
        </Text>
        <View style={styles.holdingActions}>
          <Pressable onPress={onEdit} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <IconSymbol name="pencil" size={14} color={colors.muted} />
          </Pressable>
          <Pressable onPress={onDelete} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <IconSymbol name="trash.fill" size={14} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Add/Edit Holding Modal ───────────────────────────────────────────────────
function HoldingModal({ visible, holding, onClose, onSave }: {
  visible: boolean;
  holding?: Holding;
  onClose: () => void;
  onSave: (data: Omit<Holding, 'id'>) => void;
}) {
  const colors = useAppColors();
  const [assetClass, setAssetClass] = useState<AssetClass>(holding?.assetClass || 'stocks');
  const [ticker, setTicker] = useState(holding?.ticker || '');
  const [name, setName] = useState(holding?.name || '');
  const [quantity, setQuantity] = useState(holding?.quantity?.toString() || '');
  const [avgCost, setAvgCost] = useState(holding?.avgCost?.toString() || '');
  const [currentPrice, setCurrentPrice] = useState(holding?.currentPrice?.toString() || '');
  const [currency, setCurrency] = useState(holding?.currency || 'SGD');

  React.useEffect(() => {
    if (visible) {
      setAssetClass(holding?.assetClass || 'stocks');
      setTicker(holding?.ticker || '');
      setName(holding?.name || '');
      setQuantity(holding?.quantity?.toString() || '');
      setAvgCost(holding?.avgCost?.toString() || '');
      setCurrentPrice(holding?.currentPrice?.toString() || '');
      setCurrency(holding?.currency || 'SGD');
    }
  }, [visible, holding]);

  const handleSave = () => {
    if (!ticker.trim() || !name.trim()) { Alert.alert('Required', 'Please enter ticker and name'); return; }
    onSave({
      assetClass,
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      quantity: parseFloat(quantity) || 0,
      avgCost: parseFloat(avgCost) || 0,
      currentPrice: parseFloat(currentPrice) || 0,
      currency,
      purchaseDate: holding?.purchaseDate || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{holding ? 'Edit Holding' : 'Add Holding'}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Asset Class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.classRow}>
                {(Object.keys(assetClassConfig) as AssetClass[]).map(cls => (
                  <Pressable key={cls} onPress={() => setAssetClass(cls)}
                    style={[styles.classChip, {
                      borderColor: assetClass === cls ? assetClassConfig[cls].color : colors.border,
                      backgroundColor: assetClass === cls ? assetClassConfig[cls].color + '15' : colors.surface,
                    }]}>
                    <Text style={styles.classChipIcon}>{assetClassConfig[cls].icon}</Text>
                    <Text style={[styles.classChipText, { color: assetClass === cls ? assetClassConfig[cls].color : colors.muted }]}>
                      {assetClassConfig[cls].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Ticker Symbol</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={ticker} onChangeText={setTicker} placeholder="e.g. AAPL, BTC" placeholderTextColor={colors.muted}
              autoCapitalize="characters" />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={name} onChangeText={setName} placeholder="e.g. Apple Inc." placeholderTextColor={colors.muted} />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Quantity</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="100" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Currency</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={currency} onChangeText={setCurrency} placeholder="SGD" placeholderTextColor={colors.muted}
                  autoCapitalize="characters" />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Avg Cost</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={avgCost} onChangeText={setAvgCost} keyboardType="numeric" placeholder="165.00" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Current Price</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={currentPrice} onChangeText={setCurrentPrice} keyboardType="numeric" placeholder="189.50" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveBtnText}>Save Holding</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Investments Screen ──────────────────────────────────────────────────
export default function InvestmentsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data, addHolding, updateHolding, deleteHolding } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | undefined>();
  const [expandedClass, setExpandedClass] = useState<AssetClass | null>('stocks');

  const portfolioByClass = useMemo(() => calcPortfolioByAssetClass(data.holdings), [data.holdings]);
  const totalValue = useMemo(() => Object.values(portfolioByClass).reduce((s, v) => s + v, 0), [portfolioByClass]);
  const totalCost = useMemo(() => data.holdings.reduce((s, h) => s + h.quantity * h.avgCost, 0), [data.holdings]);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const pieData = useMemo(() =>
    Object.entries(portfolioByClass)
      .map(([cls, val]) => ({ label: assetClassConfig[cls as AssetClass].label, value: val, color: assetClassConfig[cls as AssetClass].color }))
      .sort((a, b) => b.value - a.value),
    [portfolioByClass]
  );

  const riskMetrics = useMemo(() => calculatePortfolioRiskMetrics(data.holdings), [data.holdings]);
  const riskClassDetails = useMemo(() => getRiskClassificationDetails(riskMetrics.riskClassification), [riskMetrics.riskClassification]);
  const formattedMetrics = useMemo(() => formatPortfolioMetrics(riskMetrics), [riskMetrics]);

  const aiSuggestions = useMemo(() => {
    const suggestions = [];
    const classes = Object.keys(portfolioByClass) as AssetClass[];
    const stockPct = portfolioByClass.stocks ? (portfolioByClass.stocks / totalValue) * 100 : 0;
    const cryptoPct = portfolioByClass.crypto ? (portfolioByClass.crypto / totalValue) * 100 : 0;
    const bondPct = portfolioByClass.bonds ? (portfolioByClass.bonds / totalValue) * 100 : 0;

    if (stockPct > 60) {
      suggestions.push({ icon: '⚖️', title: 'Reduce Stock Concentration', desc: `Stocks make up ${stockPct.toFixed(0)}% of your portfolio. Consider rebalancing into bonds or REITs for stability.`, color: '#F59E0B' });
    }
    if (cryptoPct > 20) {
      suggestions.push({ icon: '⚠️', title: 'High Crypto Exposure', desc: `Crypto is ${cryptoPct.toFixed(0)}% of your portfolio — above the recommended 5–10% for most investors.`, color: '#EF4444' });
    }
    if (!classes.includes('bonds') || bondPct < 10) {
      suggestions.push({ icon: '📋', title: 'Add Fixed Income', desc: 'Consider Singapore Government Securities (SGS) or Singapore Savings Bonds (SSB) for stable, low-risk returns.', color: '#8B5CF6' });
    }
    if (!classes.includes('reits')) {
      suggestions.push({ icon: '🏢', title: 'Explore S-REITs', desc: 'Singapore REITs like CapitaLand Integrated Commercial Trust (CICT) offer 4–6% dividend yields with real estate exposure.', color: '#06B6D4' });
    }
    if (!classes.includes('etf')) {
      suggestions.push({ icon: '🌐', title: 'Consider ETF Diversification', desc: 'Low-cost ETFs like VOO (S&P 500) or ES3 (STI ETF) provide broad market exposure with minimal management fees.', color: '#00C896' });
    }
    if (suggestions.length === 0) {
      suggestions.push({ icon: '✅', title: 'Well-Diversified Portfolio', desc: 'Your portfolio shows good diversification across asset classes. Continue monitoring and rebalance quarterly.', color: '#00C896' });
    }
    return suggestions.slice(0, 3);
  }, [portfolioByClass, totalValue]);

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setModalVisible(true);
  };

  const handleDelete = (holding: Holding) => {
    Alert.alert('Delete Holding', `Remove ${holding.ticker}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHolding(holding.id) },
    ]);
  };

  const handleSave = async (holdingData: Omit<Holding, 'id'>) => {
    if (editingHolding) {
      await updateHolding(editingHolding.id, holdingData);
    } else {
      await addHolding(holdingData);
    }
    setEditingHolding(undefined);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerTitle}>Investment Portfolio</Text>
            <Text style={styles.headerSub}>{data.holdings.length} holdings across {Object.keys(portfolioByClass).length} asset classes</Text>
          </View>
          <Pressable onPress={() => { setEditingHolding(undefined); setModalVisible(true); }}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
            <IconSymbol name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Portfolio Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Total Value</Text>
                <Text style={styles.summaryValue}>SGD {totalValue.toLocaleString('en', { maximumFractionDigits: 0 })}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryLabel}>Total P&L</Text>
                <Text style={[styles.summaryPnl, { color: totalPnl >= 0 ? '#00C896' : '#F87171' }]}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString('en', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.summaryPnlPct, { color: totalPnl >= 0 ? '#00C896' : '#F87171' }]}>
                  ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>

          {/* Risk Analytics Section */}
          {data.holdings.length > 0 && (
            <View style={[styles.riskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.riskHeader}>
                <Text style={[styles.riskTitle, { color: colors.foreground }]}>Portfolio Risk Analytics</Text>
                <Text style={[styles.riskClassBadge, { backgroundColor: riskClassDetails.color + '20', color: riskClassDetails.color }]}>
                  {riskMetrics.riskClassification}
                </Text>
              </View>
              
              <View style={styles.riskMetricsGrid}>
                <View style={styles.riskMetricBox}>
                  <Text style={[styles.riskMetricLabel, { color: colors.muted }]}>Portfolio Return</Text>
                  <Text style={[styles.riskMetricValue, { color: riskMetrics.portfolioReturn >= 0 ? colors.success : colors.error }]}>
                    {formattedMetrics.portfolioReturnDisplay}
                  </Text>
                </View>
                
                <View style={styles.riskMetricBox}>
                  <Text style={[styles.riskMetricLabel, { color: colors.muted }]}>Volatility</Text>
                  <Text style={[styles.riskMetricValue, { color: colors.foreground }]}>
                    {formattedMetrics.volatilityDisplay}
                  </Text>
                </View>
                
                <View style={styles.riskMetricBox}>
                  <Text style={[styles.riskMetricLabel, { color: colors.muted }]}>Sharpe Ratio</Text>
                  <Text style={[styles.riskMetricValue, { color: colors.foreground }]}>
                    {formattedMetrics.sharpeRatioDisplay}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.riskClassificationBox, { backgroundColor: riskClassDetails.color + '10', borderColor: riskClassDetails.color }]}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>{riskClassDetails.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.riskClassLabel, { color: riskClassDetails.color }]}>{riskClassDetails.label}</Text>
                  <Text style={[styles.riskClassDesc, { color: colors.muted }]}>{riskClassDetails.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Stress Test Button */}
          <Pressable
            onPress={() => router.push('/stress-test' as any)}
            style={({ pressed }) => [styles.stressTestBtn, { backgroundColor: colors.warning, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>Portfolio Stress Test</Text>
              <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)' }}>Simulate market scenarios</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#000" />
          </Pressable>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Portfolio Breakdown</Text>
              <View style={styles.chartRow}>
                <PieChart data={pieData} />
                <View style={styles.legend}>
                  {pieData.map((d, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.legendLabel, { color: colors.foreground }]}>{d.label}</Text>
                        <Text style={[styles.legendPct, { color: colors.muted }]}>
                          {((d.value / totalValue) * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Asset Classes */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Holdings by Asset Class</Text>
          {(Object.keys(assetClassConfig) as AssetClass[]).map(cls => {
            const classHoldings = data.holdings.filter(h => h.assetClass === cls);
            if (classHoldings.length === 0) return null;
            const classValue = portfolioByClass[cls] || 0;
            const classCost = classHoldings.reduce((s, h) => s + h.quantity * h.avgCost, 0);
            const classPnl = classValue - classCost;
            const cfg = assetClassConfig[cls];
            const isExpanded = expandedClass === cls;

            return (
              <View key={cls} style={[styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedClass(isExpanded ? null : cls)}
                  style={({ pressed }) => [styles.classHeader, pressed && { opacity: 0.8 }]}>
                  <View style={styles.classHeaderLeft}>
                    <Text style={styles.classIcon}>{cfg.icon}</Text>
                    <View>
                      <Text style={[styles.className, { color: colors.foreground }]}>{cfg.label}</Text>
                      <Text style={[styles.classDesc, { color: colors.muted }]}>{classHoldings.length} holding{classHoldings.length !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  <View style={styles.classHeaderRight}>
                    <Text style={[styles.classValue, { color: colors.foreground }]}>
                      {classValue.toLocaleString('en', { maximumFractionDigits: 0 })}
                    </Text>
                    <Text style={[styles.classPnl, { color: classPnl >= 0 ? colors.success : colors.error }]}>
                      {classPnl >= 0 ? '+' : ''}{classPnl.toLocaleString('en', { maximumFractionDigits: 0 })}
                    </Text>
                    <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={16} color={colors.muted} />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.holdingsList}>
                    <View style={[styles.holdingsDivider, { backgroundColor: colors.border }]} />
                    {classHoldings.map(h => (
                      <HoldingRow key={h.id} holding={h}
                        onEdit={() => handleEdit(h)}
                        onDelete={() => handleDelete(h)} />
                    ))}
                    <Pressable onPress={() => { setEditingHolding(undefined); setModalVisible(true); }}
                      style={[styles.addHoldingBtn, { borderColor: cfg.color }]}>
                      <IconSymbol name="plus" size={14} color={cfg.color} />
                      <Text style={[styles.addHoldingText, { color: cfg.color }]}>Add {cfg.label}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          {data.holdings.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No holdings yet. Tap + to add your first investment.</Text>
            </View>
          )}

          {/* AI Suggestions */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Portfolio Insights</Text>
          {aiSuggestions.map((s, i) => (
            <View key={i} style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: s.color }]}>
              <Text style={styles.aiIcon}>{s.icon}</Text>
              <View style={styles.aiContent}>
                <Text style={[styles.aiTitle, { color: colors.foreground }]}>{s.title}</Text>
                <Text style={[styles.aiDesc, { color: colors.muted }]}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <HoldingModal
        visible={modalVisible}
        holding={editingHolding}
        onClose={() => { setModalVisible(false); setEditingHolding(undefined); }}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  summaryCard: { borderRadius: 16, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 4, letterSpacing: -0.5 },
  summaryRight: { alignItems: 'flex-end' },
  summaryPnl: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  summaryPnlPct: { fontSize: 13, fontWeight: '600' },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontWeight: '600' },
  legendPct: { fontSize: 11 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  classCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  classHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  classHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  classIcon: { fontSize: 26 },
  className: { fontSize: 15, fontWeight: '700' },
  classDesc: { fontSize: 12, marginTop: 1 },
  classHeaderRight: { alignItems: 'flex-end', gap: 2 },
  classValue: { fontSize: 15, fontWeight: '700' },
  classPnl: { fontSize: 12, fontWeight: '600' },
  holdingsList: { paddingHorizontal: 14, paddingBottom: 14 },
  holdingsDivider: { height: 1, marginBottom: 10 },
  holdingRow: { borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  holdingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  tickerBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tickerText: { fontSize: 12, fontWeight: '700' },
  holdingInfo: { flex: 1 },
  holdingName: { fontSize: 13, fontWeight: '600' },
  holdingQty: { fontSize: 11, marginTop: 1 },
  holdingRight: { alignItems: 'flex-end', gap: 2 },
  holdingValue: { fontSize: 13, fontWeight: '700' },
  holdingPnl: { fontSize: 11, fontWeight: '600' },
  holdingActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  addHoldingBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 10, padding: 10, marginTop: 4, borderStyle: 'dashed' },
  addHoldingText: { fontSize: 13, fontWeight: '600' },
  emptyState: { borderRadius: 16, padding: 32, borderWidth: 1, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  aiCard: { borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 4, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  aiIcon: { fontSize: 20, marginTop: 2 },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  aiDesc: { fontSize: 12, lineHeight: 18 },
  stressTestBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 16 },
  riskCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  riskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  riskTitle: { fontSize: 16, fontWeight: '700' },
  riskClassBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '600' },
  riskMetricsGrid: { flexDirection: 'row', gap: 12 },
  riskMetricBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  riskMetricLabel: { fontSize: 11, fontWeight: '500', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  riskMetricValue: { fontSize: 18, fontWeight: '700' },
  riskClassificationBox: { borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  riskClassLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  riskClassDesc: { fontSize: 12, lineHeight: 16 },
  // Modal
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 0 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: { padding: 20, gap: 4, paddingBottom: 40 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  inputRow: { flexDirection: 'row', gap: 12 },
  classRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  classChip: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 70 },
  classChipIcon: { fontSize: 18, marginBottom: 4 },
  classChipText: { fontSize: 11, fontWeight: '600' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
