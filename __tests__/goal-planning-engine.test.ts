import { describe, it, expect } from 'vitest';
import {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  calculateAchievementProbability,
  projectCompletionYear,
  generateGoalRecommendations,
  analyzeFinancialGoal,
  calculateGoalsSummary,
  calculateTotalSavingsNeeded,
} from '../lib/goal-planning-engine';

describe('Goal Planning Engine', () => {
  describe('calculateFutureValue', () => {
    it('should calculate FV with no contributions', () => {
      const fv = calculateFutureValue(10000, 0, 5, 10);
      expect(fv).toBeCloseTo(16470.09, 1);
    });

    it('should calculate FV with monthly contributions', () => {
      const fv = calculateFutureValue(10000, 500, 5, 10);
      expect(fv).toBeGreaterThan(10000 + 500 * 120);
    });

    it('should handle 0% return rate', () => {
      const fv = calculateFutureValue(10000, 500, 0, 10);
      expect(fv).toBe(10000 + 500 * 120);
    });

    it('should handle 0 years', () => {
      const fv = calculateFutureValue(10000, 500, 5, 0);
      expect(fv).toBe(10000);
    });

    it('should handle high return rates', () => {
      const fv = calculateFutureValue(10000, 500, 20, 10);
      expect(fv).toBeGreaterThan(calculateFutureValue(10000, 500, 5, 10));
    });

    it('should handle large contributions', () => {
      const fv = calculateFutureValue(10000, 5000, 5, 10);
      expect(fv).toBeGreaterThan(calculateFutureValue(10000, 500, 5, 10));
    });
  });

  describe('calculateRequiredMonthlyContribution', () => {
    it('should calculate required contribution to reach target', () => {
      const required = calculateRequiredMonthlyContribution(10000, 100000, 5, 10);
      expect(required).toBeGreaterThan(0);
      expect(required).toBeLessThan(1000);
    });

    it('should return 0 if already at target', () => {
      const required = calculateRequiredMonthlyContribution(100000, 100000, 5, 10);
      expect(required).toBe(0);
    });

    it('should return 0 if target is below current savings', () => {
      const required = calculateRequiredMonthlyContribution(100000, 50000, 5, 10);
      expect(required).toBe(0);
    });

    it('should handle 0% return rate', () => {
      const required = calculateRequiredMonthlyContribution(10000, 100000, 0, 10);
      expect(required).toBeCloseTo((100000 - 10000) / 120, 1);
    });

    it('should handle 0 years', () => {
      const required = calculateRequiredMonthlyContribution(10000, 100000, 5, 0);
      expect(required).toBe(Infinity);
    });
  });

  describe('calculateAchievementProbability', () => {
    it('should return 100% if already at target', () => {
      const prob = calculateAchievementProbability(100000, 100000, 150000, 1000, 100000);
      expect(prob).toBe(100);
    });

    it('should return high probability if projected exceeds target', () => {
      const prob = calculateAchievementProbability(10000, 100000, 120000, 1000, 100000);
      expect(prob).toBeGreaterThan(90);
    });

    it('should return lower probability with shortfall', () => {
      const prob = calculateAchievementProbability(10000, 100000, 50000, 1000, 100000);
      expect(prob).toBeLessThan(80);
    });

    it('should increase probability with higher savings rate', () => {
      const prob1 = calculateAchievementProbability(10000, 100000, 50000, 500, 100000);
      const prob2 = calculateAchievementProbability(10000, 100000, 50000, 2000, 100000);
      expect(prob2).toBeGreaterThan(prob1);
    });

    it('should return minimum 0 probability', () => {
      const prob = calculateAchievementProbability(10000, 100000, 0, 0, 100000);
      expect(prob).toBeGreaterThanOrEqual(0);
    });
  });

  describe('projectCompletionYear', () => {
    it('should return target year if goal is achievable', () => {
      const year = projectCompletionYear(2026, 10, 100000, 100000);
      expect(year).toBe(2036);
    });

    it('should add years if goal is not achievable', () => {
      const year = projectCompletionYear(2026, 10, 50000, 100000);
      expect(year).toBeGreaterThan(2036);
    });

    it('should handle current year correctly', () => {
      const year = projectCompletionYear(2025, 5, 100000, 100000);
      expect(year).toBe(2030);
    });
  });

  describe('generateGoalRecommendations', () => {
    it('should recommend increasing contributions if shortfall exists', () => {
      const recs = generateGoalRecommendations(50000, 100000, 1000, 500, 50);
      expect(recs.some((r) => r.includes('Increase'))).toBe(true);
    });

    it('should provide positive feedback if on track', () => {
      const recs = generateGoalRecommendations(100000, 100000, 500, 500, 90);
      expect(recs.some((r) => r.includes('✅'))).toBe(true);
    });

    it('should warn if probability is low', () => {
      const recs = generateGoalRecommendations(30000, 100000, 2000, 500, 30);
      expect(recs.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeFinancialGoal', () => {
    it('should return complete goal projection', () => {
      const goal = {
        name: 'House Down Payment',
        targetAmount: 100000,
        currentSavings: 20000,
        monthlyContribution: 1000,
        expectedAnnualReturn: 5,
        timeHorizonYears: 5,
      };

      const projection = analyzeFinancialGoal(goal);

      expect(projection.goalName).toBe('House Down Payment');
      expect(projection.targetAmount).toBe(100000);
      expect(projection.projectedSavings).toBeGreaterThan(20000);
      expect(projection.achievementPercentage).toBeGreaterThan(0);
      expect(projection.achievementProbability).toBeGreaterThan(0);
      expect(projection.recommendations.length).toBeGreaterThan(0);
    });

    it('should mark achievable goals correctly', () => {
      const goal = {
        name: 'Emergency Fund',
        targetAmount: 50000,
        currentSavings: 40000,
        monthlyContribution: 1000,
        expectedAnnualReturn: 3,
        timeHorizonYears: 1,
      };

      const projection = analyzeFinancialGoal(goal);
      expect(projection.isAchievable).toBe(true);
    });

    it('should mark unachievable goals correctly', () => {
      const goal = {
        name: 'Luxury Car',
        targetAmount: 500000,
        currentSavings: 5000,
        monthlyContribution: 100,
        expectedAnnualReturn: 2,
        timeHorizonYears: 1,
      };

      const projection = analyzeFinancialGoal(goal);
      expect(projection.isAchievable).toBe(false);
      expect(projection.shortfall).toBeGreaterThan(0);
    });
  });

  describe('calculateGoalsSummary', () => {
    it('should calculate summary for multiple goals', () => {
      const goals = [
        {
          name: 'Goal 1',
          targetAmount: 100000,
          currentSavings: 20000,
          monthlyContribution: 1000,
          expectedAnnualReturn: 5,
          timeHorizonYears: 5,
        },
        {
          name: 'Goal 2',
          targetAmount: 50000,
          currentSavings: 10000,
          monthlyContribution: 500,
          expectedAnnualReturn: 3,
          timeHorizonYears: 3,
        },
      ];

      const summary = calculateGoalsSummary(goals);

      expect(summary.totalGoals).toBe(2);
      expect(summary.totalTargetAmount).toBe(150000);
      expect(summary.projections.length).toBe(2);
      expect(summary.averageProbability).toBeGreaterThan(0);
    });

    it('should handle empty goals array', () => {
      const summary = calculateGoalsSummary([]);
      expect(summary.totalGoals).toBe(0);
      expect(summary.totalTargetAmount).toBe(0);
      expect(summary.averageProbability).toBe(0);
    });
  });

  describe('calculateTotalSavingsNeeded', () => {
    it('should calculate total monthly savings needed', () => {
      const goals = [
        {
          name: 'Goal 1',
          targetAmount: 100000,
          currentSavings: 20000,
          monthlyContribution: 1000,
          expectedAnnualReturn: 5,
          timeHorizonYears: 5,
        },
        {
          name: 'Goal 2',
          targetAmount: 50000,
          currentSavings: 10000,
          monthlyContribution: 500,
          expectedAnnualReturn: 3,
          timeHorizonYears: 3,
        },
      ];

      const totals = calculateTotalSavingsNeeded(goals);

      expect(totals.totalMonthlyContributing).toBe(1500);
      expect(totals.totalMonthlyNeeded).toBeGreaterThan(0);
    });

    it('should calculate shortfall correctly', () => {
      const goals = [
        {
          name: 'Goal 1',
          targetAmount: 500000,
          currentSavings: 5000,
          monthlyContribution: 100,
          expectedAnnualReturn: 2,
          timeHorizonYears: 1,
        },
      ];

      const totals = calculateTotalSavingsNeeded(goals);

      expect(totals.shortfallPerMonth).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle realistic retirement goal', () => {
      const goal = {
        name: 'Retirement',
        targetAmount: 1000000,
        currentSavings: 100000,
        monthlyContribution: 5000,
        expectedAnnualReturn: 6,
        timeHorizonYears: 20,
      };

      const projection = analyzeFinancialGoal(goal);

      expect(projection.projectedSavings).toBeGreaterThan(goal.currentSavings);
      expect(projection.recommendations.length).toBeGreaterThan(0);
      expect(projection.projectedCompletionYear).toBeGreaterThan(2026);
    });

    it('should handle multiple goals with different timelines', () => {
      const goals = [
        {
          name: 'House Down Payment',
          targetAmount: 200000,
          currentSavings: 50000,
          monthlyContribution: 2000,
          expectedAnnualReturn: 4,
          timeHorizonYears: 3,
        },
        {
          name: 'Car Purchase',
          targetAmount: 80000,
          currentSavings: 20000,
          monthlyContribution: 1000,
          expectedAnnualReturn: 3,
          timeHorizonYears: 2,
        },
        {
          name: 'Vacation Fund',
          targetAmount: 20000,
          currentSavings: 5000,
          monthlyContribution: 500,
          expectedAnnualReturn: 2,
          timeHorizonYears: 1,
        },
      ];

      const summary = calculateGoalsSummary(goals);

      expect(summary.totalGoals).toBe(3);
      expect(summary.totalTargetAmount).toBe(300000);
      expect(summary.achievableGoals).toBeGreaterThanOrEqual(0);
    });
  });
});
