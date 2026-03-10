import React, { useState, useMemo, useCallback } from 'react';
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
          <Text style={[styles.accountLabel, { color: colors.muted }]}>Interest p.a.</Text>
          <Text style={[styles.accountRate, { color: colors.success }]}>{account.interestRate.toFixed(2)}%</Text>
          <Text style={[styles.accountMonthly, { color: colors.muted }]}>+{formatCurrency((account.balance * account.interestRate) / 100 / 12)}/mo</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Account Modal ────────────────────────────────────────────────────────────
function AccountModal({ visible, account, onClose, onSave }: {
  visible: boolean;
  account: BankAccount | undefined;
  onClose: () => void;
  onSave: (data: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
}) {
  const colors = useAppColors();
  const [bankName, setBankName] = useState(account?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
  const [balance, setBalance] = useState(account?.balance?.toString() || '');
  const [interestRate, setInterestRate] = useState(account?.interestRate?.toString() || '');
  const [accountType, setAccountType] = useState<AccountType>(account?.accountType || 'savings');
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePress = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !balance.trim()) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        bankName,
        accountNumber,
        balance: parseFloat(balance),
        interestRate: parseFloat(interestRate) || 0,
        accountType,
        currency: 'SGD',
        isPrimary: account?.isPrimary || false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{account ? 'Edit Account' : 'Add Account'}</Text>
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Bank Name</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="e.g., DBS, OCBC, UOB"
              placeholderTextColor={colors.muted}
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Account Number</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="e.g., ****1234"
              placeholderTextColor={colors.muted}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Account Type</Text>
            <View style={styles.typeSelector}>
              {(Object.keys(accountTypeConfig) as AccountType[]).map(type => (
                <Pressable
                  key={type}
                  onPress={() => setAccountType(type)}
                  style={[
                    styles.typeOption,
                    accountType === type && { backgroundColor: colors.primary },
                    { borderColor: colors.border }
                  ]}
                >
                  <Text style={[styles.typeOptionText, { color: accountType === type ? '#FFF' : colors.foreground }]}>
                    {accountTypeConfig[type].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Balance (SGD)</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Interest Rate (% p.a.)</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="0.5"
              placeholderTextColor={colors.muted}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="decimal-pad"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable onPress={onClose} style={[styles.btnSecondary, { borderColor: colors.border }]}>
              <Text style={[styles.btnText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSavePress} disabled={isSaving} style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 }]}>
              <Text style={styles.btnTextPrimary}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
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

  // Use default monthly income of 5000 for CBS calculation
  const monthlyIncome = 5000;
  
  // Recalculate CBS score whenever data changes
  const cbsScore = useMemo(() => {
    const result = calculateCBSScore(data, monthlyIncome);
    return result;
  }, [data, monthlyIncome]);
  
  // Recalculate max loan whenever CBS score changes
  const maxLoan = useMemo(() => cbsScore.estimatedMaxLoan, [cbsScore]);

  // Recalculate totals whenever data changes
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

  const handleEdit = useCallback((account: BankAccount) => {
    setEditingAccount(account);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((account: BankAccount) => {
    Alert.alert('Delete Account', `Remove ${account.bankName} account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteBankAccount(account.id);
        } catch (error) {
          console.error('Error deleting account:', error);
          Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
      } },
    ]);
  }, [deleteBankAccount]);

  const handleSave = useCallback(async (accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, accountData);
      } else {
        await addBankAccount(accountData);
      }
      setEditingAccount(undefined);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving account:', error);
      Alert.alert('Error', 'Failed to save account. Please try again.');
    }
  }, [editingAccount, updateBankAccount, addBankAccount]);

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
  content: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12 },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  accountCard: { marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  accountEmoji: { fontSize: 28 },
  accountBank: { fontSize: 16, fontWeight: '600' },
  accountNum: { fontSize: 12, marginTop: 2 },
  accountActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  accountBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  accountBalance: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  accountRight: { alignItems: 'flex-end' },
  accountLabel: { fontSize: 11, marginBottom: 2 },
  accountRate: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  accountMonthly: { fontSize: 11 },
  emptyState: { paddingVertical: 32, alignItems: 'center', borderRadius: 12 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  creditCard: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 },
  creditTop: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  creditRight: { flex: 1 },
  creditTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  creditSub: { fontSize: 12, marginBottom: 8 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  gradeBadgeText: { fontSize: 12, fontWeight: '600' },
  maxLoanLabel: { fontSize: 11, marginBottom: 2 },
  maxLoanValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  maxLoanNote: { fontSize: 11, marginBottom: 8 },
  lastUpdated: { fontSize: 10 },
  factorDivider: { height: 1, marginVertical: 12 },
  factorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  factorRow: { marginBottom: 12 },
  factorLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  factorLabel: { fontSize: 13, fontWeight: '600' },
  factorWeight: { fontSize: 11 },
  factorValue: { fontSize: 12, fontWeight: '700' },
  factorTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  factorFill: { height: '100%', borderRadius: 4 },
  warningsBox: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  warningText: { fontSize: 12, marginBottom: 4 },
  bankLoanCard: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  bankLoanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bankLoanName: { fontSize: 16, fontWeight: '700' },
  bankLoanCount: { fontSize: 12 },
  bankLoanStats: { flexDirection: 'row', gap: 24 },
  bankLoanStatLabel: { fontSize: 11, marginBottom: 2 },
  bankLoanStatValue: { fontSize: 16, fontWeight: '700' },
  gaugeWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gaugeCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeScore: { fontSize: 24, fontWeight: '700' },
  gaugeGrade: { fontSize: 12, fontWeight: '600' },
  gaugeLabel: { fontSize: 10, marginTop: 2 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { paddingHorizontal: 16, paddingVertical: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeOption: { flex: 1, minWidth: '45%', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  typeOptionText: { fontSize: 12, fontWeight: '600' },
  modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  btnSecondary: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  btnPrimary: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '600' },
  btnTextPrimary: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
