/**
 * Evidence-Based Scoring Functions
 * Implements Singapore financial benchmarks for Insurance, CPF, and Private Assets
 */

/**
 * Insurance Protection Score (0-100)
 * Based on LIA/Basic Financial Planning Guide benchmarks:
 * - 9x annual income for death/TPD coverage
 * - 4x annual income for critical illness coverage
 */
export interface InsuranceInputs {
  annualIncome?: number;
  deathOrTPDCover: number;
  criticalIllnessCover: number;
  annualPremiums?: number;
  activePolicyTypes: string[];
  expiredKeyPolicies: number;
}

export function calculateInsuranceProtectionScore(inputs: InsuranceInputs): {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  message?: string;
  breakdown?: {
    deathAdequacyScore: number;
    ciAdequacyScore: number;
    breadthScore: number;
    statusAffordabilityScore: number;
  };
} {
  if (!inputs.annualIncome || inputs.annualIncome <= 0) {
    // Fallback when income missing
    const breadthScore = Math.min((inputs.activePolicyTypes.length / 4) * 100, 100);
    const premiumBurdenRatio = inputs.annualPremiums ? inputs.annualPremiums / 1 : 0;
    const premiumAffordabilityScore = calculatePremiumAffordability(premiumBurdenRatio);
    const expiryPenalty = inputs.expiredKeyPolicies === 0 ? 0 : inputs.expiredKeyPolicies === 1 ? 15 : 30;
    const statusAffordabilityScore = Math.max(premiumAffordabilityScore - expiryPenalty, 0);

    const score = 0.5 * breadthScore + 0.5 * statusAffordabilityScore;
    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence: 'low',
      message: 'Add annual income for adequacy-based protection scoring',
      breakdown: {
        deathAdequacyScore: 0,
        ciAdequacyScore: 0,
        breadthScore,
        statusAffordabilityScore,
      },
    };
  }

  // A. Death / TPD adequacy score (40%)
  const deathCoverageRatio = inputs.deathOrTPDCover / inputs.annualIncome;
  const deathAdequacyScore = Math.min(Math.max((deathCoverageRatio / 9) * 100, 0), 100);

  // B. Critical illness adequacy score (25%)
  const ciCoverageRatio = inputs.criticalIllnessCover / inputs.annualIncome;
  const ciAdequacyScore = Math.min(Math.max((ciCoverageRatio / 4) * 100, 0), 100);

  // C. Policy breadth / protection mix score (20%)
  const breadthScore = Math.min((inputs.activePolicyTypes.length / 4) * 100, 100);

  // D. Policy status / affordability score (15%)
  const premiumBurdenRatio = inputs.annualPremiums ? inputs.annualPremiums / inputs.annualIncome : 0;
  const premiumAffordabilityScore = calculatePremiumAffordability(premiumBurdenRatio);
  const expiryPenalty = inputs.expiredKeyPolicies === 0 ? 0 : inputs.expiredKeyPolicies === 1 ? 15 : 30;
  const statusAffordabilityScore = Math.max(premiumAffordabilityScore - expiryPenalty, 0);

  // Final score
  const score =
    0.4 * deathAdequacyScore +
    0.25 * ciAdequacyScore +
    0.2 * breadthScore +
    0.15 * statusAffordabilityScore;

  return {
    score: Math.min(Math.max(score, 0), 100),
    confidence: 'high',
    breakdown: {
      deathAdequacyScore,
      ciAdequacyScore,
      breadthScore,
      statusAffordabilityScore,
    },
  };
}

function calculatePremiumAffordability(ratio: number): number {
  if (ratio <= 0.1) return 100;
  if (ratio <= 0.15) return 80;
  if (ratio <= 0.2) return 60;
  if (ratio <= 0.25) return 40;
  return 20;
}

/**
 * CPF Retirement Score (0-100)
 * Based on CPF Board benchmarks:
 * - 2026 BRS = $110,200
 * - 2026 FRS = $220,400
 * - 2026 ERS = $440,800
 */
export interface CPFInputs {
  oa?: number;
  sa?: number;
  ma?: number;
  ra?: number;
  cpfLifeBalance?: number;
  estimatedMonthlyPayout?: number;
  projectedRetirementBalance?: number;
  currentYearFRS: number; // e.g. 220400 for 2026
}

export function calculateCPFRetirementScore(inputs: CPFInputs): {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown?: {
    retirementSumScore: number;
    monthlyPayoutScore: number;
    progressScore: number;
  };
} {
  // Calculate retirement relevant balance
  const retirementRelevantBalance =
    (inputs.ra || 0) + (inputs.cpfLifeBalance || 0) || (inputs.oa || 0) + (inputs.sa || 0);

  // A. Retirement sum adequacy score (60%)
  const frsTarget = inputs.currentYearFRS;
  let retirementSumScore: number;

  if (retirementRelevantBalance >= frsTarget) {
    retirementSumScore = 100;
  } else if (retirementRelevantBalance >= 0.75 * frsTarget) {
    retirementSumScore = 85;
  } else if (retirementRelevantBalance >= 0.5 * frsTarget) {
    retirementSumScore = 70;
  } else if (retirementRelevantBalance >= 0.25 * frsTarget) {
    retirementSumScore = 50;
  } else {
    retirementSumScore = 30;
  }

  // B. CPF LIFE payout adequacy score (25%)
  let monthlyPayoutScore = 50; // default
  if (inputs.estimatedMonthlyPayout) {
    if (inputs.estimatedMonthlyPayout >= 1780) {
      monthlyPayoutScore = 100;
    } else if (inputs.estimatedMonthlyPayout >= 1200) {
      monthlyPayoutScore = 80;
    } else if (inputs.estimatedMonthlyPayout >= 950) {
      monthlyPayoutScore = 60;
    } else if (inputs.estimatedMonthlyPayout >= 600) {
      monthlyPayoutScore = 40;
    } else {
      monthlyPayoutScore = 20;
    }
  }

  // C. Progress / runway score (15%)
  let progressScore = 50; // default
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  if (inputs.projectedRetirementBalance) {
    const projectionRatio = inputs.projectedRetirementBalance / frsTarget;
    progressScore = Math.min(Math.max(projectionRatio * 100, 0), 100);
    confidence = 'high';
  }

  // Final score
  const score = 0.6 * retirementSumScore + 0.25 * monthlyPayoutScore + 0.15 * progressScore;

  return {
    score: Math.min(Math.max(score, 0), 100),
    confidence,
    breakdown: {
      retirementSumScore,
      monthlyPayoutScore,
      progressScore,
    },
  };
}

/**
 * Private Asset Quality Score (0-100)
 * Measures coverage, confidence, freshness, concentration, and tracking depth
 */
export interface PrivateAsset {
  currentEstimatedValue?: number;
  purchasePrice?: number;
  confidence?: 'high' | 'medium' | 'low';
  updatedAt?: string;
  historicalValuations?: { date: string; estimatedValue: number }[];
}

export function calculatePrivateAssetQualityScore(assets: PrivateAsset[]): {
  score: number;
  breakdown?: {
    coverageScore: number;
    confidenceScore: number;
    freshnessScore: number;
    concentrationScore: number;
    trackingDepthScore: number;
    appreciationBonus: number;
  };
} {
  if (!assets || assets.length === 0) {
    return {
      score: 40,
      breakdown: {
        coverageScore: 40,
        confidenceScore: 50,
        freshnessScore: 50,
        concentrationScore: 50,
        trackingDepthScore: 0,
        appreciationBonus: 0,
      },
    };
  }

  // A. Coverage score (25%)
  const assetsWithValue = assets.filter(a => a.currentEstimatedValue && a.currentEstimatedValue > 0).length;
  const coverageScore = (assetsWithValue / assets.length) * 100;

  // B. Confidence score (25%)
  const confidenceMap: Record<string, number> = {
    high: 100,
    medium: 70,
    low: 40,
  };
  const confidenceScores = assets.map(a => confidenceMap[a.confidence || 'unknown'] || 50);
  const confidenceScore = confidenceScores.reduce((a, b) => a + b, 0) / assets.length;

  // C. Freshness score (20%)
  const today = new Date();
  const freshnessScores = assets
    .filter(a => a.updatedAt)
    .map(a => {
      const lastUpdate = new Date(a.updatedAt!);
      const daysOld = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOld <= 90) return 100;
      if (daysOld <= 180) return 80;
      if (daysOld <= 365) return 60;
      if (daysOld <= 730) return 35;
      return 20;
    });
  const freshnessScore = freshnessScores.length > 0 ? freshnessScores.reduce((a, b) => a + b, 0) / freshnessScores.length : 50;

  // D. Concentration score (20%)
  const totalValue = assets.reduce((sum, a) => sum + (a.currentEstimatedValue || 0), 0);
  let concentrationScore = 50;

  if (totalValue > 0) {
    const weights = assets.map(a => (a.currentEstimatedValue || 0) / totalValue);
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    concentrationScore = Math.max((1 - hhi) * 100, 20);
  }

  // E. Tracking depth score (10%)
  const assetsWithHistory = assets.filter(a => a.historicalValuations && a.historicalValuations.length >= 2).length;
  const trackingDepthScore = (assetsWithHistory / assets.length) * 100;

  // Optional appreciation bonus
  const totalCostBasis = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const totalUnrealisedPnL = totalValue - totalCostBasis;
  const unrealisedGainRatio = totalCostBasis > 0 ? totalUnrealisedPnL / totalCostBasis : 0;

  let appreciationBonus = 0;
  if (unrealisedGainRatio > 0.2) {
    appreciationBonus = 10;
  } else if (unrealisedGainRatio > 0) {
    appreciationBonus = 5;
  }

  // Final score
  const baseScore =
    0.25 * coverageScore +
    0.25 * confidenceScore +
    0.2 * freshnessScore +
    0.2 * concentrationScore +
    0.1 * trackingDepthScore;

  const finalScore = Math.min(baseScore + appreciationBonus, 100);

  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    breakdown: {
      coverageScore,
      confidenceScore,
      freshnessScore,
      concentrationScore,
      trackingDepthScore,
      appreciationBonus,
    },
  };
}

/**
 * Get status label for Insurance score
 */
export function getInsuranceStatusLabel(score: number): string {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Limited';
  return 'Weak';
}

/**
 * Get status label for CPF score
 */
export function getCPFStatusLabel(score: number): string {
  if (score >= 85) return 'On Track';
  if (score >= 70) return 'Building Well';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Needs Attention';
  return 'Behind Target';
}

/**
 * Get status label for Private Asset score
 */
export function getPrivateAssetStatusLabel(score: number): string {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Weak';
  return 'Poor Data Quality';
}
