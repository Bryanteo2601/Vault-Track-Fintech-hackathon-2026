/**
 * Comprehensive Financial Health Analytics
 * 
 * 7-Factor Wellness Score Model:
 * - Credit Score Component (20%)
 * - Liquidity Component (20%)
 * - Diversification Component (15%)
 * - Net Worth Growth Component (10%)
 * - Debt Ratio Component (10%)
 * - CPF / Retirement Security Component (15%)
 * - Insurance Protection Component (10%)
 */

import { CPFUserData } from './cpf-calculations';
import { InsurancePolicy, BankAccount, Holding, Loan, PrivateAsset } from './types';

export interface CPFHealthScore {
  score: number; // 0-100
  methodology: 'projection' | 'balance' | 'fallback';
  status: 'on_track' | 'needs_improvement' | 'unknown';
  details: {
    totalCPF: number;
    yearsToRetirement: number;
    projectedCPFAtRetirement?: number;
    estimatedMonthlyPayout?: number;
  };
}

export interface InsuranceProtectionScore {
  score: number; // 0-100
  status: 'strong' | 'moderate' | 'limited' | 'none';
  details: {
    activePolicies: number;
    totalCoverageAmount: number;
    totalAnnualPremiums: number;
    policyTypes: string[];
    insuranceCashValue: number;
    hasHealthCoverage: boolean;
    hasLifeCoverage: boolean;
    hasDisabilityOrAccident: boolean;
  };
}

export interface FinancialHealthMetrics {
  diversificationScore: number;
  liquidityMonths: number;
  liquidityScore: number;
  cpfRetirementScore: CPFHealthScore;
  insuranceProtectionScore: InsuranceProtectionScore;
  statuses: {
    diversification: 'excellent' | 'good' | 'fair' | 'poor';
    liquidity: 'excellent' | 'good' | 'fair' | 'poor';
    cpfRetirement: 'on_track' | 'needs_improvement' | 'unknown';
    insuranceProtection: 'strong' | 'moderate' | 'limited' | 'none';
  };
}

export interface WellnessScoreBreakdown {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    credit: number;
    liquidity: number;
    diversification: number;
    netWorthGrowth: number;
    debtRatio: number;
    cpfRetirement: number;
    insuranceProtection: number;
  };
  weights: {
    credit: number;
    liquidity: number;
    diversification: number;
    netWorthGrowth: number;
    debtRatio: number;
    cpfRetirement: number;
    insuranceProtection: number;
  };
  breakdown: {
    credit: { value: number; weight: number; contribution: number };
    liquidity: { value: number; weight: number; contribution: number };
    diversification: { value: number; weight: number; contribution: number };
    netWorthGrowth: { value: number; weight: number; contribution: number };
    debtRatio: { value: number; weight: number; contribution: number };
    cpfRetirement: { value: number; weight: number; contribution: number };
    insuranceProtection: { value: number; weight: number; contribution: number };
  };
}

export interface AssetBreakdown {
  banks: number;
  investments: number;
  cpf: number;
  insuranceCashValue: number;
  privateAssets: number;
  totalAssets: number;
  allocation: {
    banks: number;
    investments: number;
    cpf: number;
    insuranceCashValue: number;
    privateAssets: number;
  };
}

/**
 * Calculate CPF Health Score
 * Treats CPF as long-term retirement asset
 */
export function calculateCPFHealthScore(
  cpfData: CPFUserData | null,
  age: number
): CPFHealthScore {
  if (!cpfData) {
    return {
      score: 50,
      methodology: 'fallback',
      status: 'unknown',
      details: {
        totalCPF: 0,
        yearsToRetirement: Math.max(0, 65 - age),
      },
    };
  }

  const totalCPF = cpfData.oa + cpfData.sa + cpfData.ma + cpfData.ra;
  const yearsToRetirement = Math.max(0, 65 - cpfData.age);

  // Balance-based fallback scoring
  let score = 50;
  if (totalCPF <= 5000) score = 25;
  else if (totalCPF <= 20000) score = 45;
  else if (totalCPF <= 50000) score = 65;
  else if (totalCPF <= 100000) score = 80;
  else score = 95;

  // Adjust based on age and years to retirement
  if (yearsToRetirement < 5 && totalCPF < 100000) {
    score = Math.max(20, score - 15); // Penalty if close to retirement with low CPF
  }

  const status = score >= 70 ? 'on_track' : score >= 50 ? 'needs_improvement' : 'needs_improvement';

  return {
    score: Math.round(score * 10) / 10,
    methodology: 'balance',
    status,
    details: {
      totalCPF,
      yearsToRetirement,
    },
  };
}

/**
 * Calculate Insurance Protection Score
 * Focuses on coverage quality and protection
 */
export function calculateInsuranceProtectionScore(
  policies: InsurancePolicy[]
): InsuranceProtectionScore {
  if (!policies || policies.length === 0) {
    return {
      score: 20,
      status: 'none',
      details: {
        activePolicies: 0,
        totalCoverageAmount: 0,
        totalAnnualPremiums: 0,
        policyTypes: [],
        insuranceCashValue: 0,
        hasHealthCoverage: false,
        hasLifeCoverage: false,
        hasDisabilityOrAccident: false,
      },
    };
  }

  const today = new Date();
  const activePolicies = policies.filter(p => new Date(p.endDate) > today);
  
  if (activePolicies.length === 0) {
    return {
      score: 20,
      status: 'none',
      details: {
        activePolicies: 0,
        totalCoverageAmount: 0,
        totalAnnualPremiums: 0,
        policyTypes: [],
        insuranceCashValue: 0,
        hasHealthCoverage: false,
        hasLifeCoverage: false,
        hasDisabilityOrAccident: false,
      },
    };
  }

  const totalCoverageAmount = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
  const totalAnnualPremiums = activePolicies.reduce((sum, p) => sum + p.annualPremium, 0);
  const policyTypes = [...new Set(activePolicies.map(p => p.policyType))];

  // Check for key coverage types
  const hasHealthCoverage = policyTypes.includes('health') || policyTypes.includes('critical_illness');
  const hasLifeCoverage = policyTypes.includes('life') || policyTypes.includes('endowment');
  const hasDisabilityOrAccident = policyTypes.includes('disability');

  // Base score on number of active policies
  let score = 20;
  if (activePolicies.length === 1) score = 45;
  else if (activePolicies.length === 2) score = 60;
  else if (activePolicies.length === 3) score = 75;
  else score = 90;

  // Bonus for diverse coverage types
  if (hasHealthCoverage && hasLifeCoverage) score = Math.min(100, score + 10);
  if (hasDisabilityOrAccident) score = Math.min(100, score + 5); // Bonus for disability coverage

  // Penalty for investment-linked only
  const onlyInvestmentLinked = policyTypes.length === 1 && policyTypes[0] === 'investment_linked';
  if (onlyInvestmentLinked) score = Math.max(30, score - 20);

  const status = score >= 75 ? 'strong' : score >= 50 ? 'moderate' : 'limited';

  return {
    score: Math.round(score * 10) / 10,
    status,
    details: {
      activePolicies: activePolicies.length,
      totalCoverageAmount,
      totalAnnualPremiums,
      policyTypes,
      insuranceCashValue: 0, // TODO: Calculate from policy cash values if available
      hasHealthCoverage,
      hasLifeCoverage,
      hasDisabilityOrAccident,
    },
  };
}

/**
 * Calculate diversification score including CPF and insurance
 */
function calculateDiversificationScore(
  assetAllocation: Record<string, number>
): number {
  const totalAssets = Object.values(assetAllocation).reduce((sum, val) => sum + val, 0);

  if (totalAssets <= 0) return 50;

  const percentages = Object.values(assetAllocation).map((val) => (val / totalAssets) * 100);
  const maxConcentration = Math.max(...percentages);

  let concentrationRisk = 0;
  if (maxConcentration > 60) {
    concentrationRisk = (maxConcentration - 60) * 2;
  }

  const herfindahl = percentages.reduce((sum, p) => sum + (p / 100) ** 2, 0);
  const diversificationPenalty = (herfindahl - 0.2) * 50;

  const score = 100 - concentrationRisk - Math.max(diversificationPenalty, 0);
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate liquidity score (liquid assets only, excluding CPF)
 */
function calculateLiquidityScore(liquidAssets: number, monthlyExpenses: number): number {
  if (monthlyExpenses <= 0) return 100;

  const liquidityMonths = liquidAssets / monthlyExpenses;

  if (liquidityMonths <= 1) return 20;
  if (liquidityMonths <= 3) return 50;
  if (liquidityMonths <= 6) return 80;
  return 100;
}

/**
 * Normalize credit score from 1000-2000 CBS scale to 0-100
 */
function calculateCreditScoreNormalized(creditScore: number): number {
  if (creditScore <= 1000) return 0;
  if (creditScore >= 2000) return 100;
  return ((creditScore - 1000) / (2000 - 1000)) * 100;
}

/**
 * Calculate net worth growth score
 */
function calculateNetWorthGrowthScore(currentNetWorth: number, previousNetWorth: number): number {
  if (previousNetWorth <= 0) return 60;

  const growth = (currentNetWorth - previousNetWorth) / previousNetWorth;

  if (growth < 0) return 40;
  if (growth <= 0.05) return 60;
  if (growth <= 0.1) return 80;
  return 100;
}

/**
 * Calculate debt ratio score
 */
function calculateDebtRatioScore(liabilities: number, assets: number): number {
  if (assets <= 0) return 50;

  const debtRatio = liabilities / assets;

  if (debtRatio > 0.8) return 20;
  if (debtRatio > 0.5) return 50;
  if (debtRatio > 0.3) return 80;
  return 100;
}

/**
 * Get financial grade
 */
function getFinancialGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate comprehensive financial health metrics
 */
export function calculateFinancialHealthMetrics(params: {
  liquidAssets: number;
  monthlyExpenses: number;
  assetAllocation: Record<string, number>;
  cpfData: CPFUserData | null;
  age: number;
  insurancePolicies: InsurancePolicy[];
}): FinancialHealthMetrics {
  const diversificationScore = calculateDiversificationScore(params.assetAllocation);
  const liquidityScore = calculateLiquidityScore(params.liquidAssets, params.monthlyExpenses);
  const liquidityMonths = params.monthlyExpenses > 0 ? params.liquidAssets / params.monthlyExpenses : 0;
  const cpfRetirementScore = calculateCPFHealthScore(params.cpfData, params.age);
  const insuranceProtectionScore = calculateInsuranceProtectionScore(params.insurancePolicies);

  // Determine statuses
  const diversificationStatus =
    diversificationScore >= 80 ? 'excellent' : diversificationScore >= 60 ? 'good' : diversificationScore >= 40 ? 'fair' : 'poor';
  const liquidityStatus =
    liquidityScore >= 80 ? 'excellent' : liquidityScore >= 60 ? 'good' : liquidityScore >= 40 ? 'fair' : 'poor';

  return {
    diversificationScore: Math.round(diversificationScore * 10) / 10,
    liquidityMonths: Math.round(liquidityMonths * 10) / 10,
    liquidityScore: Math.round(liquidityScore * 10) / 10,
    cpfRetirementScore,
    insuranceProtectionScore,
    statuses: {
      diversification: diversificationStatus,
      liquidity: liquidityStatus,
      cpfRetirement: cpfRetirementScore.status,
      insuranceProtection: insuranceProtectionScore.status,
    },
  };
}

/**
 * Calculate 7-factor wellness score
 * Weights:
 * - Credit Score: 20%
 * - Liquidity: 20%
 * - Diversification: 15%
 * - Net Worth Growth: 10%
 * - Debt Ratio: 10%
 * - CPF / Retirement Security: 15%
 * - Insurance Protection: 10%
 * Total: 100%
 */
export function calculateWellnessScore(params: {
  creditScore: number;
  liquidAssets: number;
  monthlyExpenses: number;
  assetAllocation: Record<string, number>;
  currentNetWorth: number;
  previousNetWorth: number;
  liabilities: number;
  assets: number;
  cpfData: CPFUserData | null;
  age: number;
  insurancePolicies: InsurancePolicy[];
}): WellnessScoreBreakdown {
  // Calculate individual scores
  const creditScoreNorm = calculateCreditScoreNormalized(params.creditScore);
  const liquidityScore = calculateLiquidityScore(params.liquidAssets, params.monthlyExpenses);
  const diversificationScore = calculateDiversificationScore(params.assetAllocation);
  const netWorthGrowthScore = calculateNetWorthGrowthScore(params.currentNetWorth, params.previousNetWorth);
  const debtRatioScore = calculateDebtRatioScore(params.liabilities, params.assets);
  const cpfRetirementScore = calculateCPFHealthScore(params.cpfData, params.age);
  const insuranceProtectionScore = calculateInsuranceProtectionScore(params.insurancePolicies);

  // Define weights (sum to 1.00)
  const weights = {
    credit: 0.20,
    liquidity: 0.20,
    diversification: 0.15,
    netWorthGrowth: 0.10,
    debtRatio: 0.10,
    cpfRetirement: 0.15,
    insuranceProtection: 0.10,
  };

  // Calculate weighted contributions
  const creditContribution = creditScoreNorm * weights.credit;
  const liquidityContribution = liquidityScore * weights.liquidity;
  const diversificationContribution = diversificationScore * weights.diversification;
  const netWorthGrowthContribution = netWorthGrowthScore * weights.netWorthGrowth;
  const debtRatioContribution = debtRatioScore * weights.debtRatio;
  const cpfRetirementContribution = cpfRetirementScore.score * weights.cpfRetirement;
  const insuranceProtectionContribution = insuranceProtectionScore.score * weights.insuranceProtection;

  // Calculate total score
  const totalScore =
    creditContribution +
    liquidityContribution +
    diversificationContribution +
    netWorthGrowthContribution +
    debtRatioContribution +
    cpfRetirementContribution +
    insuranceProtectionContribution;

  const grade = getFinancialGrade(totalScore);

  return {
    score: Math.round(totalScore * 10) / 10,
    grade,
    factors: {
      credit: Math.round(creditScoreNorm * 10) / 10,
      liquidity: Math.round(liquidityScore * 10) / 10,
      diversification: Math.round(diversificationScore * 10) / 10,
      netWorthGrowth: Math.round(netWorthGrowthScore * 10) / 10,
      debtRatio: Math.round(debtRatioScore * 10) / 10,
      cpfRetirement: Math.round(cpfRetirementScore.score * 10) / 10,
      insuranceProtection: Math.round(insuranceProtectionScore.score * 10) / 10,
    },
    weights,
    breakdown: {
      credit: {
        value: Math.round(creditScoreNorm * 10) / 10,
        weight: weights.credit,
        contribution: Math.round(creditContribution * 10) / 10,
      },
      liquidity: {
        value: Math.round(liquidityScore * 10) / 10,
        weight: weights.liquidity,
        contribution: Math.round(liquidityContribution * 10) / 10,
      },
      diversification: {
        value: Math.round(diversificationScore * 10) / 10,
        weight: weights.diversification,
        contribution: Math.round(diversificationContribution * 10) / 10,
      },
      netWorthGrowth: {
        value: Math.round(netWorthGrowthScore * 10) / 10,
        weight: weights.netWorthGrowth,
        contribution: Math.round(netWorthGrowthContribution * 10) / 10,
      },
      debtRatio: {
        value: Math.round(debtRatioScore * 10) / 10,
        weight: weights.debtRatio,
        contribution: Math.round(debtRatioContribution * 10) / 10,
      },
      cpfRetirement: {
        value: Math.round(cpfRetirementScore.score * 10) / 10,
        weight: weights.cpfRetirement,
        contribution: Math.round(cpfRetirementContribution * 10) / 10,
      },
      insuranceProtection: {
        value: Math.round(insuranceProtectionScore.score * 10) / 10,
        weight: weights.insuranceProtection,
        contribution: Math.round(insuranceProtectionContribution * 10) / 10,
      },
    },
  };
}

/**
 * Calculate asset breakdown including CPF and insurance
 */
export function calculateAssetBreakdown(params: {
  bankAccounts: BankAccount[];
  holdings: Holding[];
  cpfData: CPFUserData | null;
  insurancePolicies: InsurancePolicy[];
  privateAssets: PrivateAsset[];
}): AssetBreakdown {
  const banks = params.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const investments = params.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const cpf = params.cpfData ? params.cpfData.oa + params.cpfData.sa + params.cpfData.ma + params.cpfData.ra : 0;
  const insuranceCashValue = 0; // TODO: Calculate from policy cash values if available
  const privateAssets = params.privateAssets.reduce((sum, asset) => sum + asset.currentEstimatedValue, 0);

  const totalAssets = banks + investments + cpf + insuranceCashValue + privateAssets;

  return {
    banks,
    investments,
    cpf,
    insuranceCashValue,
    privateAssets,
    totalAssets,
    allocation: {
      banks: totalAssets > 0 ? (banks / totalAssets) * 100 : 0,
      investments: totalAssets > 0 ? (investments / totalAssets) * 100 : 0,
      cpf: totalAssets > 0 ? (cpf / totalAssets) * 100 : 0,
      insuranceCashValue: totalAssets > 0 ? (insuranceCashValue / totalAssets) * 100 : 0,
      privateAssets: totalAssets > 0 ? (privateAssets / totalAssets) * 100 : 0,
    },
  };
}
