/**
 * Goal-Based Financial Planning Engine
 * Calculates future value, goal achievement probability, and required savings
 */

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedAnnualReturn: number;
  timeHorizonYears: number;
  createdAt: Date;
  targetDate: Date;
}

export interface GoalProjection {
  goalName: string;
  currentSavings: number;
  targetAmount: number;
  timeHorizonYears: number;
  monthlyContribution: number;
  expectedAnnualReturn: number;
  projectedSavings: number;
  shortfall: number;
  achievementPercentage: number;
  achievementProbability: number;
  requiredMonthlyContribution: number;
  projectedCompletionYear: number;
  isAchievable: boolean;
  recommendations: string[];
}

/**
 * Calculate future value using compound interest formula
 * FV = P*(1+r)^n + PMT*((1+r)^n - 1)/r
 * Where:
 * P = current savings (principal)
 * PMT = monthly contribution
 * r = monthly return rate (annual return / 12)
 * n = total months (years * 12)
 */
export function calculateFutureValue(
  currentSavings: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): number {
  if (years <= 0) return currentSavings;

  const monthlyRate = annualReturnRate / 12 / 100;
  const months = years * 12;

  // Handle edge case of 0% return
  if (monthlyRate === 0) {
    return currentSavings + monthlyContribution * months;
  }

  // FV = P*(1+r)^n + PMT*((1+r)^n - 1)/r
  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const principalFV = currentSavings * compoundFactor;
  const contributionsFV = monthlyContribution * ((compoundFactor - 1) / monthlyRate);

  return principalFV + contributionsFV;
}

/**
 * Calculate required monthly contribution to reach target amount
 */
export function calculateRequiredMonthlyContribution(
  currentSavings: number,
  targetAmount: number,
  annualReturnRate: number,
  years: number
): number {
  if (years <= 0) {
    return targetAmount > currentSavings ? Infinity : 0;
  }

  const monthlyRate = annualReturnRate / 12 / 100;
  const months = years * 12;

  // Handle edge case of 0% return
  if (monthlyRate === 0) {
    const remainingAmount = Math.max(0, targetAmount - currentSavings);
    return remainingAmount / months;
  }

  // Rearrange FV formula to solve for PMT
  // PMT = (FV - P*(1+r)^n) / (((1+r)^n - 1) / r)
  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const principalFV = currentSavings * compoundFactor;
  const remainingNeeded = Math.max(0, targetAmount - principalFV);
  const contributionFactor = (compoundFactor - 1) / monthlyRate;

  return remainingNeeded / contributionFactor;
}

/**
 * Calculate goal achievement probability based on current trajectory
 * Probability increases with savings rate and decreases with shortfall
 */
export function calculateAchievementProbability(
  currentSavings: number,
  targetAmount: number,
  projectedSavings: number,
  monthlyContribution: number,
  targetAmount_: number
): number {
  // If already at target, probability is 100%
  if (currentSavings >= targetAmount_) return 100;

  // If projected savings exceed target, high probability
  if (projectedSavings >= targetAmount_) {
    return Math.min(100, 95 + (projectedSavings - targetAmount_) / targetAmount_ * 5);
  }

  // Calculate shortfall percentage
  const shortfallPercentage = (targetAmount_ - projectedSavings) / targetAmount_;

  // Calculate savings rate relative to target
  const savingsRate = monthlyContribution / (targetAmount_ / 12);

  // Probability formula: starts at 50% with shortfall, increases with savings rate
  const baseProbability = 50 * (1 - Math.min(1, shortfallPercentage));
  const savingsBonus = savingsRate * 30; // Up to 30% bonus for high savings rate

  return Math.max(0, Math.min(100, baseProbability + savingsBonus));
}

/**
 * Project goal completion year
 */
export function projectCompletionYear(
  currentYear: number,
  timeHorizonYears: number,
  projectedSavings: number,
  targetAmount: number
): number {
  if (projectedSavings >= targetAmount) {
    return currentYear + timeHorizonYears;
  }

  // If not achievable with current plan, estimate additional years needed
  const shortfall = targetAmount - projectedSavings;
  const savingsPerYear = 0; // Conservative estimate

  if (savingsPerYear === 0) {
    return currentYear + timeHorizonYears + 10; // Add 10 years as buffer
  }

  const additionalYears = Math.ceil(shortfall / savingsPerYear);
  return currentYear + timeHorizonYears + additionalYears;
}

/**
 * Generate goal recommendations
 */
export function generateGoalRecommendations(
  projectedSavings: number,
  targetAmount: number,
  requiredMonthlyContribution: number,
  currentMonthlyContribution: number,
  achievementProbability: number
): string[] {
  const recommendations: string[] = [];

  if (projectedSavings < targetAmount) {
    const shortfall = targetAmount - projectedSavings;
    recommendations.push(`You're projected to fall short by SGD ${shortfall.toLocaleString('en', { maximumFractionDigits: 0 })}. Consider increasing monthly contributions.`);
  }

  if (requiredMonthlyContribution > currentMonthlyContribution) {
    const additionalNeeded = requiredMonthlyContribution - currentMonthlyContribution;
    recommendations.push(`Increase monthly contributions by SGD ${additionalNeeded.toLocaleString('en', { maximumFractionDigits: 0 })} to reach your goal on time.`);
  }

  if (achievementProbability < 50) {
    recommendations.push('Your current savings plan has a low probability of success. Review your goal timeline or increase contributions.');
  } else if (achievementProbability >= 80) {
    recommendations.push('✅ You\'re on track to achieve this goal. Maintain your current savings discipline.');
  }

  return recommendations;
}

/**
 * Analyze financial goal and generate projection
 */
export function analyzeFinancialGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'targetDate'>): GoalProjection {
  const projectedSavings = calculateFutureValue(
    goal.currentSavings,
    goal.monthlyContribution,
    goal.expectedAnnualReturn,
    goal.timeHorizonYears
  );

  const shortfall = Math.max(0, goal.targetAmount - projectedSavings);
  const achievementPercentage = (projectedSavings / goal.targetAmount) * 100;

  const requiredMonthlyContribution = calculateRequiredMonthlyContribution(
    goal.currentSavings,
    goal.targetAmount,
    goal.expectedAnnualReturn,
    goal.timeHorizonYears
  );

  const achievementProbability = calculateAchievementProbability(
    goal.currentSavings,
    goal.targetAmount,
    projectedSavings,
    goal.monthlyContribution,
    goal.targetAmount
  );

  const currentYear = new Date().getFullYear();
  const projectedCompletionYear = projectCompletionYear(
    currentYear,
    goal.timeHorizonYears,
    projectedSavings,
    goal.targetAmount
  );

  const isAchievable = projectedSavings >= goal.targetAmount;

  const recommendations = generateGoalRecommendations(
    projectedSavings,
    goal.targetAmount,
    requiredMonthlyContribution,
    goal.monthlyContribution,
    achievementProbability
  );

  return {
    goalName: goal.name,
    currentSavings: goal.currentSavings,
    targetAmount: goal.targetAmount,
    timeHorizonYears: goal.timeHorizonYears,
    monthlyContribution: goal.monthlyContribution,
    expectedAnnualReturn: goal.expectedAnnualReturn,
    projectedSavings,
    shortfall,
    achievementPercentage: Math.min(100, achievementPercentage),
    achievementProbability,
    requiredMonthlyContribution,
    projectedCompletionYear,
    isAchievable,
    recommendations,
  };
}

/**
 * Calculate multiple goals summary
 */
export function calculateGoalsSummary(goals: Array<Omit<FinancialGoal, 'id' | 'createdAt' | 'targetDate'>>) {
  const projections = goals.map(analyzeFinancialGoal);

  const totalTargetAmount = projections.reduce((sum, p) => sum + p.targetAmount, 0);
  const totalProjectedSavings = projections.reduce((sum, p) => sum + p.projectedSavings, 0);
  const totalShortfall = projections.reduce((sum, p) => sum + p.shortfall, 0);
  const achievableGoals = projections.filter((p) => p.isAchievable).length;
  const averageProbability = projections.length > 0 ? projections.reduce((sum, p) => sum + p.achievementProbability, 0) / projections.length : 0;

  return {
    totalGoals: projections.length,
    totalTargetAmount,
    totalProjectedSavings,
    totalShortfall,
    achievableGoals,
    achievablePercentage: (achievableGoals / Math.max(1, projections.length)) * 100,
    averageProbability,
    projections,
  };
}

/**
 * Calculate savings rate needed to achieve all goals
 */
export function calculateTotalSavingsNeeded(
  goals: Array<Omit<FinancialGoal, 'id' | 'createdAt' | 'targetDate'>>
): {
  totalMonthlyNeeded: number;
  totalMonthlyContributing: number;
  shortfallPerMonth: number;
} {
  const totalMonthlyNeeded = goals.reduce((sum, goal) => {
    const required = calculateRequiredMonthlyContribution(
      goal.currentSavings,
      goal.targetAmount,
      goal.expectedAnnualReturn,
      goal.timeHorizonYears
    );
    return sum + required;
  }, 0);

  const totalMonthlyContributing = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);

  return {
    totalMonthlyNeeded,
    totalMonthlyContributing,
    shortfallPerMonth: Math.max(0, totalMonthlyNeeded - totalMonthlyContributing),
  };
}
