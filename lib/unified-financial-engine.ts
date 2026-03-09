/**
 * Unified Financial Summary Engine
 * 
 * Single source of truth for all financial calculations across the app.
 * Consolidates: banks, investments, CPF, insurance, private assets, loans
 * 
 * Used by: dashboard, wellness score, asset allocation, diversification analysis
 */

import { AppData } from './types';
import { CPFUserData } from './cpf-calculations';

// ─── Private Asset Calculations ────────────────────────────────────────────

export interface PrivateAssetsSummary {
  totalValue: number;
  totalCostBasis: number;
  unrealisedPnL: number;
  returnPct: number;
  assetCount: number;
  assetCountWithValue: number;
  concentrationRisk: number; // % of value in largest asset
  averageConfidence: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low' | 'Unknown';
  staleValuationRisk: number; // % of assets with stale valuations
}

function calculatePrivateAssetsSummary(privateAssets: any[]): PrivateAssetsSummary {
  if (!privateAssets || privateAssets.length === 0) {
    return {
      totalValue: 0,
      totalCostBasis: 0,
      unrealisedPnL: 0,
      returnPct: 0,
      assetCount: 0,
      assetCountWithValue: 0,
      concentrationRisk: 0,
      averageConfidence: 'Unknown',
      staleValuationRisk: 0,
    };
  }

  let totalValue = 0;
  let totalCostBasis = 0;
  let assetCountWithValue = 0;
  const confidenceLevels: string[] = [];
  let staleCount = 0;
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  // Track largest asset for concentration risk
  let largestAssetValue = 0;

  privateAssets.forEach((asset) => {
    // Only count assets with valid estimated values
    if (asset.currentEstimatedValue && asset.currentEstimatedValue > 0) {
      const quantity = asset.quantity || 1;
      const effectiveValue = asset.currentEstimatedValue * quantity;

      totalValue += effectiveValue;
      assetCountWithValue++;

      // Track largest asset
      if (effectiveValue > largestAssetValue) {
        largestAssetValue = effectiveValue;
      }

      // Cost basis
      if (asset.purchasePrice && asset.purchasePrice > 0) {
        totalCostBasis += asset.purchasePrice * quantity;
      }

      // Confidence level
      if (asset.confidenceLevel) {
        confidenceLevels.push(asset.confidenceLevel);
      }

      // Check for stale valuations
      if (asset.historicalValuations && asset.historicalValuations.length > 0) {
        const latestValuation = new Date(asset.historicalValuations[asset.historicalValuations.length - 1].date);
        if (latestValuation < oneYearAgo) {
          staleCount++;
        }
      }
    }
  });

  const unrealisedPnL = totalValue - totalCostBasis;
  const returnPct = totalCostBasis > 0 ? (unrealisedPnL / totalCostBasis) * 100 : 0;
  const concentrationRisk = totalValue > 0 ? (largestAssetValue / totalValue) * 100 : 0;
  const staleValuationRisk = assetCountWithValue > 0 ? (staleCount / assetCountWithValue) * 100 : 0;

  // Calculate average confidence
  let averageConfidence: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low' | 'Unknown' = 'Unknown';
  if (confidenceLevels.length > 0) {
    const confidenceMap = { 'Very High': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Very Low': 1 };
    const avgScore = confidenceLevels.reduce((sum, c) => sum + (confidenceMap[c as keyof typeof confidenceMap] || 0), 0) / confidenceLevels.length;
    if (avgScore >= 4.5) averageConfidence = 'Very High';
    else if (avgScore >= 3.5) averageConfidence = 'High';
    else if (avgScore >= 2.5) averageConfidence = 'Medium';
    else if (avgScore >= 1.5) averageConfidence = 'Low';
    else averageConfidence = 'Very Low';
  }

  return {
    totalValue,
    totalCostBasis,
    unrealisedPnL,
    returnPct: Math.round(returnPct * 100) / 100,
    assetCount: privateAssets.length,
    assetCountWithValue,
    concentrationRisk: Math.round(concentrationRisk * 100) / 100,
    averageConfidence,
    staleValuationRisk: Math.round(staleValuationRisk * 100) / 100,
  };
}

// ─── Assets Breakdown ──────────────────────────────────────────────────────

export interface AssetsBreakdown {
  banks: number;
  investments: number;
  cpf: number;
  insuranceCashValue: number;
  privateAssets: number;
  otherAssets: number;
  totalAssets: number;
}

export interface LiabilitiesBreakdown {
  totalLiabilities: number;
}

export interface NetWorthSummary {
  totalNetWorth: number;
}

// ─── Unified Financial Summary ────────────────────────────────────────────

export interface UnifiedFinancialSummary {
  assetsBreakdown: AssetsBreakdown;
  liabilitiesBreakdown: LiabilitiesBreakdown;
  netWorth: NetWorthSummary;
  privateAssetsSummary: PrivateAssetsSummary;
  assetAllocation: Record<string, number>; // percentages
}

/**
 * Calculate unified financial summary
 * Single source of truth for all financial calculations
 */
export function calculateUnifiedFinancialSummary(
  appData: AppData,
  cpfData: CPFUserData | null = null
): UnifiedFinancialSummary {
  // ─── Banks ────────────────────────────────────────────────────────────
  const banks = appData.bankAccounts.reduce((sum, acc) => {
    return sum + (acc.balance > 0 ? acc.balance : 0);
  }, 0);

  // ─── Investments ──────────────────────────────────────────────────────
  const investments = appData.holdings.reduce((sum, h) => {
    const value = h.quantity * h.currentPrice;
    return sum + (value > 0 ? value : 0);
  }, 0);

  // ─── CPF (all accounts count as assets) ────────────────────────────────
  const cpf = cpfData
    ? cpfData.oa + cpfData.sa + cpfData.ma + cpfData.ra
    : 0;

  // ─── Insurance Cash Value (NOT coverage amount) ──────────────────────
  // Only count if policy has cash value / surrender value
  // For now, we'll use a conservative estimate: 0 unless explicitly provided
  const insuranceCashValue = 0; // TODO: Add cash value field to InsurancePolicy if needed

  // ─── Private Assets ───────────────────────────────────────────────────
  const privateAssets = appData.privateAssets.reduce((sum, asset) => {
    if (asset.currentEstimatedValue && asset.currentEstimatedValue > 0) {
      const quantity = asset.quantity || 1;
      return sum + asset.currentEstimatedValue * quantity;
    }
    return sum;
  }, 0);

  // ─── Other Assets ─────────────────────────────────────────────────────
  const otherAssets = 0; // Placeholder for future asset types

  // ─── Total Assets ─────────────────────────────────────────────────────
  const totalAssets = banks + investments + cpf + insuranceCashValue + privateAssets + otherAssets;

  // ─── Total Liabilities ────────────────────────────────────────────────
  const totalLiabilities = appData.loans.reduce((sum, loan) => {
    return sum + (loan.outstandingBalance > 0 ? loan.outstandingBalance : 0);
  }, 0);

  // ─── Net Worth ─────────────────────────────────────────────────────────
  const totalNetWorth = totalAssets - totalLiabilities;

  // ─── Asset Allocation ─────────────────────────────────────────────────
  const assetAllocation: Record<string, number> = {};
  if (totalAssets > 0) {
    assetAllocation.banks = (banks / totalAssets) * 100;
    assetAllocation.investments = (investments / totalAssets) * 100;
    assetAllocation.cpf = (cpf / totalAssets) * 100;
    assetAllocation.insuranceCashValue = (insuranceCashValue / totalAssets) * 100;
    assetAllocation.privateAssets = (privateAssets / totalAssets) * 100;
    assetAllocation.otherAssets = (otherAssets / totalAssets) * 100;
  } else {
    assetAllocation.banks = 0;
    assetAllocation.investments = 0;
    assetAllocation.cpf = 0;
    assetAllocation.insuranceCashValue = 0;
    assetAllocation.privateAssets = 0;
    assetAllocation.otherAssets = 0;
  }

  // ─── Private Assets Summary ───────────────────────────────────────────
  const privateAssetsSummary = calculatePrivateAssetsSummary(appData.privateAssets);

  return {
    assetsBreakdown: {
      banks,
      investments,
      cpf,
      insuranceCashValue,
      privateAssets,
      otherAssets,
      totalAssets,
    },
    liabilitiesBreakdown: {
      totalLiabilities,
    },
    netWorth: {
      totalNetWorth,
    },
    privateAssetsSummary,
    assetAllocation,
  };
}

/**
 * Calculate Private Asset Quality Component (0-100)
 * 
 * Scoring logic:
 * Base score:
 * - no private assets → 40
 * - private assets but no valuations → 45
 * - private assets with valid values → 60
 * 
 * Adjustments:
 * +10 if positive unrealised gain
 * +10 if more than 1 private asset with value
 * +10 if average confidence is medium/high
 * +10 if valuation history exists
 * 
 * Penalties:
 * -15 if >70% concentration in one asset
 * -10 if valuations stale >12 months
 * -10 if confidence mostly low
 */
export function calculatePrivateAssetQualityComponent(
  privateAssetsSummary: PrivateAssetsSummary
): number {
  // Base score
  let score = 40; // Default: no assets

  if (privateAssetsSummary.assetCount > 0) {
    if (privateAssetsSummary.assetCountWithValue === 0) {
      score = 45; // Assets exist but no valuations
    } else {
      score = 60; // Assets with valid values
    }
  }

  // Adjustments
  if (privateAssetsSummary.unrealisedPnL > 0) {
    score += 10; // Positive unrealised gain
  }

  if (privateAssetsSummary.assetCountWithValue > 1) {
    score += 10; // Multiple assets
  }

  if (
    privateAssetsSummary.averageConfidence === 'High' ||
    privateAssetsSummary.averageConfidence === 'Very High'
  ) {
    score += 10; // Good confidence
  }

  if (privateAssetsSummary.assetCount > 0 && privateAssetsSummary.assetCountWithValue > 0) {
    score += 10; // Valuation history exists (implied by having values)
  }

  // Penalties
  if (privateAssetsSummary.concentrationRisk > 70) {
    score -= 15; // High concentration
  }

  if (privateAssetsSummary.staleValuationRisk > 50) {
    score -= 10; // Stale valuations
  }

  if (
    privateAssetsSummary.averageConfidence === 'Low' ||
    privateAssetsSummary.averageConfidence === 'Very Low'
  ) {
    score -= 10; // Low confidence
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate 8-factor wellness score using unified financial summary
 * 
 * Weights (sum to 1.00):
 * - Credit Score: 18%
 * - Liquidity: 18%
 * - Diversification: 15%
 * - Net Worth Growth: 10%
 * - Debt Ratio: 10%
 * - CPF / Retirement Security: 12%
 * - Insurance Protection: 8%
 * - Private Asset Quality: 9%
 */
export interface WellnessScoreFactors {
  credit: number;
  liquidity: number;
  diversification: number;
  netWorthGrowth: number;
  debtRatio: number;
  cpfRetirement: number;
  insuranceProtection: number;
  privateAssetQuality: number;
}

export interface WellnessScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: WellnessScoreFactors;
  weights: WellnessScoreFactors;
}

/**
 * Helper: Calculate diversification score using HHI
 * HHI = sum(weight_i^2)
 * diversificationScore = (1 - HHI) * 100
 */
function calculateDiversificationScore(assetAllocation: Record<string, number>): number {
  const weights = Object.values(assetAllocation).map((pct) => pct / 100);
  const hhi = weights.reduce((sum, w) => sum + w * w, 0);
  const score = (1 - hhi) * 100;
  return Math.max(0, Math.min(100, score));
}

/**
 * Helper: Calculate debt ratio score
 */
function calculateDebtRatioScore(totalLiabilities: number, totalAssets: number): number {
  if (totalAssets <= 0) return 50;

  const debtRatio = totalLiabilities / totalAssets;

  if (debtRatio > 0.8) return 20;
  if (debtRatio > 0.5) return 50;
  if (debtRatio > 0.3) return 80;
  return 100;
}

/**
 * Helper: Calculate liquidity score
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
 * Helper: Get financial grade
 */
function getFinancialGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate 8-factor wellness score
 * Uses unified financial summary as input
 */
export function calculateWellnessScoreFromUnified(params: {
  creditScore: number;
  liquidAssets: number;
  monthlyExpenses: number;
  summary: UnifiedFinancialSummary;
  previousNetWorth: number;
  cpfScore: number; // 0-100
  insuranceScore: number; // 0-100
}): WellnessScoreResult {
  // Calculate individual components
  const creditScoreNorm = Math.max(0, Math.min(100, (params.creditScore - 1000) / 10)); // CBS 1000-2000 → 0-100
  const liquidityScore = calculateLiquidityScore(params.liquidAssets, params.monthlyExpenses);
  const diversificationScore = calculateDiversificationScore(params.summary.assetAllocation);

  // Net worth growth including private assets
  let netWorthGrowthScore = 60;
  if (params.previousNetWorth > 0) {
    const growth = (params.summary.netWorth.totalNetWorth - params.previousNetWorth) / params.previousNetWorth;
    if (growth < 0) netWorthGrowthScore = 40;
    else if (growth <= 0.05) netWorthGrowthScore = 60;
    else if (growth <= 0.1) netWorthGrowthScore = 80;
    else netWorthGrowthScore = 100;
  }

  const debtRatioScore = calculateDebtRatioScore(
    params.summary.liabilitiesBreakdown.totalLiabilities,
    params.summary.assetsBreakdown.totalAssets
  );

  const privateAssetQualityScore = calculatePrivateAssetQualityComponent(params.summary.privateAssetsSummary);

  // Define weights (sum to 1.00)
  const weights: WellnessScoreFactors = {
    credit: 0.18,
    liquidity: 0.18,
    diversification: 0.15,
    netWorthGrowth: 0.10,
    debtRatio: 0.10,
    cpfRetirement: 0.12,
    insuranceProtection: 0.08,
    privateAssetQuality: 0.09,
  };

  // Calculate weighted contributions
  const totalScore =
    creditScoreNorm * weights.credit +
    liquidityScore * weights.liquidity +
    diversificationScore * weights.diversification +
    netWorthGrowthScore * weights.netWorthGrowth +
    debtRatioScore * weights.debtRatio +
    params.cpfScore * weights.cpfRetirement +
    params.insuranceScore * weights.insuranceProtection +
    privateAssetQualityScore * weights.privateAssetQuality;

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
      cpfRetirement: Math.round(params.cpfScore * 10) / 10,
      insuranceProtection: Math.round(params.insuranceScore * 10) / 10,
      privateAssetQuality: Math.round(privateAssetQualityScore * 10) / 10,
    },
    weights,
  };
}
