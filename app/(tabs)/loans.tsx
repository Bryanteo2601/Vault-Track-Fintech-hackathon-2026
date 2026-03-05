import React, { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { Loan, LoanType, LoanSecurityType } from '@/lib/types';
import { formatCurrency, calcTotalInterestPayable, calcTotalPaid, aggregatedBalanceHistory } from '@/lib/store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';

// ─── Loan Type Config ─────────────────────────────────────────────────────────
const loanTypeConfig: Record<LoanType, { label: string; icon: string; color: string }> = {
  hdb_loan: { label: 'HDB Loan', icon: '🏠', color: '#1A3C5E' },
  mortgage: { label: 'Mortgage', icon: '🏢', color: '#2A5C8E' },
  personal_loan: { label: 'Personal Loan', icon: '👤', color: '#8B5CF6' },
  credit_card: { label: 'Credit Card', icon: '💳', color: '#EF4444' },
  car_loan: { label: 'Car Loan', icon: '🚗', color: '#F59E0B' },
  renovation_loan: { label: 'Renovation Loan', icon: '🔨', color: '#06B6D4' },
  education_loan: { label: 'Education Loan', icon: '🎓', color: '#00C896' },
  business_loan: { label: 'Business Loan', icon: '💼', color: '#84CC16' },
};

const securityTypeConfig: Record<LoanSecurityType, { label: string; color: string }> = {
  secured: { label: 'Secured', color: '#1A3C5E' },
  unsecured_interest_bearing: { label: 'Unsecured (Interest)', color: '#F59E0B' },
  unsecured_non_interest: { label: 'Unsecured (Non-Interest)', color: '#8B5CF6' },
  exempted: { label: 'Exempted', color: '#00C896' },
};

// ─── Trend Line Chart ─────────────────────────────────────────────────────────
function TrendChart({ history }: { history: typeof aggregatedBalanceHistory }) {
  const colors = useAppColors();
  const width = 340;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 24, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = history.map(h => h.secured + h.unsecuredInterestBearing + h.unsecuredNonInterest);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = history.map((_, i) => {
    const x = padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top + chartH - ((values[i] - minVal) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const formatM = (v: number) => `${(v / 1000000).toFixed(2)}M`;

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth={2} />
      {history.map((h, i) => {
        const x = padding.left + (i / (history.length - 1)) * chartW;
        const y = padding.top + chartH - ((values[i] - minVal) / range) * chartH;
        return <Circle key={i} cx={x} cy={y} r={3} fill={colors.accent} />;
      })}
      {history.map((h, i) => {
        const x = padding.left + (i / (history.length - 1)) * chartW;
        return (
          <SvgText key={i} x={x} y={height - 4} textAnchor="middle" fontSize={8} fill={colors.muted}>
            {h.month.split(' ')[0].slice(0, 3)}
          </SvgText>
        );
      })}
      <SvgText x={padding.left - 4} y={padding.top + 4} textAnchor="end" fontSize={8} fill={colors.muted}>
        {formatM(maxVal)}
      </SvgText>
      <SvgText x={padding.left - 4} y={padding.top + chartH} textAnchor="end" fontSize={8} fill={colors.muted}>
        {formatM(minVal)}
      </SvgText>
    </Svg>
  );
}

// ─── Loan Card ────────────────────────────────────────────────────────────────
function LoanCard({ loan, onEdit, onDelete }: { loan: Loan; onEdit: () => void; onDelete: () => void }) {
  const colors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const cfg = loanTypeConfig[loan.loanType];
  const secCfg = securityTypeConfig[loan.securityType];
  const totalInterest = calcTotalInterestPayable(loan);
  const totalPaid = calcTotalPaid(loan);
  const progressPct = loan.totalMonths > 0 ? ((loan.totalMonths - loan.monthsRemaining) / loan.totalMonths) * 100 : 0;
  const yearsLeft = Math.floor(loan.monthsRemaining / 12);
  const monthsLeft = loan.monthsRemaining % 12;

  return (
    <View style={[styles.loanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        <View style={styles.loanHeader}>
          <View style={styles.loanHeaderLeft}>
            <Text style={styles.loanIcon}>{cfg.icon}</Text>
            <View>
              <Text style={[styles.loanType, { color: colors.foreground }]}>{cfg.label}</Text>
              <Text style={[styles.loanBank, { color: colors.muted }]}>{loan.bankName}</Text>
            </View>
          </View>
          <View style={styles.loanHeaderRight}>
            <Text style={[styles.loanBalance, { color: colors.error }]}>{formatCurrency(loan.outstandingBalance, loan.currency)}</Text>
            <View style={[styles.secBadge, { backgroundColor: secCfg.color + '20' }]}>
              <Text style={[styles.secBadgeText, { color: secCfg.color }]}>{secCfg.label}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: cfg.color }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>Paid {progressPct.toFixed(0)}%</Text>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>
              {yearsLeft > 0 ? `${yearsLeft}y ` : ''}{monthsLeft}mo left
            </Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.loanStats}>
          <View style={styles.loanStat}>
            <Text style={[styles.loanStatLabel, { color: colors.muted }]}>Monthly</Text>
            <Text style={[styles.loanStatValue, { color: colors.warning }]}>{formatCurrency(loan.monthlyInstalment, loan.currency)}</Text>
          </View>
          <View style={styles.loanStat}>
            <Text style={[styles.loanStatLabel, { color: colors.muted }]}>Interest p.a.</Text>
            <Text style={[styles.loanStatValue, { color: colors.foreground }]}>{loan.interestRate.toFixed(2)}%</Text>
          </View>
          <View style={styles.loanStat}>
            <Text style={[styles.loanStatLabel, { color: colors.muted }]}>Total Interest</Text>
            <Text style={[styles.loanStatValue, { color: colors.error }]}>{formatCurrency(Math.max(0, totalInterest), loan.currency)}</Text>
          </View>
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.loanExpanded, { borderTopColor: colors.border }]}>
          <View style={styles.expandedGrid}>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Original Amount</Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>{formatCurrency(loan.originalAmount, loan.currency)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Total Paid</Text>
              <Text style={[styles.expandedValue, { color: colors.success }]}>{formatCurrency(totalPaid, loan.currency)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Outstanding</Text>
              <Text style={[styles.expandedValue, { color: colors.error }]}>{formatCurrency(loan.outstandingBalance, loan.currency)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Start Date</Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>{loan.startDate}</Text>
            </View>
          </View>
          <View style={styles.expandedActions}>
            <Pressable onPress={onEdit} style={[styles.expandedBtn, { borderColor: colors.primary }]}>
              <IconSymbol name="pencil" size={14} color={colors.primary} />
              <Text style={[styles.expandedBtnText, { color: colors.primary }]}>Edit</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={[styles.expandedBtn, { borderColor: colors.error }]}>
              <IconSymbol name="trash.fill" size={14} color={colors.error} />
              <Text style={[styles.expandedBtnText, { color: colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Add/Edit Loan Modal ──────────────────────────────────────────────────────
function LoanModal({ visible, loan, onClose, onSave }: {
  visible: boolean;
  loan?: Loan;
  onClose: () => void;
  onSave: (data: Omit<Loan, 'id'>) => void;
}) {
  const colors = useAppColors();
  const [bankName, setBankName] = useState(loan?.bankName || '');
  const [loanType, setLoanType] = useState<LoanType>(loan?.loanType || 'personal_loan');
  const [securityType, setSecurityType] = useState<LoanSecurityType>(loan?.securityType || 'unsecured_interest_bearing');
  const [originalAmount, setOriginalAmount] = useState(loan?.originalAmount?.toString() || '');
  const [outstandingBalance, setOutstandingBalance] = useState(loan?.outstandingBalance?.toString() || '');
  const [interestRate, setInterestRate] = useState(loan?.interestRate?.toString() || '');
  const [monthlyInstalment, setMonthlyInstalment] = useState(loan?.monthlyInstalment?.toString() || '');
  const [monthsRemaining, setMonthsRemaining] = useState(loan?.monthsRemaining?.toString() || '');
  const [totalMonths, setTotalMonths] = useState(loan?.totalMonths?.toString() || '');

  React.useEffect(() => {
    if (visible) {
      setBankName(loan?.bankName || '');
      setLoanType(loan?.loanType || 'personal_loan');
      setSecurityType(loan?.securityType || 'unsecured_interest_bearing');
      setOriginalAmount(loan?.originalAmount?.toString() || '');
      setOutstandingBalance(loan?.outstandingBalance?.toString() || '');
      setInterestRate(loan?.interestRate?.toString() || '');
      setMonthlyInstalment(loan?.monthlyInstalment?.toString() || '');
      setMonthsRemaining(loan?.monthsRemaining?.toString() || '');
      setTotalMonths(loan?.totalMonths?.toString() || '');
    }
  }, [visible, loan]);

  const handleSave = () => {
    if (!bankName.trim()) { Alert.alert('Required', 'Please enter bank name'); return; }
    onSave({
      bankName: bankName.trim(),
      loanType,
      securityType,
      originalAmount: parseFloat(originalAmount) || 0,
      outstandingBalance: parseFloat(outstandingBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      monthlyInstalment: parseFloat(monthlyInstalment) || 0,
      monthsRemaining: parseInt(monthsRemaining) || 0,
      totalMonths: parseInt(totalMonths) || 0,
      startDate: loan?.startDate || new Date().toISOString().split('T')[0],
      currency: 'SGD',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{loan ? 'Edit Loan' : 'Add Loan'}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Bank / Lender</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={bankName} onChangeText={setBankName} placeholder="e.g. Bank A" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Loan Type</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(loanTypeConfig) as LoanType[]).map(t => (
                <Pressable key={t} onPress={() => setLoanType(t)}
                  style={[styles.typeOption, {
                    borderColor: loanType === t ? loanTypeConfig[t].color : colors.border,
                    backgroundColor: loanType === t ? loanTypeConfig[t].color + '15' : colors.surface,
                  }]}>
                  <Text style={styles.typeOptionEmoji}>{loanTypeConfig[t].icon}</Text>
                  <Text style={[styles.typeOptionText, { color: loanType === t ? loanTypeConfig[t].color : colors.muted }]}>
                    {loanTypeConfig[t].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Security Type</Text>
            <View style={styles.secGrid}>
              {(Object.keys(securityTypeConfig) as LoanSecurityType[]).map(t => (
                <Pressable key={t} onPress={() => setSecurityType(t)}
                  style={[styles.secOption, {
                    borderColor: securityType === t ? securityTypeConfig[t].color : colors.border,
                    backgroundColor: securityType === t ? securityTypeConfig[t].color + '15' : colors.surface,
                  }]}>
                  <Text style={[styles.secOptionText, { color: securityType === t ? securityTypeConfig[t].color : colors.muted }]}>
                    {securityTypeConfig[t].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Original Amount</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={originalAmount} onChangeText={setOriginalAmount} keyboardType="numeric" placeholder="300000" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Outstanding</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={outstandingBalance} onChangeText={setOutstandingBalance} keyboardType="numeric" placeholder="157000" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Interest Rate %</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" placeholder="2.6" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Monthly Instalment</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={monthlyInstalment} onChangeText={setMonthlyInstalment} keyboardType="numeric" placeholder="1450" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Months Remaining</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={monthsRemaining} onChangeText={setMonthsRemaining} keyboardType="numeric" placeholder="108" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Total Months</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={totalMonths} onChangeText={setTotalMonths} keyboardType="numeric" placeholder="240" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveBtnText}>Save Loan</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Loans Screen ────────────────────────────────────────────────────────
export default function LoansScreen() {
  const colors = useAppColors();
  const { data, addLoan, updateLoan, deleteLoan } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | undefined>();

  const totalSecured = useMemo(() => data.loans.filter(l => l.securityType === 'secured').reduce((s, l) => s + l.outstandingBalance, 0), [data.loans]);
  const totalUnsecuredIB = useMemo(() => data.loans.filter(l => l.securityType === 'unsecured_interest_bearing').reduce((s, l) => s + l.outstandingBalance, 0), [data.loans]);
  const totalUnsecuredNI = useMemo(() => data.loans.filter(l => l.securityType === 'unsecured_non_interest').reduce((s, l) => s + l.outstandingBalance, 0), [data.loans]);
  const totalOutstanding = totalSecured + totalUnsecuredIB + totalUnsecuredNI;
  const totalMonthly = useMemo(() => data.loans.reduce((s, l) => s + l.monthlyInstalment, 0), [data.loans]);
  const totalInterest = useMemo(() => data.loans.reduce((s, l) => s + Math.max(0, calcTotalInterestPayable(l)), 0), [data.loans]);

  const handleEdit = (loan: Loan) => { setEditingLoan(loan); setModalVisible(true); };
  const handleDelete = (loan: Loan) => {
    Alert.alert('Delete Loan', `Remove ${loanTypeConfig[loan.loanType].label} from ${loan.bankName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLoan(loan.id) },
    ]);
  };
  const handleSave = async (loanData: Omit<Loan, 'id'>) => {
    if (editingLoan) { await updateLoan(editingLoan.id, loanData); }
    else { await addLoan(loanData); }
    setEditingLoan(undefined);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerTitle}>Loans & Liabilities</Text>
            <Text style={styles.headerSub}>{data.loans.length} active loan{data.loans.length !== 1 ? 's' : ''}</Text>
          </View>
          <Pressable onPress={() => { setEditingLoan(undefined); setModalVisible(true); }}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
            <IconSymbol name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.summaryMainLabel}>Total Outstanding</Text>
            <Text style={styles.summaryMainValue}>{formatCurrency(totalOutstanding)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Monthly Payments</Text>
                <Text style={[styles.summaryStatValue, { color: '#FBBF24' }]}>{formatCurrency(totalMonthly)}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Total Interest</Text>
                <Text style={[styles.summaryStatValue, { color: '#F87171' }]}>{formatCurrency(totalInterest)}</Text>
              </View>
            </View>
          </View>

          {/* CBS Aggregated Balances Table */}
          <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.tableHeaderRow, { backgroundColor: colors.primary }]}>
              <Text style={styles.tableHeaderText}>Aggregated Outstanding Balances (CBS Format)</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={[styles.tableRow, { backgroundColor: colors.primary + '30' }]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 80 }]}>Month</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 100 }]}>Secured</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 110 }]}>Unsecured (IB)</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 110 }]}>Unsecured (NIB)</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 80 }]}>Exempted</Text>
                </View>
                {aggregatedBalanceHistory.map((row, i) => (
                  <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? colors.surface : colors.background }]}>
                    <Text style={[styles.tableCell, { color: colors.foreground, width: 80, fontWeight: i === 0 ? '700' : '400' }]}>{row.month}</Text>
                    <Text style={[styles.tableCell, { color: colors.foreground, width: 100 }]}>{row.secured.toLocaleString()}</Text>
                    <Text style={[styles.tableCell, { color: colors.foreground, width: 110 }]}>{row.unsecuredInterestBearing.toLocaleString()}</Text>
                    <Text style={[styles.tableCell, { color: colors.foreground, width: 110 }]}>{row.unsecuredNonInterest.toLocaleString()}</Text>
                    <Text style={[styles.tableCell, { color: colors.muted, width: 80 }]}>{row.exempted.toLocaleString()}</Text>
                  </View>
                ))}
                <View style={[styles.tableRow, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.foreground, width: 80 }]}>Total</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.error, width: 100 }]}>{aggregatedBalanceHistory[0].secured.toLocaleString()}</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.error, width: 110 }]}>{aggregatedBalanceHistory[0].unsecuredInterestBearing.toLocaleString()}</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.error, width: 110 }]}>{aggregatedBalanceHistory[0].unsecuredNonInterest.toLocaleString()}</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.muted, width: 80 }]}>0</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* 6-Month Trend Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>6-Month Outstanding Trend</Text>
            <Text style={[styles.chartSub, { color: colors.muted }]}>Total outstanding balance over time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TrendChart history={aggregatedBalanceHistory} />
            </ScrollView>
          </View>

          {/* Loan Cards */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan Details</Text>
          {data.loans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No loans recorded. Tap + to add a loan.</Text>
            </View>
          ) : (
            data.loans.map(loan => (
              <LoanCard key={loan.id} loan={loan}
                onEdit={() => handleEdit(loan)}
                onDelete={() => handleDelete(loan)} />
            ))
          )}
        </View>
      </ScrollView>

      <LoanModal
        visible={modalVisible}
        loan={editingLoan}
        onClose={() => { setModalVisible(false); setEditingLoan(undefined); }}
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
  summaryMainLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryMainValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 4, marginBottom: 12, letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryStat: { flex: 1 },
  summaryStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  summaryStatValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  summaryDivider: { width: 1, height: 36 },
  tableCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  tableHeaderRow: { padding: 12 },
  tableHeaderText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  tableCell: { fontSize: 11, paddingRight: 8 },
  tableCellHeader: { fontWeight: '700', fontSize: 11 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  chartSub: { fontSize: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  loanCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  loanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  loanHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loanIcon: { fontSize: 28 },
  loanType: { fontSize: 15, fontWeight: '700' },
  loanBank: { fontSize: 12, marginTop: 1 },
  loanHeaderRight: { alignItems: 'flex-end', gap: 4 },
  loanBalance: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  secBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  secBadgeText: { fontSize: 10, fontWeight: '600' },
  progressSection: { paddingHorizontal: 14, paddingBottom: 10 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11 },
  loanStats: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  loanStat: { flex: 1, alignItems: 'center' },
  loanStatLabel: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  loanStatValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  loanExpanded: { borderTopWidth: 1, padding: 14 },
  expandedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  expandedItem: { width: '45%' },
  expandedLabel: { fontSize: 11, marginBottom: 2 },
  expandedValue: { fontSize: 14, fontWeight: '700' },
  expandedActions: { flexDirection: 'row', gap: 10 },
  expandedBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 10, padding: 10 },
  expandedBtnText: { fontSize: 13, fontWeight: '600' },
  emptyState: { borderRadius: 16, padding: 32, borderWidth: 1, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  // Modal
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 0 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: { padding: 20, gap: 4, paddingBottom: 40 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  inputRow: { flexDirection: 'row', gap: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeOption: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: '22%', flex: 1 },
  typeOptionEmoji: { fontSize: 20, marginBottom: 4 },
  typeOptionText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  secGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secOption: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center', flex: 1 },
  secOptionText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
