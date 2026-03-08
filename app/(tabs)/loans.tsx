import React, { useState, useMemo, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { Loan, LoanType, LoanSecurityType } from '@/lib/types';
import { formatCurrency } from '@/lib/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

// ─── Loan Card ────────────────────────────────────────────────────────────────
function LoanCard({ loan, onEdit, onDelete }: { loan: Loan; onEdit: () => void; onDelete: () => void }) {
  const colors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const cfg = loanTypeConfig[loan.loanType];
  const secCfg = securityTypeConfig[loan.securityType];
  const totalInterest = (loan.originalAmount * loan.interestRate * loan.monthsRemaining) / 100 / 12;
  const totalPaid = (loan.originalAmount - loan.outstandingBalance);
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
            <Text style={[styles.loanAmount, { color: colors.foreground }]}>{formatCurrency(loan.outstandingBalance)}</Text>
            <Text style={[styles.loanRemaining, { color: colors.muted }]}>{yearsLeft}y {monthsLeft}m left</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: cfg.color }]} />
        </View>

        {/* Summary Row */}
        <View style={styles.loanSummary}>
          <View style={styles.loanSummaryItem}>
            <Text style={[styles.loanSummaryLabel, { color: colors.muted }]}>Monthly</Text>
            <Text style={[styles.loanSummaryValue, { color: colors.foreground }]}>{formatCurrency(loan.monthlyInstalment)}</Text>
          </View>
          <View style={[styles.loanSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.loanSummaryItem}>
            <Text style={[styles.loanSummaryLabel, { color: colors.muted }]}>Interest Rate</Text>
            <Text style={[styles.loanSummaryValue, { color: colors.foreground }]}>{loan.interestRate}%</Text>
          </View>
          <View style={[styles.loanSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.loanSummaryItem}>
            <Text style={[styles.loanSummaryLabel, { color: colors.muted }]}>Type</Text>
            <Text style={[styles.loanSummaryValue, { color: secCfg.color }]}>{secCfg.label}</Text>
          </View>
        </View>
      </Pressable>

      {/* Expanded Details */}
      {expanded && (
        <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Original Amount</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{formatCurrency(loan.originalAmount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Total Paid</Text>
            <Text style={[styles.detailValue, { color: colors.success }]}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Remaining Interest</Text>
            <Text style={[styles.detailValue, { color: colors.error }]}>{formatCurrency(totalInterest)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Progress</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{progressPct.toFixed(1)}%</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable onPress={onEdit} style={({ pressed }) => [styles.editBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={({ pressed }) => [styles.deleteBtn, { backgroundColor: colors.error, opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Loan Modal ────────────────────────────────────────────────────────────────
function LoanModal({ visible, loan, onClose, onSave }: { visible: boolean; loan?: Loan; onClose: () => void; onSave: (data: Omit<Loan, 'id'>) => void }) {
  const colors = useAppColors();
  const [bankName, setBankName] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('personal_loan');
  const [securityType, setSecurityType] = useState<LoanSecurityType>('unsecured_interest_bearing');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyInstalment, setMonthlyInstalment] = useState('');
  const [monthsRemaining, setMonthsRemaining] = useState('');
  const [totalMonths, setTotalMonths] = useState('');

  React.useEffect(() => {
    if (visible && loan) {
      setBankName(loan.bankName);
      setLoanType(loan.loanType);
      setSecurityType(loan.securityType);
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
                  value={monthsRemaining} onChangeText={setMonthsRemaining} keyboardType="numeric" placeholder="240" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Total Months</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={totalMonths} onChangeText={setTotalMonths} keyboardType="numeric" placeholder="360" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.saveBtnText}>{loan ? 'Update Loan' : 'Add Loan'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Loans Screen ─────────────────────────────────────────────────────────
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
  const totalInterest = useMemo(() => data.loans.reduce((s, l) => s + Math.max(0, (l.originalAmount * l.interestRate * l.monthsRemaining) / 100 / 12), 0), [data.loans]);

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

          {/* Loan Breakdown by Security Type */}
          <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.breakdownTitle, { color: colors.foreground }]}>Loan Breakdown by Security Type</Text>
            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: colors.muted }]}>Secured</Text>
                <Text style={[styles.breakdownValue, { color: colors.success }]}>{formatCurrency(totalSecured)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: colors.muted }]}>Unsecured (Interest)</Text>
                <Text style={[styles.breakdownValue, { color: colors.warning }]}>{formatCurrency(totalUnsecuredIB)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: colors.muted }]}>Unsecured (Non-Interest)</Text>
                <Text style={[styles.breakdownValue, { color: colors.error }]}>{formatCurrency(totalUnsecuredNI)}</Text>
              </View>
            </View>
          </View>

          {/* Loan Cards */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan Details</Text>
          {data.loans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={[styles.emptyText, { color: colors.foreground }]}>No loans yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.muted }]}>Add your loans to track payments and interest</Text>
            </View>
          ) : (
            data.loans.map(loan => (
              <LoanCard key={loan.id} loan={loan} onEdit={() => handleEdit(loan)} onDelete={() => handleDelete(loan)} />
            ))
          )}
        </View>
      </ScrollView>

      <LoanModal visible={modalVisible} loan={editingLoan} onClose={() => { setModalVisible(false); setEditingLoan(undefined); }} onSave={handleSave} />
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  summaryCard: { borderRadius: 12, padding: 16, marginBottom: 8 },
  summaryMainLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  summaryMainValue: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryStatValue: { fontSize: 16, fontWeight: 'bold' },
  summaryDivider: { width: 1, height: 40, marginHorizontal: 12 },
  breakdownCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  breakdownTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  breakdownGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  breakdownItem: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  breakdownLabel: { fontSize: 11, marginBottom: 6 },
  breakdownValue: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  loanCard: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  loanHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  loanIcon: { fontSize: 28 },
  loanType: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  loanBank: { fontSize: 12 },
  loanHeaderRight: { alignItems: 'flex-end' },
  loanAmount: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  loanRemaining: { fontSize: 12 },
  progressBar: { height: 6, borderRadius: 3, marginHorizontal: 12, marginVertical: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  loanSummary: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, alignItems: 'center' },
  loanSummaryItem: { flex: 1, alignItems: 'center' },
  loanSummaryLabel: { fontSize: 10, marginBottom: 4 },
  loanSummaryValue: { fontSize: 13, fontWeight: '600' },
  loanSummaryDivider: { width: 1, height: 32, marginHorizontal: 8 },
  expandedDetails: { borderTopWidth: 1, padding: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 13, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  editBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  deleteBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyState: { borderRadius: 12, borderWidth: 1, padding: 32, alignItems: 'center', marginVertical: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalBody: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  inputRow: { flexDirection: 'row', gap: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeOption: { flex: 0.45, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center', gap: 6 },
  typeOptionEmoji: { fontSize: 24 },
  typeOptionText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  secGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  secOption: { flex: 0.45, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  secOptionText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  saveBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
