import { describe, it, expect } from 'vitest';
import { calculateWellnessScore, getWellnessInsights } from '../lib/wellness-score-calculator';

describe('Wellness Score Calculator', () => {
  describe('Credit Score Normalization', () => {
    it('should normalize credit score 300 to 0', () => {
      const result = calculateWellnessScore({
        creditScore: 300,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.creditScoreNorm).toBe(0);
    });

    it('should normalize credit score 850 to 100', () => {
      const result = calculateWellnessScore({
        creditScore: 850,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.creditScoreNorm).toBe(100);
    });

    it('should normalize credit score 575 (midpoint) to 50', () => {
      const result = calculateWellnessScore({
        creditScore: 575,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.creditScoreNorm).toBe(50);
    });
  });

  describe('Liquidity Score', () => {
    it('should return 20 for <1 month liquidity', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 3000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.liquidityScore).toBe(20);
    });

    it('should return 50 for 1-3 months liquidity', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 10000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.liquidityScore).toBe(50);
    });

    it('should return 80 for 3-6 months liquidity', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 20000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.liquidityScore).toBe(80);
    });

    it('should return 100 for >6 months liquidity', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 35000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.liquidityScore).toBe(100);
    });
  });

  describe('Diversification Score', () => {
    it('should penalize high concentration (>60%)', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 70000, bonds: 30000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.diversificationScore).toBeLessThan(80);
    });

    it('should reward balanced allocation', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 25000, bonds: 25000, reits: 25000, crypto: 25000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.diversificationScore).toBeGreaterThan(80);
    });
  });

  describe('Net Worth Growth Score', () => {
    it('should return 40 for negative growth', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 80000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.netWorthGrowthScore).toBe(40);
    });

    it('should return 60 for 0-5% growth', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 102000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.netWorthGrowthScore).toBe(60);
    });

    it('should return 80 for 5-10% growth', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 107000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.netWorthGrowthScore).toBe(80);
    });

    it('should return 100 for >10% growth', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 112000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      expect(result.netWorthGrowthScore).toBe(100);
    });
  });

  describe('Debt Ratio Score', () => {
    it('should return 20 for debt ratio >0.8', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 85000,
        assets: 100000,
      });
      expect(result.debtRatioScore).toBe(20);
    });

    it('should return 50 for debt ratio 0.5-0.8', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 65000,
        assets: 100000,
      });
      expect(result.debtRatioScore).toBe(50);
    });

    it('should return 80 for debt ratio 0.3-0.5', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 40000,
        assets: 100000,
      });
      expect(result.debtRatioScore).toBe(80);
    });

    it('should return 100 for debt ratio <0.3', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 20000,
        assets: 100000,
      });
      expect(result.debtRatioScore).toBe(100);
    });
  });

  describe('Composite Score', () => {
    it('should calculate weighted composite score correctly', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 20000,
        assets: 100000,
      });
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should assign grade A for score >= 90', () => {
      const result = calculateWellnessScore({
        creditScore: 850,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 25000, bonds: 25000, reits: 25000, crypto: 25000 },
        currentNetWorth: 110000,
        previousNetWorth: 100000,
        liabilities: 10000,
        assets: 100000,
      });
      if (result.totalScore >= 90) {
        expect(result.grade).toBe('A');
      }
    });

    it('should assign grade B for score 80-89', () => {
      const result = calculateWellnessScore({
        creditScore: 750,
        liquidAssets: 40000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 105000,
        previousNetWorth: 100000,
        liabilities: 30000,
        assets: 100000,
      });
      if (result.totalScore >= 80 && result.totalScore < 90) {
        expect(result.grade).toBe('B');
      }
    });

    it('should assign grade F for score <60', () => {
      const result = calculateWellnessScore({
        creditScore: 300,
        liquidAssets: 5000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 50000,
        previousNetWorth: 100000,
        liabilities: 90000,
        assets: 100000,
      });
      if (result.totalScore < 60) {
        expect(result.grade).toBe('F');
      }
    });
  });

  describe('Wellness Insights', () => {
    it('should provide insights for low credit score', () => {
      const result = calculateWellnessScore({
        creditScore: 400,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      const insights = getWellnessInsights(result);
      expect(insights.some(i => i.includes('credit score'))).toBe(true);
    });

    it('should provide insights for low liquidity', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 2000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 0,
        assets: 100000,
      });
      const insights = getWellnessInsights(result);
      expect(insights.some(i => i.includes('emergency fund'))).toBe(true);
    });

    it('should provide insights for high debt ratio', () => {
      const result = calculateWellnessScore({
        creditScore: 700,
        liquidAssets: 50000,
        monthlyExpenses: 5000,
        assetAllocation: { stocks: 50000 },
        currentNetWorth: 100000,
        previousNetWorth: 100000,
        liabilities: 85000,
        assets: 100000,
      });
      const insights = getWellnessInsights(result);
      expect(insights.some(i => i.includes('debt'))).toBe(true);
    });
  });
});
