/**
 * Age-Based Investment Strategy Module
 * 
 * Provides age-appropriate investment allocation targets and rebalancing guidance
 * based on financial life stage.
 */

import { getFinancialLifeStage, FinancialLifeStageInfo } from './age-based-financial-engine';

export interface AllocationTarget {
  equities: number;
  bonds: number;
  cash: number;
}

export interface InvestmentStrategy {
  lifeStage: string;
  age: number;
  targetAllocation: AllocationTarget;
  rationale: string;
  riskProfile: string;
  rebalancingGuidance: string;
  keyInvestmentTypes: string[];
}

/**
 * Get recommended investment allocation for a given age
 * @param birthDate - User's birth date
 * @returns Investment strategy with target allocation
 */
export function getAgeBasedInvestmentStrategy(birthDate: string | Date | null | undefined): InvestmentStrategy {
  const lifeStageInfo = getFinancialLifeStage(birthDate);
  const age = calculateAgeFromBirthDate(birthDate);

  // Calculate midpoint allocation within the range
  const equitiesMid = (lifeStageInfo.allocationTargets.equities.min + lifeStageInfo.allocationTargets.equities.max) / 2;
  const bondsMid = (lifeStageInfo.allocationTargets.bonds.min + lifeStageInfo.allocationTargets.bonds.max) / 2;
  const cashMid = (lifeStageInfo.allocationTargets.cash.min + lifeStageInfo.allocationTargets.cash.max) / 2;

  const targetAllocation: AllocationTarget = {
    equities: Math.round(equitiesMid),
    bonds: Math.round(bondsMid),
    cash: Math.round(cashMid),
  };

  return {
    lifeStage: lifeStageInfo.displayName,
    age,
    targetAllocation,
    rationale: getStrategyRationale(lifeStageInfo),
    riskProfile: lifeStageInfo.riskProfile,
    rebalancingGuidance: getRebalancingGuidance(lifeStageInfo),
    keyInvestmentTypes: getKeyInvestmentTypes(lifeStageInfo),
  };
}

/**
 * Get investment strategy rationale based on life stage
 */
function getStrategyRationale(lifeStageInfo: FinancialLifeStageInfo): string {
  const rationales: Record<string, string> = {
    early_adulthood:
      'You have a long investment horizon ahead. Focus on growth assets to build wealth through compound returns. Higher risk tolerance allows you to weather market volatility.',
    early_career:
      'Balance growth with stability as you build your career and wealth. Diversify across equities and bonds to manage risk while maintaining growth potential.',
    family_building:
      'Protect your family\'s financial security while continuing to grow wealth. A balanced portfolio provides stability for dependents while maintaining long-term growth.',
    pre_retirement:
      'Begin shifting towards capital preservation while maintaining some growth. Gradually reduce risk exposure as you approach retirement to protect accumulated wealth.',
    retirement:
      'Prioritize capital preservation and income generation. Conservative allocation protects your retirement savings and provides stable income for living expenses.',
  };

  return rationales[lifeStageInfo.stage] || 'Adjust your portfolio based on your life stage and goals.';
}

/**
 * Get rebalancing guidance based on life stage
 */
function getRebalancingGuidance(lifeStageInfo: FinancialLifeStageInfo): string {
  const guidances: Record<string, string> = {
    early_adulthood: 'Review and rebalance your portfolio annually or when allocations drift by more than 5%.',
    early_career: 'Rebalance annually or semi-annually to maintain your target allocation. Use new contributions to rebalance.',
    family_building: 'Rebalance semi-annually to maintain your target allocation. Consider tax-efficient rebalancing strategies.',
    pre_retirement: 'Rebalance quarterly to maintain your target allocation. Be mindful of tax implications when rebalancing.',
    retirement: 'Rebalance quarterly or as needed to maintain your target allocation. Minimize tax impact through strategic withdrawals.',
  };

  return guidances[lifeStageInfo.stage] || 'Rebalance regularly to maintain your target allocation.';
}

/**
 * Get key investment types recommended for life stage
 */
function getKeyInvestmentTypes(lifeStageInfo: FinancialLifeStageInfo): string[] {
  const investmentTypes: Record<string, string[]> = {
    early_adulthood: [
      'Equity Index Funds / ETFs',
      'Growth-focused Mutual Funds',
      'Individual Stocks (small allocation)',
      'CPF Investment Scheme',
    ],
    early_career: [
      'Diversified ETFs',
      'Equity Mutual Funds',
      'Bond Funds',
      'CPF Investment Scheme',
      'REITs (Real Estate Investment Trusts)',
    ],
    family_building: [
      'Balanced Mutual Funds',
      'Equity ETFs',
      'Bond Funds',
      'CPF Investment Scheme',
      'Property / REITs',
    ],
    pre_retirement: [
      'Bond Funds',
      'Balanced Funds',
      'Dividend-paying Stocks',
      'CPF Retirement Investment Scheme',
      'Fixed Income Securities',
    ],
    retirement: [
      'Bond Funds',
      'Dividend-paying Stocks',
      'Fixed Deposits',
      'CPF LIFE',
      'Income-generating Funds',
    ],
  };

  return investmentTypes[lifeStageInfo.stage] || [];
}

/**
 * Calculate age from birthdate (helper function)
 */
function calculateAgeFromBirthDate(birthDate: string | Date | null | undefined): number {
  if (!birthDate) return 0;

  let date: Date;
  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else {
    date = birthDate;
  }

  if (isNaN(date.getTime())) return 0;

  const today = new Date();
  const ageDiff = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return ageDiff - 1;
  }

  return ageDiff;
}

/**
 * Check if portfolio needs rebalancing
 * @param currentAllocation - Current portfolio allocation
 * @param targetAllocation - Target allocation
 * @param threshold - Rebalancing threshold (default 5%)
 * @returns true if rebalancing is needed
 */
export function needsRebalancing(
  currentAllocation: AllocationTarget,
  targetAllocation: AllocationTarget,
  threshold: number = 5
): boolean {
  return (
    Math.abs(currentAllocation.equities - targetAllocation.equities) > threshold ||
    Math.abs(currentAllocation.bonds - targetAllocation.bonds) > threshold ||
    Math.abs(currentAllocation.cash - targetAllocation.cash) > threshold
  );
}

/**
 * Get rebalancing suggestions
 */
export function getRebalancingSuggestions(
  currentAllocation: AllocationTarget,
  targetAllocation: AllocationTarget
): string[] {
  const suggestions: string[] = [];

  const equitiesDiff = targetAllocation.equities - currentAllocation.equities;
  if (equitiesDiff > 5) {
    suggestions.push(`Increase equities by ${Math.round(equitiesDiff)}% to reach target allocation.`);
  } else if (equitiesDiff < -5) {
    suggestions.push(`Reduce equities by ${Math.round(Math.abs(equitiesDiff))}% to reach target allocation.`);
  }

  const bondsDiff = targetAllocation.bonds - currentAllocation.bonds;
  if (bondsDiff > 5) {
    suggestions.push(`Increase bonds by ${Math.round(bondsDiff)}% to reach target allocation.`);
  } else if (bondsDiff < -5) {
    suggestions.push(`Reduce bonds by ${Math.round(Math.abs(bondsDiff))}% to reach target allocation.`);
  }

  const cashDiff = targetAllocation.cash - currentAllocation.cash;
  if (cashDiff > 5) {
    suggestions.push(`Increase cash reserves by ${Math.round(cashDiff)}% to reach target allocation.`);
  } else if (cashDiff < -5) {
    suggestions.push(`Reduce cash reserves by ${Math.round(Math.abs(cashDiff))}% to reach target allocation.`);
  }

  return suggestions;
}
