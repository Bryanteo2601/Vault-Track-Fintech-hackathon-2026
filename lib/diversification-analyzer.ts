/**
 * Diversification Analysis Engine using Herfindahl-Hirschman Index (HHI)
 * HHI measures portfolio concentration and diversification
 */

export type DiversificationLevel = 'well-diversified' | 'moderate' | 'concentrated';

export interface DiversificationMetrics {
  hhi: number;
  diversificationScore: number;
  level: DiversificationLevel;
  topHoldings: Array<{
    assetClass: string;
    weight: number;
    percentage: string;
  }>;
  recommendations: string[];
}

export interface PortfolioAdjustment {
  assetClass: string;
  currentWeight: number;
  recommendedWeight: number;
  action: 'increase' | 'decrease';
  amount: number;
  reason: string;
}

/**
 * Calculate Herfindahl-Hirschman Index (HHI)
 * HHI = sum(weight_i^2)
 * Range: 0 to 1
 */
export function calculateHHI(assets: Record<string, number>, totalValue: number): number {
  if (totalValue === 0) return 0;

  let hhi = 0;

  Object.values(assets).forEach((value) => {
    const weight = value / totalValue;
    hhi += weight * weight;
  });

  return hhi;
}

/**
 * Calculate diversification score
 * diversification_score = (1 - HHI) * 100
 */
export function calculateDiversificationScore(hhi: number): number {
  return Math.max(0, Math.min(100, (1 - hhi) * 100));
}

/**
 * Classify diversification level based on HHI
 */
export function classifyDiversificationLevel(hhi: number): DiversificationLevel {
  if (hhi < 0.15) {
    return 'well-diversified';
  } else if (hhi < 0.25) {
    return 'moderate';
  } else {
    return 'concentrated';
  }
}

/**
 * Get diversification level description
 */
export function getDiversificationLevelDescription(level: DiversificationLevel): {
  label: string;
  description: string;
  riskLevel: string;
} {
  switch (level) {
    case 'well-diversified':
      return {
        label: 'Well Diversified',
        description: 'Your portfolio is well-balanced across multiple asset classes with low concentration risk.',
        riskLevel: 'Low',
      };
    case 'moderate':
      return {
        label: 'Moderately Diversified',
        description: 'Your portfolio has moderate diversification. Consider adding more asset classes to reduce risk.',
        riskLevel: 'Medium',
      };
    case 'concentrated':
      return {
        label: 'Concentrated Portfolio',
        description: 'Your portfolio is heavily concentrated in a few assets. This increases risk. Consider rebalancing.',
        riskLevel: 'High',
      };
  }
}

/**
 * Generate portfolio adjustment recommendations
 */
export function generateAdjustmentRecommendations(
  assets: Record<string, number>,
  totalValue: number,
  targetDiversification: number = 0.12 // Target HHI for well-diversified portfolio
): PortfolioAdjustment[] {
  if (totalValue === 0) return [];

  const currentHHI = calculateHHI(assets, totalValue);

  // If already well-diversified, no adjustments needed
  if (currentHHI < 0.15) {
    return [];
  }

  const adjustments: PortfolioAdjustment[] = [];
  const assetClasses = Object.keys(assets);
  const numAssets = assetClasses.length;

  // Calculate ideal equal weight
  const idealWeight = 1 / Math.max(numAssets, 3); // At least 3 asset classes

  assetClasses.forEach((assetClass) => {
    const currentValue = assets[assetClass];
    const currentWeight = currentValue / totalValue;

    // If weight is significantly above ideal, recommend reduction
    if (currentWeight > idealWeight * 1.5) {
      const recommendedValue = totalValue * idealWeight;
      const amountToReduce = currentValue - recommendedValue;

      adjustments.push({
        assetClass,
        currentWeight,
        recommendedWeight: idealWeight,
        action: 'decrease',
        amount: amountToReduce,
        reason: `Reduce concentration in ${assetClass} to improve diversification`,
      });
    }

    // If weight is significantly below ideal, recommend increase
    if (currentWeight < idealWeight * 0.5 && currentWeight > 0) {
      const recommendedValue = totalValue * idealWeight;
      const amountToIncrease = recommendedValue - currentValue;

      adjustments.push({
        assetClass,
        currentWeight,
        recommendedWeight: idealWeight,
        action: 'increase',
        amount: amountToIncrease,
        reason: `Increase allocation to ${assetClass} to improve diversification`,
      });
    }
  });

  // If no assets in certain classes, recommend adding
  const commonAssetClasses = ['Stocks', 'Bonds', 'ETFs', 'REITs'];
  commonAssetClasses.forEach((assetClass) => {
    if (!assets[assetClass] || assets[assetClass] === 0) {
      const recommendedValue = totalValue * idealWeight;
      adjustments.push({
        assetClass,
        currentWeight: 0,
        recommendedWeight: idealWeight,
        action: 'increase',
        amount: recommendedValue,
        reason: `Add ${assetClass} to diversify portfolio`,
      });
    }
  });

  return adjustments;
}

/**
 * Generate diversification recommendations
 */
export function generateDiversificationRecommendations(
  hhi: number,
  level: DiversificationLevel,
  assets: Record<string, number>,
  totalValue: number
): string[] {
  const recommendations: string[] = [];

  if (level === 'concentrated') {
    recommendations.push('Your portfolio is heavily concentrated. Consider rebalancing to reduce risk.');

    // Find top holdings
    const holdings = Object.entries(assets)
      .map(([assetClass, value]) => ({
        assetClass,
        weight: totalValue > 0 ? value / totalValue : 0,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    if (holdings.length > 0 && holdings[0].weight > 0.5) {
      recommendations.push(`${holdings[0].assetClass} represents ${(holdings[0].weight * 100).toFixed(1)}% of your portfolio. Consider reducing this position.`);
    }

    recommendations.push('Add positions in underrepresented asset classes like Bonds, REITs, or Commodities.');
  } else if (level === 'moderate') {
    recommendations.push('Your portfolio has moderate diversification. Adding more asset classes could reduce risk further.');

    const numAssets = Object.values(assets).filter((v) => v > 0).length;
    if (numAssets < 4) {
      recommendations.push(`You have ${numAssets} asset class(es). Consider adding 1-2 more for better diversification.`);
    }
  } else if (level === 'well-diversified') {
    recommendations.push('✅ Your portfolio is well-diversified. Maintain this allocation strategy.');
    recommendations.push('Continue to rebalance periodically to maintain diversification.');
  }

  return recommendations;
}

/**
 * Analyze portfolio diversification
 */
export function analyzeDiversification(assets: Record<string, number>, totalValue: number): DiversificationMetrics {
  const hhi = calculateHHI(assets, totalValue);
  const diversificationScore = calculateDiversificationScore(hhi);
  const level = classifyDiversificationLevel(hhi);

  // Get top holdings
  const topHoldings = Object.entries(assets)
    .map(([assetClass, value]) => ({
      assetClass,
      weight: totalValue > 0 ? value / totalValue : 0,
      percentage: totalValue > 0 ? `${((value / totalValue) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  // Generate recommendations
  const recommendations = generateDiversificationRecommendations(hhi, level, assets, totalValue);

  return {
    hhi,
    diversificationScore,
    level,
    topHoldings,
    recommendations,
  };
}

/**
 * Calculate concentration risk (percentage of portfolio in top N holdings)
 */
export function calculateConcentrationRisk(
  assets: Record<string, number>,
  totalValue: number,
  topN: number = 3
): {
  topNPercentage: number;
  topNCount: number;
  riskLevel: string;
} {
  if (totalValue === 0) {
    return {
      topNPercentage: 0,
      topNCount: 0,
      riskLevel: 'none',
    };
  }

  const sortedAssets = Object.values(assets)
    .sort((a, b) => b - a)
    .slice(0, topN);

  const topNValue = sortedAssets.reduce((sum, value) => sum + value, 0);
  const topNPercentage = (topNValue / totalValue) * 100;

  let riskLevel = 'low';
  if (topNPercentage > 70) {
    riskLevel = 'high';
  } else if (topNPercentage > 50) {
    riskLevel = 'medium';
  }

  return {
    topNPercentage,
    topNCount: sortedAssets.length,
    riskLevel,
  };
}

/**
 * Compare portfolio diversification to benchmark
 */
export function compareToBenchmark(
  portfolioHHI: number,
  benchmarkHHI: number = 0.15 // Well-diversified benchmark
): {
  betterThanBenchmark: boolean;
  difference: number;
  percentageDifference: number;
} {
  const difference = benchmarkHHI - portfolioHHI;
  const percentageDifference = (difference / benchmarkHHI) * 100;

  return {
    betterThanBenchmark: portfolioHHI < benchmarkHHI,
    difference,
    percentageDifference,
  };
}
