/**
 * Improved Wealth Wellness Score Calculator
 * 
 * Composite score based on five weighted financial health factors:
 * - Credit Score Normalized (25%)
 * - Liquidity Score (25%)
 * - Diversification Score (20%)
 * - Net Worth Growth Score (15%)
 * - Debt Ratio Score (15%)
 */

export interface WellnessScoreBreakdown {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  creditScoreNorm: number;
  liquidityScore: number;
  diversificationScore: number;
  netWorthGrowthScore: number;
  debtRatioScore: number;
  breakdown: {
    creditScore: { value: number; weight: number; contribution: number };
    liquidity: { value: number; weight: number; contribution: number };
    diversification: { value: number; weight: number; contribution: number };
    netWorthGrowth: { value: number; weight: number; contribution: number };
    debtRatio: { value: number; weight: number; contribution: number };
  };
}

/**
 * Normalize credit score from 300-850 range to 0-100
 * Formula: ((credit_score - 300) / (850 - 300)) * 100
 */
function calculateCreditScoreNormalized(creditScore: number): number {
  if (creditScore <= 300) return 0;
  if (creditScore >= 850) return 100;
  return ((creditScore - 300) / (850 - 300)) * 100;
}

/**
 * Calculate liquidity score based on months of expenses covered
 * liquidity_months = liquid_assets / monthly_expenses
 */
function calculateLiquidityScore(liquidAssets: number, monthlyExpenses: number): number {
  if (monthlyExpenses <= 0) return 100; // No expenses = excellent liquidity
  
  const liquidityMonths = liquidAssets / monthlyExpenses;
  
  if (liquidityMonths <= 1) return 20;
  if (liquidityMonths <= 3) return 50;
  if (liquidityMonths <= 6) return 80;
  return 100;
}

/**
 * Calculate diversification score based on asset allocation
 * Penalizes concentration if one asset class >60%
 */
function calculateDiversificationScore(assetAllocation: Record<string, number>): number {
  const totalAssets = Object.values(assetAllocation).reduce((sum, val) => sum + val, 0);
  
  if (totalAssets <= 0) return 50; // No assets = neutral score
  
  // Calculate percentage of each asset class
  const percentages = Object.values(assetAllocation).map((val) => (val / totalAssets) * 100);
  
  // Find maximum concentration
  const maxConcentration = Math.max(...percentages);
  
  // Apply penalty if one asset class >60%
  let concentrationRisk = 0;
  if (maxConcentration > 60) {
    concentrationRisk = (maxConcentration - 60) * 2; // 2% penalty per 1% over 60%
  }
  
  // Calculate Herfindahl index for additional diversification penalty
  const herfindahl = percentages.reduce((sum, p) => sum + (p / 100) ** 2, 0);
  const diversificationPenalty = (herfindahl - 0.2) * 50; // Normalize to 0-100 scale
  
  const score = 100 - concentrationRisk - Math.max(diversificationPenalty, 0);
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate net worth growth score based on YoY change
 * growth = (current_networth - previous_networth) / previous_networth
 */
function calculateNetWorthGrowthScore(currentNetWorth: number, previousNetWorth: number): number {
  if (previousNetWorth <= 0) return 60; // No previous data = neutral score
  
  const growth = (currentNetWorth - previousNetWorth) / previousNetWorth;
  
  if (growth < 0) return 40; // Negative growth
  if (growth <= 0.05) return 60; // 0-5% growth
  if (growth <= 0.1) return 80; // 5-10% growth
  return 100; // >10% growth
}

/**
 * Calculate debt ratio score
 * debt_ratio = liabilities / assets
 */
function calculateDebtRatioScore(liabilities: number, assets: number): number {
  if (assets <= 0) return 50; // No assets = neutral score
  
  const debtRatio = liabilities / assets;
  
  if (debtRatio > 0.8) return 20;
  if (debtRatio > 0.5) return 50;
  if (debtRatio > 0.3) return 80;
  return 100;
}

/**
 * Get financial grade based on wellness score
 */
function getFinancialGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate comprehensive wellness score
 * Weights:
 * - Credit Score: 25%
 * - Liquidity: 25%
 * - Diversification: 20%
 * - Net Worth Growth: 15%
 * - Debt Ratio: 15%
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
}): WellnessScoreBreakdown {
  // Calculate individual scores
  const creditScoreNorm = calculateCreditScoreNormalized(params.creditScore);
  const liquidityScore = calculateLiquidityScore(params.liquidAssets, params.monthlyExpenses);
  const diversificationScore = calculateDiversificationScore(params.assetAllocation);
  const netWorthGrowthScore = calculateNetWorthGrowthScore(params.currentNetWorth, params.previousNetWorth);
  const debtRatioScore = calculateDebtRatioScore(params.liabilities, params.assets);

  // Define weights
  const weights = {
    creditScore: 0.25,
    liquidity: 0.25,
    diversification: 0.2,
    netWorthGrowth: 0.15,
    debtRatio: 0.15,
  };

  // Calculate weighted contributions
  const creditContribution = creditScoreNorm * weights.creditScore;
  const liquidityContribution = liquidityScore * weights.liquidity;
  const diversificationContribution = diversificationScore * weights.diversification;
  const netWorthGrowthContribution = netWorthGrowthScore * weights.netWorthGrowth;
  const debtRatioContribution = debtRatioScore * weights.debtRatio;

  // Calculate total score
  const totalScore = 
    creditContribution +
    liquidityContribution +
    diversificationContribution +
    netWorthGrowthContribution +
    debtRatioContribution;

  const grade = getFinancialGrade(totalScore);

  return {
    totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal
    grade,
    creditScoreNorm: Math.round(creditScoreNorm * 10) / 10,
    liquidityScore: Math.round(liquidityScore * 10) / 10,
    diversificationScore: Math.round(diversificationScore * 10) / 10,
    netWorthGrowthScore: Math.round(netWorthGrowthScore * 10) / 10,
    debtRatioScore: Math.round(debtRatioScore * 10) / 10,
    breakdown: {
      creditScore: {
        value: Math.round(creditScoreNorm * 10) / 10,
        weight: weights.creditScore,
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
    },
  };
}

/**
 * Get wellness score insights and recommendations
 */
export function getWellnessInsights(breakdown: WellnessScoreBreakdown): string[] {
  const insights: string[] = [];

  // Credit score insights
  if (breakdown.creditScoreNorm < 50) {
    insights.push('Your credit score is significantly impacting your wellness score. Focus on improving payment history and reducing credit utilization.');
  } else if (breakdown.creditScoreNorm < 75) {
    insights.push('Your credit score has room for improvement. Maintain on-time payments and keep credit card balances low.');
  }

  // Liquidity insights
  if (breakdown.liquidityScore < 50) {
    insights.push('You have limited liquid assets. Build an emergency fund covering 3-6 months of expenses.');
  } else if (breakdown.liquidityScore < 80) {
    insights.push('Your emergency fund is adequate. Consider increasing it to cover 6+ months of expenses for better security.');
  }

  // Diversification insights
  if (breakdown.diversificationScore < 60) {
    insights.push('Your portfolio is concentrated in few asset classes. Diversify across stocks, bonds, real estate, and cash for better risk management.');
  } else if (breakdown.diversificationScore < 80) {
    insights.push('Your portfolio has moderate diversification. Consider adding alternative assets like REITs or bonds.');
  }

  // Net worth growth insights
  if (breakdown.netWorthGrowthScore < 60) {
    insights.push('Your net worth is not growing. Review your savings rate and investment returns.');
  } else if (breakdown.netWorthGrowthScore < 80) {
    insights.push('Your net worth is growing moderately. Increase savings or optimize investment returns.');
  }

  // Debt ratio insights
  if (breakdown.debtRatioScore < 50) {
    insights.push('Your debt-to-asset ratio is high. Prioritize debt repayment to improve financial stability.');
  } else if (breakdown.debtRatioScore < 80) {
    insights.push('Your debt level is manageable. Continue paying down debt to strengthen your balance sheet.');
  }

  return insights;
}
