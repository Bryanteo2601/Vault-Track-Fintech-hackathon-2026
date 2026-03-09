import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { CPFOverviewCard } from '@/components/cpf/cpf-overview-card';
import { CPFEditableInput } from '@/components/cpf/cpf-editable-input';
import { CPFAccountDescription } from '@/components/cpf/cpf-account-description';
import { CPFMilestonesTimeline } from '@/components/cpf/cpf-milestones-timeline';
import { CPFRetirementSums } from '@/components/cpf/cpf-retirement-sums';
import { CPFPayoutEstimator } from '@/components/cpf/cpf-payout-estimator';
import { CPFInsights } from '@/components/cpf/cpf-insights';
import { CPFInfoCards } from '@/components/cpf/cpf-info-cards';
import {
  generateRetirementProjection,
  generateCPFInsights,
  calculateTotalCPF,
  CPFUserData,
} from '@/lib/cpf-calculations';
import { shouldHaveSA, shouldHaveRA, CPF_ACCOUNT_DESCRIPTIONS } from '@/lib/cpf-constants';


export default function CPFScreen() {
  const colors = useAppColors();
  const { data } = useAppData();

  // Editable CPF data - starts with app context data or defaults
  const [cpfData, setCPFData] = useState<CPFUserData>({
    age: data.cpf?.age ?? 35,
    oa: data.cpf?.oa ?? 0,
    sa: data.cpf?.sa ?? 0,
    ma: data.cpf?.ma ?? 0,
    ra: data.cpf?.ra ?? 0,
    annualSalary: data.cpf?.annualSalary ?? 60000,
  });

  // Editing state for each field
  const [editingField, setEditingField] = useState<string | null>(null);

  // Calculate derived values
  const totalCPF = useMemo(() => calculateTotalCPF(cpfData), [cpfData]);
  const projection = useMemo(() => generateRetirementProjection(cpfData), [cpfData]);
  const insights = useMemo(() => generateCPFInsights(cpfData, projection), [cpfData, projection]);

  const handleFieldChange = (field: keyof CPFUserData, value: number) => {
    setCPFData((prev) => ({ ...prev, [field]: value }));
    // TODO: Persist to app context when backend is ready
  };

  const toggleEdit = (field: string) => {
    setEditingField(editingField === field ? null : field);
  };

  // Determine which accounts to show based on age
  const hasSA = shouldHaveSA(cpfData.age);
  const hasRA = shouldHaveRA(cpfData.age);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
          CPF Dashboard
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Singapore Central Provident Fund
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Card */}
        <CPFOverviewCard
          totalBalance={totalCPF}
          age={cpfData.age}
          raBalance={cpfData.ra}
          monthlyPayoutAt65={projection.monthlyPayoutAt65}
        />

        {/* Smart Insights */}
        {insights.length > 0 && <CPFInsights insights={insights} />}

        {/* Editable Inputs Section */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your CPF Accounts</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Tap ✏️ to edit your balances
          </Text>
        </View>

        {/* Age Input */}
        <CPFEditableInput
          label="Current Age"
          icon="🎂"
          value={cpfData.age}
          onValueChange={(val) => handleFieldChange('age', val)}
          color={colors.primary}
          isEditing={editingField === 'age'}
          onEditToggle={() => toggleEdit('age')}
          unit="years"
        />

        {/* OA Input */}
        <CPFEditableInput
          label="Ordinary Account (OA)"
          icon="💼"
          value={cpfData.oa}
          onValueChange={(val) => handleFieldChange('oa', val)}
          color={CPF_ACCOUNT_DESCRIPTIONS.OA.color}
          description="Housing, investments, education"
          isEditing={editingField === 'oa'}
          onEditToggle={() => toggleEdit('oa')}
        />

        {/* SA Input (only if age < 55) */}
        {hasSA && (
          <CPFEditableInput
            label="Special Account (SA)"
            icon="🏦"
            value={cpfData.sa}
            onValueChange={(val) => handleFieldChange('sa', val)}
            color={CPF_ACCOUNT_DESCRIPTIONS.SA.color}
            description="Retirement savings"
            isEditing={editingField === 'sa'}
            onEditToggle={() => toggleEdit('sa')}
          />
        )}

        {/* MA Input */}
        <CPFEditableInput
          label="MediSave Account (MA)"
          icon="🏥"
          value={cpfData.ma}
          onValueChange={(val) => handleFieldChange('ma', val)}
          color={CPF_ACCOUNT_DESCRIPTIONS.MA.color}
          description="Healthcare expenses"
          isEditing={editingField === 'ma'}
          onEditToggle={() => toggleEdit('ma')}
        />

        {/* RA Input (only if age >= 55) */}
        {hasRA && (
          <CPFEditableInput
            label="Retirement Account (RA)"
            icon="🎯"
            value={cpfData.ra}
            onValueChange={(val) => handleFieldChange('ra', val)}
            color={CPF_ACCOUNT_DESCRIPTIONS.RA.color}
            description="CPF LIFE payouts"
            isEditing={editingField === 'ra'}
            onEditToggle={() => toggleEdit('ra')}
          />
        )}

        {/* Age Transition Notice */}
        {cpfData.age === 54 && hasSA && (
          <View style={[styles.noticeBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
            <Text style={[styles.noticeText, { color: colors.warning }]}>
              ⚠️ At age 55, your SA will close and be transferred to RA (up to FRS). Excess remains in OA.
            </Text>
          </View>
        )}

        {/* Account Descriptions */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Details</Text>
        </View>

        <CPFAccountDescription accountType="OA" />
        {hasSA && <CPFAccountDescription accountType="SA" />}
        <CPFAccountDescription accountType="MA" />
        {hasRA && <CPFAccountDescription accountType="RA" />}

        {/* Retirement Sums */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Retirement Targets</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Progress towards your retirement goals
          </Text>
        </View>

        <CPFRetirementSums currentRA={cpfData.ra} />

        {/* CPF LIFE Payout Estimator */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>CPF LIFE Payouts</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Estimate your monthly retirement income
          </Text>
        </View>

        <CPFPayoutEstimator data={cpfData} />

        {/* Milestones Timeline */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your CPF Journey</Text>
        </View>

        <CPFMilestonesTimeline currentAge={cpfData.age} />

        {/* Interest Rates & Healthcare */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rates & Limits</Text>
        </View>

        <CPFInfoCards oaBalance={cpfData.oa} smraBalance={cpfData.sa + cpfData.ma + cpfData.ra} />

        {/* Footer Note */}
        <View style={[styles.footerNote, { backgroundColor: colors.border + '20' }]}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            💡 All projections and calculations are estimates based on current CPF rates and your input data. Actual payouts may vary. Consult CPF Board for official information.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionDivider: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  noticeBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footerNote: {
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
