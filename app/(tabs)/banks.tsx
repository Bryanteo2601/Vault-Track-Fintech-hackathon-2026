import React, { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Modal,
  TextInput, FlatList, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { BankAccount, AccountType, Loan } from '@/lib/types';
import { formatCurrency } from '@/lib/store';
import { calculateCBSScore } from '@/lib/cbs-score-calculator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { glassContainerStyle, glassDeepStyle, glassLightStyle } from '@/lib/glass-utils';
import Svg, { Circle, G, Path } from 'react-native-svg';

// ─── CBS Credit Score Gauge ───────────────────────────────────────────────────
function CreditScoreGauge({ score, grade, color }: { score: number; grade: string; color: string }) {
  const colors = useAppColors();
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // CBS scale: 1000–2000
  const progress = ((score - 1000) / 1000) * circumference;

  return (
    <View style={styles.gaugeWrap}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
        </G>
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugeScore, { color }]}>{score}</Text>
        <Text style={[styles.gaugeGrade, { color }]}>Grade {grade}</Text>
        <Text style={[styles.gaugeLabel, { color: colors.muted }]}>CBS Score</Text>
      </View>
    </View>
  );
}

// ─── Credit Factor Bar ────────────────────────────────────────────────────────
function CreditFactorBar({ label, value, weight, color }: { label: string; value: number; weight: string; color: string }) {
  const colors = useAppColors();
  return (
    <View style={styles.factorRow}>
      <View style={styles.factorLabelRow}>
        <Text style={[styles.factorLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.factorWeight, { color: colors.muted }]}>{weight}</Text>
        <Text style={[styles.factorValue, { color }]}>{value}%</Text>
      </View>
      <View style={[styles.factorTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.factorFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ─── Account Type Badge ───────────────────────────────────────────────────────
const accountTypeConfig: Record<AccountType, { label: string; color: string; icon: string }> = {
  savings: { label: 'Savings', color: '#00C896', icon: '💰' },
  daily: { label: 'Daily Spending', color: '#1A3C5E', icon: '💳' },
  credit: { label: 'Credit', color: '#EF4444', icon: '🔴' },
  investment: { label: 'Investment', color: '#8B5CF6', icon: '📈' },
  fixed_deposit: { label: 'Fixed Deposit', color: '#F59E0B', icon: '🏦' },
};

// ─── Account Card ─────────────────────────────────────────────────────────────
function AccountCard({ account, onEdit, onDelete }: { account: BankAccount; onEdit: () => void; onDelete: () => void }) {
  const colors = useAppColors();
  const cfg = accountTypeConfig[account.accountType];
  const isNegative = account.balance < 0;

  return (
    <View style={[glassContainerStyle, styles.accountCard]}>
      <View style={styles.accountHeader}>
        <View style={styles.accountLeft}>
          <Text style={styles.accountEmoji}>{cfg.icon}</Text>
          <View>
            <Text style={[styles.accountBank, { color: colors.foreground }]}>{account.bankName}</Text>
            <Text style={[styles.accountNum, { color: colors.muted }]}>{account.accountNumber}</Text>
          </View>
        </View>
        <View style={styles.accountActions}>
          <Pressable onPress={onEdit} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <IconSymbol name="pencil" size={16} color={colors.muted} />
          </Pressable>
          <Pressable onPress={onDelete} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <IconSymbol name="trash.fill" size={16} color={colors.error} />
          </Pressable>
        </View>
      </View>
      <View style={styles.accountBody}>
        <View>
          <Text style={[styles.accountBalance, { color: isNegative ? colors.error : colors.foreground }]}>
            {formatCurrency(account.balance, account.currency)}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={styles.accountRight}>
          <Text style={[styles.interestLabel, { color: colors.muted }]}>Interest p.a.</Text>
          <Text style={[styles.interestValue, { color: account.interestRate > 0 ? colors.success : colors.muted }]}>
            {account.interestRate.toFixed(2)}%
          </Text>
          {account.accountType === 'savings' || account.accountType === 'fixed_deposit' ? (
            <Text style={[styles.interestEarned, { color: colors.success }]}>
              +{formatCurrency((account.balance * account.interestRate) / 100 / 12)}/mo
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Add/Edit Account Modal ───────────────────────────────────────────────────
function AccountModal({ visible, account, onClose, onSave }: {
  visible: boolean;
  account?: BankAccount;
  onClose: () => void;
  onSave: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void;
}) {
  const colors = useAppColors();
  const [bankName, setBankName] = useState(account?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
  const [accountType, setAccountType] = useState<AccountType>(account?.accountType || 'savings');
  const [balance, setBalance] = useState(account?.balance?.toString() || '');
  const [interestRate, setInterestRate] = useState(account?.interestRate?.toString() || '');

  React.useEffect(() => {
    if (visible) {
      setBankName(account?.bankName || '');
      setAccountNumber(account?.accountNumber || '');
      setAccountType(account?.accountType || 'savings');
      setBalance(account?.balance?.toString() || '');
      setInterestRate(account?.interestRate?.toString() || '');
    }
  }, [visible, account]);

  const handleSave = () => {
    if (!bankName.trim()) { Alert.alert('Required', 'Please enter bank name'); return; }
    onSave({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim() || '****',
      accountType,
      balance: parseFloat(balance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      currency: 'SGD',
      isPrimary: false,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{account ? 'Edit Account' : 'Add Bank Account'}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Bank Name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={bankName} onChangeText={setBankName} placeholder="e.g. DBS Bank" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Account Number (last 4 digits)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={accountNumber} onChangeText={setAccountNumber} placeholder="****1234" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Account Type</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(accountTypeConfig) as AccountType[]).map(t => (
                <Pressable key={t} onPress={() => setAccountType(t)}
                  style={[styles.typeOption, { borderColor: accountType === t ? accountTypeConfig[t].color : colors.border, backgroundColor: accountType === t ? accountTypeConfig[t].color + '15' : colors.surface }]}>
                  <Text style={styles.typeOptionEmoji}>{accountTypeConfig[t].icon}</Text>
                  <Text style={[styles.typeOptionText, { color: accountType === t ? accountTypeConfig[t].color : colors.muted }]}>{accountTypeConfig[t].label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Balance (SGD)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={balance} onChangeText={setBalance} keyboardType="numeric" placeholder="45000" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Interest Rate (% p.a.)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" placeholder="3.5" placeholderTextColor={colors.muted} />

            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveBtnText}>Save Account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

//// ─── Helper: Get grade color ──────────────────────────────────────────────────
function getGradeColor(grade: string, colors: any): string {
  switch (grade) {
    case 'A': return colors.success;
    case 'B+':
    case 'B': return '#10B981';
    case 'B-': return colors.warning;
    case 'C': return colors.warning;
    case '-': return colors.muted;
    default: return colors.error;
  }
}

// ─── Main Banks Screen ────────────────────────────────────────────────────
export default function BanksScreen() {
  const colors = useAppColors();
  const { data, addBankAccount, updateBankAccount, deleteBankAccount } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>();

  const monthlyIncome = 5000; // TODO: Get from user profile
  const cbsScore = useMemo(() => calculateCBSScore(data, monthlyIncome), [data, monthlyIncome]);
  const maxLoan = useMemo(() => cbsScore.estimatedMaxLoan, [cbsScore]);

  const totalBalance = useMemo(
    () => data.bankAccounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0),
    [data.bankAccounts]
  );
  const totalInterestEarned = useMemo(
    () => data.bankAccounts
      .filter(a => ['savings', 'fixed_deposit'].includes(a.accountType) && a.balance > 0)
      .reduce((s, a) => s + (a.balance * a.interestRate) / 100 / 12, 0),
    [data.bankAccounts]
  );
  const totalMonthlyDebt = useMemo(
    () => data.loans.reduce((s, l) => s + l.monthlyInstalment, 0),
    [data.loans]
  );

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert('Delete Account', `Remove ${account.bankName} account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBankAccount(account.id) },
    ]);
  };

  const handleSave = async (accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    if (editingAccount) {
      await updateBankAccount(editingAccount.id, accountData);
    } else {
      await addBankAccount(accountData);
    }
    setEditingAccount(undefined);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerTitle}>Banks & Accounts</Text>
            <Text style={styles.headerSub}>Manage your banking relationships</Text>
          </View>
          <Pressable onPress={() => { setEditingAccount(undefined); setModalVisible(true); }}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
            <IconSymbol name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <View style={[glassContainerStyle, styles.summaryCard]}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Total Balance</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatCurrency(totalBalance)}</Text>
            </View>
            <View style={[glassContainerStyle, styles.summaryCard]}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Interest/Month</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>+{formatCurrency(totalInterestEarned)}</Text>
            </View>
            <View style={[glassContainerStyle, styles.summaryCard]}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Monthly Debt</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>{formatCurrency(totalMonthlyDebt)}</Text>
            </View>
          </View>

          {/* Accounts */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Accounts ({data.bankAccounts.length})</Text>
          {data.bankAccounts.length === 0 ? (
            <View style={[glassContainerStyle, styles.emptyState]}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No bank accounts yet. Tap + to add one.</Text>
            </View>
          ) : (
            data.bankAccounts.map(account => (
              <AccountCard key={account.id} account={account}
                onEdit={() => handleEdit(account)}
                onDelete={() => handleDelete(account)} />
            ))
          )}

          {/* Credit Score Section */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Credit Bureau Singapore</Text>
          {cbsScore.score === 0 ? (
            <View style={[glassContainerStyle, styles.emptyState]}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No credit score data yet. Add bank accounts and loans to build your credit history.</Text>
            </View>
          ) : (
            <View style={[glassContainerStyle, styles.creditCard]}>
              <View style={styles.creditTop}>
                <CreditScoreGauge score={cbsScore.score} grade={cbsScore.grade} color={getGradeColor(cbsScore.grade, colors)} />
                <View style={styles.creditRight}>
                  <Text style={[styles.creditTitle, { color: colors.foreground }]}>CBS Credit Score</Text>
                  <Text style={[styles.creditSub, { color: colors.muted }]}>Scale: 1000–2000</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(cbsScore.grade, colors) + '20' }]}>
                    <Text style={[styles.gradeBadgeText, { color: getGradeColor(cbsScore.grade, colors) }]}>Grade {cbsScore.grade}</Text>
                  </View>
                  <Text style={[styles.maxLoanLabel, { color: colors.muted }]}>Estimated Max Loan</Text>
                  <Text style={[styles.maxLoanValue, { color: colors.primary }]}>{formatCurrency(maxLoan)}</Text>
                  <Text style={[styles.maxLoanNote, { color: colors.muted }]}>Based on 55% TDSR</Text>
                  <Text style={[styles.lastUpdated, { color: colors.muted }]}>Updated: {cbsScore.lastUpdated.toLocaleDateString()}</Text>
                </View>
              </View>

              {/* CBS Factor Breakdown */}
              <View style={[styles.factorDivider, { backgroundColor: colors.border }]} />
              <Text style={[styles.factorTitle, { color: colors.foreground }]}>Score Breakdown</Text>
              <CreditFactorBar label="Payment History" value={cbsScore.paymentHistoryScore} weight="35%" color={cbsScore.paymentHistoryScore >= 80 ? colors.success : colors.warning} />
              <CreditFactorBar label="Amounts Owed" value={cbsScore.amountsOwedScore} weight="30%" color={cbsScore.amountsOwedScore <= 50 ? colors.success : colors.warning} />
              <CreditFactorBar label="Length of Credit" value={cbsScore.lengthOfCreditScore} weight="15%" color={cbsScore.lengthOfCreditScore >= 70 ? colors.success : colors.warning} />
              <CreditFactorBar label="Credit Mix" value={cbsScore.creditMixScore} weight="10%" color={cbsScore.creditMixScore >= 60 ? colors.success : colors.warning} />
              <CreditFactorBar label="New Credit" value={cbsScore.newCreditScore} weight="10%" color={cbsScore.newCreditScore >= 60 ? colors.success : colors.warning} />
              {cbsScore.warnings.length > 0 && (
                <View style={[styles.warningsBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
                  {cbsScore.warnings.map((warning, idx) => (
                    <Text key={idx} style={[styles.warningText, { color: colors.warning }]}>• {warning}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Loans per Bank Summary */}
          {data.loans.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loans by Bank</Text>
              {Array.from(new Set(data.loans.map(l => l.bankName))).map(bank => {
                const bankLoans = data.loans.filter(l => l.bankName === bank);
                const totalOutstanding = bankLoans.reduce((s, l) => s + l.outstandingBalance, 0);
                const totalMonthly = bankLoans.reduce((s, l) => s + l.monthlyInstalment, 0);
                return (
                  <View key={bank} style={[glassContainerStyle, styles.bankLoanCard]}>
                    <View style={styles.bankLoanHeader}>
                      <Text style={[styles.bankLoanName, { color: colors.foreground }]}>{bank}</Text>
                      <Text style={[styles.bankLoanCount, { color: colors.muted }]}>{bankLoans.length} loan{bankLoans.length !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.bankLoanStats}>
                      <View>
                        <Text style={[styles.bankLoanStatLabel, { color: colors.muted }]}>Outstanding</Text>
                        <Text style={[styles.bankLoanStatValue, { color: colors.error }]}>{formatCurrency(totalOutstanding)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.bankLoanStatLabel, { color: colors.muted }]}>Monthly</Text>
                        <Text style={[styles.bankLoanStatValue, { color: colors.warning }]}>{formatCurrency(totalMonthly)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>

      <AccountModal
        visible={modalVisible}
        account={editingAccount}
        onClose={() => { setModalVisible(false); setEditingAccount(undefined); }}
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
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center', marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  accountCard: { borderRadius: 16, padding: 16, marginBottom: 0 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountEmoji: { fontSize: 28 },
  accountBank: { fontSize: 16, fontWeight: '700' },
  accountNum: { fontSize: 12, marginTop: 1 },
  accountActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  accountBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  accountBalance: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  accountRight: { alignItems: 'flex-end' },
  interestLabel: { fontSize: 11 },
  interestValue: { fontSize: 18, fontWeight: '700' },
  interestEarned: { fontSize: 11, marginTop: 2 },
  emptyState: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  creditCard: { borderRadius: 16, padding: 16 },
  creditTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  gaugeWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeScore: { fontSize: 26, fontWeight: '800', letterSpacing: -1 },
  gaugeGrade: { fontSize: 14, fontWeight: '700' },
  gaugeLabel: { fontSize: 10, marginTop: 2 },
  creditRight: { flex: 1, gap: 4 },
  creditTitle: { fontSize: 16, fontWeight: '700' },
  creditSub: { fontSize: 12 },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  gradeBadgeText: { fontSize: 13, fontWeight: '700' },
  maxLoanLabel: { fontSize: 11, marginTop: 8 },
  maxLoanValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  maxLoanNote: { fontSize: 10 },
  lastUpdated: { fontSize: 9, marginTop: 6 },
  factorDivider: { height: 1, marginVertical: 12 },
  factorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  factorRow: { marginBottom: 10 },
  factorLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  factorLabel: { flex: 1, fontSize: 12, fontWeight: '500' },
  factorWeight: { fontSize: 11, marginRight: 8 },
  factorValue: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  factorTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  factorFill: { height: 6, borderRadius: 3 },
  warningsBox: { borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1 },
  warningText: { fontSize: 12, marginBottom: 6, lineHeight: 18 },
  bankLoanCard: { borderRadius: 14, padding: 14 },
  bankLoanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  bankLoanName: { fontSize: 15, fontWeight: '700' },
  bankLoanCount: { fontSize: 12 },
  bankLoanStats: { flexDirection: 'row', gap: 24 },
  bankLoanStatLabel: { fontSize: 11, marginBottom: 2 },
  bankLoanStatValue: { fontSize: 16, fontWeight: '700' },
  // Modal
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 0 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: { padding: 20, gap: 4, paddingBottom: 40 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeOption: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: '30%', flex: 1 },
  typeOptionEmoji: { fontSize: 20, marginBottom: 4 },
  typeOptionText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
