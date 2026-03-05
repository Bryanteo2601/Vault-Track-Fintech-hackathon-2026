import React, { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform, Linking
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { InsurancePolicy, InsuranceType } from '@/lib/types';
import { formatCurrency } from '@/lib/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

// ─── Insurance Type Config ────────────────────────────────────────────────────
const insuranceTypeConfig: Record<InsuranceType, { label: string; icon: string; color: string; description: string }> = {
  life: { label: 'Life Insurance', icon: '❤️', color: '#EF4444', description: 'Death benefit coverage' },
  health: { label: 'Health / MediShield', icon: '🏥', color: '#00C896', description: 'Medical expenses' },
  critical_illness: { label: 'Critical Illness', icon: '🩺', color: '#F59E0B', description: 'Serious illness lump sum' },
  disability: { label: 'Disability Income', icon: '♿', color: '#8B5CF6', description: 'Income replacement' },
  property: { label: 'Property / Fire', icon: '🏠', color: '#1A3C5E', description: 'Home and contents' },
  vehicle: { label: 'Vehicle', icon: '🚗', color: '#06B6D4', description: 'Car insurance' },
  travel: { label: 'Travel', icon: '✈️', color: '#84CC16', description: 'Travel protection' },
  endowment: { label: 'Endowment', icon: '💰', color: '#F97316', description: 'Savings + protection' },
  investment_linked: { label: 'Investment-Linked', icon: '📈', color: '#EC4899', description: 'ILP policy' },
};

// ─── Policy Card ──────────────────────────────────────────────────────────────
function PolicyCard({ policy, onEdit, onDelete, onViewPdf }: {
  policy: InsurancePolicy;
  onEdit: () => void;
  onDelete: () => void;
  onViewPdf: () => void;
}) {
  const colors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const cfg = insuranceTypeConfig[policy.policyType];

  const today = new Date();
  const endDate = new Date(policy.endDate);
  const daysToExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const yearsLeft = Math.floor(daysToExpiry / 365);
  const isExpiringSoon = daysToExpiry < 365 && daysToExpiry > 0;
  const isExpired = daysToExpiry <= 0;

  const monthlyPremium = policy.annualPremium / 12;

  return (
    <View style={[styles.policyCard, { backgroundColor: colors.surface, borderColor: isExpiringSoon ? colors.warning : isExpired ? colors.error : colors.border }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        <View style={styles.policyHeader}>
          <View style={styles.policyHeaderLeft}>
            <Text style={styles.policyIcon}>{cfg.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.policyInsurer, { color: colors.foreground }]}>{policy.insurer}</Text>
              <Text style={[styles.policyType, { color: colors.muted }]}>{cfg.label}</Text>
              <Text style={[styles.policyNum, { color: colors.muted }]}>{policy.policyNumber}</Text>
            </View>
          </View>
          <View style={styles.policyHeaderRight}>
            <Text style={[styles.policyCoverage, { color: colors.foreground }]}>{formatCurrency(policy.coverageAmount, policy.currency)}</Text>
            <Text style={[styles.policyCoverageLabel, { color: colors.muted }]}>Coverage</Text>
            {isExpired ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: colors.error }]}>Expired</Text>
              </View>
            ) : isExpiringSoon ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: colors.warning }]}>Expiring Soon</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: colors.success }]}>Active</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.policyStats}>
          <View style={styles.policyStat}>
            <Text style={[styles.policyStatLabel, { color: colors.muted }]}>Annual Premium</Text>
            <Text style={[styles.policyStatValue, { color: colors.warning }]}>{formatCurrency(policy.annualPremium, policy.currency)}</Text>
          </View>
          <View style={styles.policyStat}>
            <Text style={[styles.policyStatLabel, { color: colors.muted }]}>Monthly</Text>
            <Text style={[styles.policyStatValue, { color: colors.foreground }]}>{formatCurrency(monthlyPremium, policy.currency)}</Text>
          </View>
          <View style={styles.policyStat}>
            <Text style={[styles.policyStatLabel, { color: colors.muted }]}>Expires</Text>
            <Text style={[styles.policyStatValue, { color: isExpired ? colors.error : isExpiringSoon ? colors.warning : colors.foreground }]}>
              {isExpired ? 'Expired' : yearsLeft > 0 ? `${yearsLeft}y left` : `${daysToExpiry}d left`}
            </Text>
          </View>
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.policyExpanded, { borderTopColor: colors.border }]}>
          <View style={styles.expandedGrid}>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Start Date</Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>{policy.startDate}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>End Date</Text>
              <Text style={[styles.expandedValue, { color: colors.foreground }]}>{policy.endDate}</Text>
            </View>
            {policy.beneficiary ? (
              <View style={styles.expandedItem}>
                <Text style={[styles.expandedLabel, { color: colors.muted }]}>Beneficiary</Text>
                <Text style={[styles.expandedValue, { color: colors.foreground }]}>{policy.beneficiary}</Text>
              </View>
            ) : null}
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: colors.muted }]}>Type</Text>
              <Text style={[styles.expandedValue, { color: cfg.color }]}>{cfg.description}</Text>
            </View>
          </View>

          {policy.notes ? (
            <View style={[styles.notesBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.notesLabel, { color: colors.muted }]}>Policy Notes</Text>
              <Text style={[styles.notesText, { color: colors.foreground }]}>{policy.notes}</Text>
            </View>
          ) : null}

          {/* PDF Section */}
          <View style={styles.pdfSection}>
            {policy.pdfUri ? (
              <View style={styles.pdfRow}>
                <View style={[styles.pdfBadge, { backgroundColor: colors.error + '15' }]}>
                  <IconSymbol name="doc.text.fill" size={16} color={colors.error} />
                  <Text style={[styles.pdfName, { color: colors.error }]} numberOfLines={1}>{policy.pdfName || 'Policy Document'}</Text>
                </View>
                <Pressable onPress={onViewPdf} style={[styles.pdfViewBtn, { borderColor: colors.primary }]}>
                  <IconSymbol name="eye.fill" size={14} color={colors.primary} />
                  <Text style={[styles.pdfViewBtnText, { color: colors.primary }]}>View</Text>
                </Pressable>
              </View>
            ) : null}
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

// ─── Add/Edit Policy Modal ────────────────────────────────────────────────────
function PolicyModal({ visible, policy, onClose, onSave }: {
  visible: boolean;
  policy?: InsurancePolicy;
  onClose: () => void;
  onSave: (data: Omit<InsurancePolicy, 'id'>) => void;
}) {
  const colors = useAppColors();
  const [insurer, setInsurer] = useState(policy?.insurer || '');
  const [policyNumber, setPolicyNumber] = useState(policy?.policyNumber || '');
  const [policyType, setPolicyType] = useState<InsuranceType>(policy?.policyType || 'life');
  const [coverageAmount, setCoverageAmount] = useState(policy?.coverageAmount?.toString() || '');
  const [annualPremium, setAnnualPremium] = useState(policy?.annualPremium?.toString() || '');
  const [startDate, setStartDate] = useState(policy?.startDate || '');
  const [endDate, setEndDate] = useState(policy?.endDate || '');
  const [beneficiary, setBeneficiary] = useState(policy?.beneficiary || '');
  const [notes, setNotes] = useState(policy?.notes || '');
  const [pdfUri, setPdfUri] = useState(policy?.pdfUri || '');
  const [pdfName, setPdfName] = useState(policy?.pdfName || '');

  React.useEffect(() => {
    if (visible) {
      setInsurer(policy?.insurer || '');
      setPolicyNumber(policy?.policyNumber || '');
      setPolicyType(policy?.policyType || 'life');
      setCoverageAmount(policy?.coverageAmount?.toString() || '');
      setAnnualPremium(policy?.annualPremium?.toString() || '');
      setStartDate(policy?.startDate || '');
      setEndDate(policy?.endDate || '');
      setBeneficiary(policy?.beneficiary || '');
      setNotes(policy?.notes || '');
      setPdfUri(policy?.pdfUri || '');
      setPdfName(policy?.pdfName || '');
    }
  }, [visible, policy]);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Copy to permanent location for persistence
        const permanentUri = `${FileSystem.documentDirectory}insurance_${Date.now()}_${asset.name}`;
        await FileSystem.copyAsync({ from: asset.uri, to: permanentUri });
        setPdfUri(permanentUri);
        setPdfName(asset.name);
        Alert.alert('PDF Imported', `"${asset.name}" has been attached to this policy.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to import PDF. Please try again.');
    }
  };

  const handleSave = () => {
    if (!insurer.trim()) { Alert.alert('Required', 'Please enter insurer name'); return; }
    onSave({
      insurer: insurer.trim(),
      policyNumber: policyNumber.trim() || 'N/A',
      policyType,
      coverageAmount: parseFloat(coverageAmount) || 0,
      annualPremium: parseFloat(annualPremium) || 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      beneficiary: beneficiary.trim() || undefined,
      notes: notes.trim() || undefined,
      pdfUri: pdfUri || undefined,
      pdfName: pdfName || undefined,
      currency: 'SGD',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{policy ? 'Edit Policy' : 'Add Insurance Policy'}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Insurance Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeRow}>
                {(Object.keys(insuranceTypeConfig) as InsuranceType[]).map(t => (
                  <Pressable key={t} onPress={() => setPolicyType(t)}
                    style={[styles.typeChip, {
                      borderColor: policyType === t ? insuranceTypeConfig[t].color : colors.border,
                      backgroundColor: policyType === t ? insuranceTypeConfig[t].color + '15' : colors.surface,
                    }]}>
                    <Text style={styles.typeChipIcon}>{insuranceTypeConfig[t].icon}</Text>
                    <Text style={[styles.typeChipText, { color: policyType === t ? insuranceTypeConfig[t].color : colors.muted }]}>
                      {insuranceTypeConfig[t].label.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Insurer Name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={insurer} onChangeText={setInsurer} placeholder="e.g. Prudential, AIA" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Policy Number</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={policyNumber} onChangeText={setPolicyNumber} placeholder="e.g. PRU-2021-001234" placeholderTextColor={colors.muted} />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Coverage Amount</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={coverageAmount} onChangeText={setCoverageAmount} keyboardType="numeric" placeholder="500000" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Annual Premium</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={annualPremium} onChangeText={setAnnualPremium} keyboardType="numeric" placeholder="3600" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Start Date</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>End Date</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Beneficiary (Optional)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={beneficiary} onChangeText={setBeneficiary} placeholder="e.g. Spouse, Children" placeholderTextColor={colors.muted} />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Policy Notes (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={notes} onChangeText={setNotes} placeholder="Key terms, exclusions, riders..." placeholderTextColor={colors.muted}
              multiline numberOfLines={3} textAlignVertical="top" />

            {/* PDF Import */}
            <Text style={[styles.inputLabel, { color: colors.muted }]}>Policy Document (PDF)</Text>
            <Pressable onPress={handlePickPdf}
              style={[styles.pdfImportBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}>
              <IconSymbol name="arrow.up.doc.fill" size={20} color={colors.primary} />
              <Text style={[styles.pdfImportText, { color: colors.primary }]}>
                {pdfUri ? `Attached: ${pdfName}` : 'Import PDF Document'}
              </Text>
            </Pressable>
            {pdfUri ? (
              <Pressable onPress={() => { setPdfUri(''); setPdfName(''); }}
                style={[styles.pdfRemoveBtn, { borderColor: colors.error }]}>
                <Text style={[styles.pdfRemoveText, { color: colors.error }]}>Remove PDF</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveBtnText}>Save Policy</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Insurance Screen ────────────────────────────────────────────────────
export default function InsuranceScreen() {
  const colors = useAppColors();
  const { data, addInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | undefined>();

  const totalCoverage = useMemo(() => data.insurancePolicies.reduce((s, p) => s + p.coverageAmount, 0), [data.insurancePolicies]);
  const totalAnnualPremium = useMemo(() => data.insurancePolicies.reduce((s, p) => s + p.annualPremium, 0), [data.insurancePolicies]);
  const totalMonthlyPremium = totalAnnualPremium / 12;

  const coverageByType = useMemo(() => {
    const result: Record<string, number> = {};
    data.insurancePolicies.forEach(p => {
      const label = insuranceTypeConfig[p.policyType].label;
      result[label] = (result[label] || 0) + p.coverageAmount;
    });
    return result;
  }, [data.insurancePolicies]);

  const handleEdit = (policy: InsurancePolicy) => { setEditingPolicy(policy); setModalVisible(true); };
  const handleDelete = (policy: InsurancePolicy) => {
    Alert.alert('Delete Policy', `Remove ${policy.insurer} ${insuranceTypeConfig[policy.policyType].label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteInsurancePolicy(policy.id) },
    ]);
  };
  const handleViewPdf = (policy: InsurancePolicy) => {
    if (policy.pdfUri) {
      Linking.openURL(policy.pdfUri).catch(() => Alert.alert('Error', 'Cannot open PDF. Please check if a PDF viewer is installed.'));
    }
  };
  const handleSave = async (policyData: Omit<InsurancePolicy, 'id'>) => {
    if (editingPolicy) { await updateInsurancePolicy(editingPolicy.id, policyData); }
    else { await addInsurancePolicy(policyData); }
    setEditingPolicy(undefined);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerTitle}>Insurance Policies</Text>
            <Text style={styles.headerSub}>{data.insurancePolicies.length} active polic{data.insurancePolicies.length !== 1 ? 'ies' : 'y'}</Text>
          </View>
          <Pressable onPress={() => { setEditingPolicy(undefined); setModalVisible(true); }}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
            <IconSymbol name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.summaryMainLabel}>Total Coverage</Text>
            <Text style={styles.summaryMainValue}>{formatCurrency(totalCoverage)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Annual Premiums</Text>
                <Text style={[styles.summaryStatValue, { color: '#FBBF24' }]}>{formatCurrency(totalAnnualPremium)}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Monthly Cost</Text>
                <Text style={[styles.summaryStatValue, { color: '#F87171' }]}>{formatCurrency(totalMonthlyPremium)}</Text>
              </View>
            </View>
          </View>

          {/* Coverage by Type */}
          {Object.keys(coverageByType).length > 0 && (
            <View style={[styles.coverageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.coverageTitle, { color: colors.foreground }]}>Coverage by Type</Text>
              {Object.entries(coverageByType).map(([type, amount], i) => {
                const pct = totalCoverage > 0 ? (amount / totalCoverage) * 100 : 0;
                const typeEntry = Object.values(insuranceTypeConfig).find(c => c.label === type);
                const color = typeEntry?.color || colors.primary;
                return (
                  <View key={i} style={styles.coverageRow}>
                    <View style={styles.coverageRowLeft}>
                      <Text style={styles.coverageIcon}>{typeEntry?.icon || '📋'}</Text>
                      <Text style={[styles.coverageLabel, { color: colors.foreground }]}>{type}</Text>
                    </View>
                    <View style={styles.coverageRowRight}>
                      <Text style={[styles.coverageAmount, { color: colors.foreground }]}>{formatCurrency(amount)}</Text>
                      <View style={[styles.coverageTrack, { backgroundColor: colors.border }]}>
                        <View style={[styles.coverageFill, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Policy Cards */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Policy Details</Text>
          {data.insurancePolicies.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No insurance policies yet. Tap + to add one.</Text>
            </View>
          ) : (
            data.insurancePolicies.map(policy => (
              <PolicyCard key={policy.id} policy={policy}
                onEdit={() => handleEdit(policy)}
                onDelete={() => handleDelete(policy)}
                onViewPdf={() => handleViewPdf(policy)} />
            ))
          )}
        </View>
      </ScrollView>

      <PolicyModal
        visible={modalVisible}
        policy={editingPolicy}
        onClose={() => { setModalVisible(false); setEditingPolicy(undefined); }}
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
  coverageCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  coverageTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  coverageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  coverageRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 160 },
  coverageIcon: { fontSize: 16 },
  coverageLabel: { fontSize: 12, fontWeight: '500', flex: 1 },
  coverageRowRight: { flex: 1, gap: 4 },
  coverageAmount: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
  coverageTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  coverageFill: { height: 4, borderRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  policyCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  policyHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14 },
  policyHeaderLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  policyIcon: { fontSize: 28, marginTop: 2 },
  policyInsurer: { fontSize: 15, fontWeight: '700' },
  policyType: { fontSize: 12, marginTop: 1 },
  policyNum: { fontSize: 11, marginTop: 1 },
  policyHeaderRight: { alignItems: 'flex-end', gap: 4 },
  policyCoverage: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  policyCoverageLabel: { fontSize: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },
  policyStats: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  policyStat: { flex: 1, alignItems: 'center' },
  policyStatLabel: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  policyStatValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  policyExpanded: { borderTopWidth: 1, padding: 14 },
  expandedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  expandedItem: { width: '45%' },
  expandedLabel: { fontSize: 11, marginBottom: 2 },
  expandedValue: { fontSize: 13, fontWeight: '600' },
  notesBox: { borderRadius: 10, padding: 12, marginBottom: 12 },
  notesLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 13, lineHeight: 18 },
  pdfSection: { marginBottom: 12 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pdfBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8 },
  pdfName: { fontSize: 12, fontWeight: '600', flex: 1 },
  pdfViewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  pdfViewBtnText: { fontSize: 12, fontWeight: '600' },
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
  textArea: { height: 80, paddingTop: 12 },
  inputRow: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  typeChip: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 70 },
  typeChipIcon: { fontSize: 18, marginBottom: 4 },
  typeChipText: { fontSize: 10, fontWeight: '600' },
  pdfImportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 14, borderStyle: 'dashed' },
  pdfImportText: { fontSize: 14, fontWeight: '600' },
  pdfRemoveBtn: { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 8 },
  pdfRemoveText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
