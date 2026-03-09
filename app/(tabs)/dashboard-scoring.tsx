// This file contains the scoring logic to be integrated into index.tsx
// It demonstrates how to use the evidence-based scoring functions

import { useMemo } from 'react';
import {
  calculateInsuranceProtectionScore,
  calculateCPFRetirementScore,
  calculatePrivateAssetQualityScore,
  getInsuranceStatusLabel,
  getCPFStatusLabel,
  getPrivateAssetStatusLabel,
} from '@/lib/evidence-based-scoring';

export function useScoringCalculations(data: any, unifiedSummary: any) {
  // Calculate CPF score using evidence-based formula (FRS benchmark)
  const cpfScoreResult = useMemo(() => {
    return calculateCPFRetirementScore({
      oa: data.cpf?.oa || 0,
      sa: data.cpf?.sa || 0,
      ma: data.cpf?.ma || 0,
      ra: data.cpf?.ra || 0,
      cpfLifeBalance: data.cpf?.cpfLifeBalance || 0,
      estimatedMonthlyPayout: data.cpf?.estimatedMonthlyPayout,
      projectedRetirementBalance: data.cpf?.projectedRetirementBalance,
      currentYearFRS: 220400, // 2026 FRS
    });
  }, [data.cpf]);

  const cpfScore = cpfScoreResult.score;
  const cpfStatusLabel = getCPFStatusLabel(cpfScore);

  // Calculate Insurance score using evidence-based formula (LIA benchmarks)
  const insuranceScoreResult = useMemo(() => {
    const monthlyIncome = 5000; // TODO: Get from user profile
    const annualIncome = monthlyIncome * 12;

    const deathOrTPDCover = data.insurancePolicies
      .filter((p: any) => p.status === 'active' && ['life', 'term_life', 'tpd', 'disability'].includes(p.type))
      .reduce((sum: number, p: any) => sum + (p.coverageAmount || 0), 0);

    const criticalIllnessCover = data.insurancePolicies
      .filter((p: any) => p.status === 'active' && p.type === 'critical_illness')
      .reduce((sum: number, p: any) => sum + (p.coverageAmount || 0), 0);

    const annualPremiums = data.insurancePolicies
      .filter((p: any) => p.status === 'active')
      .reduce((sum: number, p: any) => sum + (p.annualPremium || 0), 0);

    const activePolicyTypes = Array.from(
      new Set(data.insurancePolicies.filter((p: any) => p.status === 'active').map((p: any) => p.type))
    );

    const expiredKeyPolicies = data.insurancePolicies.filter((p: any) => p.status === 'expired').length;

    return calculateInsuranceProtectionScore({
      annualIncome,
      deathOrTPDCover,
      criticalIllnessCover,
      annualPremiums,
      activePolicyTypes: activePolicyTypes as string[],
      expiredKeyPolicies,
    });
  }, [data.insurancePolicies]);

  const insuranceScore = insuranceScoreResult.score;
  const insuranceStatusLabel = getInsuranceStatusLabel(insuranceScore);

  // Calculate Private Asset score using evidence-based formula
  const privateAssetScoreResult = useMemo(() => {
    return calculatePrivateAssetQualityScore(data.privateAssets || []);
  }, [data.privateAssets]);

  const privateAssetScore = privateAssetScoreResult.score;
  const privateAssetStatusLabel = getPrivateAssetStatusLabel(privateAssetScore);

  return {
    cpfScore,
    cpfStatusLabel,
    cpfScoreResult,
    insuranceScore,
    insuranceStatusLabel,
    insuranceScoreResult,
    privateAssetScore,
    privateAssetStatusLabel,
    privateAssetScoreResult,
  };
}
