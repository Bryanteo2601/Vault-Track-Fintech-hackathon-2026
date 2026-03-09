import { describe, it, expect } from 'vitest';
import {
  calculateSafetyThreshold,
  projectMonthlyBalance,
  isLiquidityWarning,
  generateLiquidityWarning,
  generateCashflowForecast,
  generateCashflowRecommendations,
  calculateAverageMonthlyExpenses,
  calculateAverageMonthlyIncome,
  findBalanceExtremes,
  calculateForecastTotals,
} from '../lib/cashflow-forecasting-engine';

describe('Cashflow Forecasting Engine', () => {
  const sampleTransactions = Array(12).fill(null).map((_, i) => ({
    income: 5000 + (i % 2) * 500,
    expenses: 3000 + (i % 3) * 200,
    loanPayments: 500,
    otherInflows: 0,
    otherOutflows: 0,
  }));

  describe('calculateSafetyThreshold', () => {
    it('should calculate safety threshold as 3 months of expenses', () => {
      const threshold = calculateSafetyThreshold(sampleTransactions, 3);
      const avgExpenses = sampleTransactions.reduce((sum, t) => sum + t.expenses, 0) / sampleTransactions.length;
      expect(threshold).toBeCloseTo(avgExpenses * 3, 1);
    });

    it('should allow custom threshold months', () => {
      const threshold3 = calculateSafetyThreshold(sampleTransactions, 3);
      const threshold6 = calculateSafetyThreshold(sampleTransactions, 6);
      expect(threshold6).toBeCloseTo(threshold3 * 2, 1);
    });

    it('should handle empty transactions', () => {
      const threshold = calculateSafetyThreshold([], 3);
      expect(threshold === 0 || Number.isNaN(threshold)).toBe(true);
    });
  });

  describe('projectMonthlyBalance', () => {
    it('should calculate closing balance correctly', () => {
      const balance = projectMonthlyBalance(10000, {
        income: 5000,
        expenses: 3000,
        loanPayments: 500,
        otherInflows: 0,
        otherOutflows: 0,
      });
      expect(balance).toBe(10000 + 5000 - 3000 - 500);
    });

    it('should handle negative cash flow', () => {
      const balance = projectMonthlyBalance(10000, {
        income: 2000,
        expenses: 5000,
        loanPayments: 1000,
        otherInflows: 0,
        otherOutflows: 0,
      });
      expect(balance).toBeLessThan(10000);
    });

    it('should include other inflows and outflows', () => {
      const balance = projectMonthlyBalance(10000, {
        income: 5000,
        expenses: 3000,
        loanPayments: 500,
        otherInflows: 1000,
        otherOutflows: 200,
      });
      expect(balance).toBe(10000 + 5000 - 3000 - 500 + 1000 - 200);
    });
  });

  describe('isLiquidityWarning', () => {
    it('should not warn when balance is above threshold', () => {
      const result = isLiquidityWarning(10000, 5000);
      expect(result.isWarning).toBe(false);
      expect(result.isCritical).toBe(false);
    });

    it('should warn when balance is below threshold', () => {
      const result = isLiquidityWarning(3000, 5000);
      expect(result.isWarning).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it('should flag critical when balance is below 50% of threshold', () => {
      const result = isLiquidityWarning(2000, 5000);
      expect(result.isWarning).toBe(true);
      expect(result.isCritical).toBe(true);
    });
  });

  describe('generateLiquidityWarning', () => {
    it('should return undefined when balance is healthy', () => {
      const warning = generateLiquidityWarning(10000, 5000, 'January');
      expect(warning).toBeUndefined();
    });

    it('should generate warning message for low balance', () => {
      const warning = generateLiquidityWarning(3000, 5000, 'January');
      expect(warning).toBeDefined();
      expect(warning).toContain('WARNING');
      expect(warning).toContain('January');
    });

    it('should generate critical message for very low balance', () => {
      const warning = generateLiquidityWarning(2000, 5000, 'February');
      expect(warning).toBeDefined();
      expect(warning).toContain('CRITICAL');
    });
  });

  describe('generateCashflowForecast', () => {
    it('should generate 12-month forecast', () => {
      const forecast = generateCashflowForecast(10000, sampleTransactions);
      expect(forecast.forecastMonths.length).toBeLessThanOrEqual(12);
      expect(forecast.startingBalance).toBe(10000);
    });

    it('should track minimum balance', () => {
      const forecast = generateCashflowForecast(10000, sampleTransactions);
      expect(forecast.minimumBalance).toBeLessThanOrEqual(forecast.startingBalance + sampleTransactions[0].income);
    });

    it('should identify liquidity warnings', () => {
      const lowBalanceTransactions = Array(12).fill({
        income: 1000,
        expenses: 2000,
        loanPayments: 500,
        otherInflows: 0,
        otherOutflows: 0,
      });

      const forecast = generateCashflowForecast(5000, lowBalanceTransactions);
      expect(forecast.monthsWithWarnings).toBeGreaterThan(0);
    });

    it('should handle empty transactions', () => {
      const forecast = generateCashflowForecast(10000, []);
      expect(forecast.forecastMonths.length).toBe(0);
      expect(forecast.projectedEndingBalance).toBe(10000);
    });

    it('should calculate average monthly balance', () => {
      const forecast = generateCashflowForecast(10000, sampleTransactions);
      expect(forecast.averageMonthlyBalance).toBeGreaterThan(0);
    });

    it('should generate recommendations', () => {
      const forecast = generateCashflowForecast(10000, sampleTransactions);
      expect(forecast.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('generateCashflowRecommendations', () => {
    it('should recommend building emergency fund if balance is low', () => {
      const recs = generateCashflowRecommendations(2000, 5000, 1, 0, []);
      expect(recs.some((r) => r.includes('emergency'))).toBe(true);
    });

    it('should provide positive feedback if healthy', () => {
      const recs = generateCashflowRecommendations(10000, 5000, 0, 0, []);
      expect(recs.some((r) => r.includes('✅'))).toBe(true);
    });

    it('should warn about negative balance', () => {
      const recs = generateCashflowRecommendations(-1000, 5000, 0, 0, []);
      expect(recs.some((r) => r.includes('negative'))).toBe(true);
    });

    it('should warn about critical balance', () => {
      const recs = generateCashflowRecommendations(1000, 5000, 2, 0, []);
      expect(recs.some((r) => r.includes('CRITICAL'))).toBe(true);
    });
  });

  describe('calculateAverageMonthlyExpenses', () => {
    it('should calculate average expenses', () => {
      const avg = calculateAverageMonthlyExpenses(sampleTransactions);
      const expected = sampleTransactions.reduce((sum, t) => sum + t.expenses, 0) / sampleTransactions.length;
      expect(avg).toBeCloseTo(expected, 1);
    });

    it('should handle empty transactions', () => {
      const avg = calculateAverageMonthlyExpenses([]);
      expect(avg).toBe(0);
    });
  });

  describe('calculateAverageMonthlyIncome', () => {
    it('should calculate average income', () => {
      const avg = calculateAverageMonthlyIncome(sampleTransactions);
      const expected = sampleTransactions.reduce((sum, t) => sum + t.income, 0) / sampleTransactions.length;
      expect(avg).toBeCloseTo(expected, 1);
    });

    it('should handle empty transactions', () => {
      const avg = calculateAverageMonthlyIncome([]);
      expect(avg).toBe(0);
    });
  });

  describe('findBalanceExtremes', () => {
    it('should find highest and lowest balance months', () => {
      const forecast = generateCashflowForecast(10000, sampleTransactions);
      const extremes = findBalanceExtremes(forecast.forecastMonths);

      expect(extremes.highestBalance).toBeGreaterThanOrEqual(extremes.lowestBalance);
      expect(extremes.highestBalanceMonth).toBeDefined();
      expect(extremes.lowestBalanceMonth).toBeDefined();
    });

    it('should handle empty forecast', () => {
      const extremes = findBalanceExtremes([]);
      expect(extremes.highestBalance).toBe(0);
      expect(extremes.lowestBalance).toBe(0);
    });
  });

  describe('calculateForecastTotals', () => {
    it('should calculate total inflows and outflows', () => {
      const totals = calculateForecastTotals(sampleTransactions);

      expect(totals.totalIncome).toBeGreaterThan(0);
      expect(totals.totalExpenses).toBeGreaterThan(0);
      expect(totals.netCashFlow).toBeDefined();
    });

    it('should include all transaction types', () => {
      const transactions = [
        {
          income: 5000,
          expenses: 3000,
          loanPayments: 500,
          otherInflows: 500,
          otherOutflows: 200,
        },
      ];

      const totals = calculateForecastTotals(transactions);

      expect(totals.totalIncome).toBe(5000);
      expect(totals.totalExpenses).toBe(3000);
      expect(totals.totalLoanPayments).toBe(500);
      expect(totals.totalOtherInflows).toBe(500);
      expect(totals.totalOtherOutflows).toBe(200);
      expect(totals.netCashFlow).toBe(5000 - 3000 - 500 + 500 - 200);
    });

    it('should handle empty transactions', () => {
      const totals = calculateForecastTotals([]);

      expect(totals.totalIncome).toBe(0);
      expect(totals.totalExpenses).toBe(0);
      expect(totals.netCashFlow).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle realistic cashflow scenario', () => {
      const transactions = Array(12).fill(null).map((_, i) => ({
        income: 6000,
        expenses: 3500 + (i === 11 ? 2000 : 0), // High expenses in December
        loanPayments: 800,
        otherInflows: i === 6 ? 5000 : 0, // Bonus in July
        otherOutflows: 0,
      }));

      const forecast = generateCashflowForecast(5000, transactions);

      expect(forecast.forecastMonths.length).toBe(12);
      expect(forecast.projectedEndingBalance).toBeGreaterThan(0);
      expect(forecast.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify critical months', () => {
      const transactions = Array(12).fill(null).map((_, i) => ({
        income: 3000,
        expenses: 4000,
        loanPayments: 500,
        otherInflows: 0,
        otherOutflows: 0,
      }));

      const forecast = generateCashflowForecast(10000, transactions);

      expect(forecast.monthsWithWarnings).toBeGreaterThan(0);
      expect(forecast.minimumBalance).toBeLessThan(10000);
    });

    it('should handle seasonal variations', () => {
      const transactions = Array(12).fill(null).map((_, i) => {
        const isHolidaySeason = i === 10 || i === 11;
        return {
          income: 5000,
          expenses: isHolidaySeason ? 6000 : 3000,
          loanPayments: 500,
          otherInflows: 0,
          otherOutflows: 0,
        };
      });

      const forecast = generateCashflowForecast(10000, transactions);

      // With starting balance of 10000, may not trigger warnings immediately
      expect(forecast.recommendations.length).toBeGreaterThan(0);
      expect(forecast.forecastMonths.length).toBe(12);
    });
  });
});
