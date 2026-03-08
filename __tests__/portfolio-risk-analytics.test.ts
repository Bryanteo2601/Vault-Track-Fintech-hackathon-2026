import { describe, it, expect } from 'vitest';
import { calculatePortfolioRiskMetrics, getRiskClassificationDetails, formatPortfolioMetrics } from '../lib/portfolio-risk-analytics';
import { Holding } from '../lib/types';

// Mock Holding factory
function createMockHolding(overrides?: Partial<Holding>): Holding {
  return {
    id: '1',
    assetClass: 'stocks',
    ticker: 'TEST',
    name: 'Test Stock',
    quantity: 100,
    avgCost: 50,
    currentPrice: 55,
    currency: 'SGD',
    purchaseDate: '2023-01-01',
    ...overrides,
  };
}

describe('Portfolio Risk Analytics', () => {
  describe('Portfolio Return Calculation', () => {
    it('should calculate positive portfolio return', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }), // +10%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.portfolioReturn).toBeCloseTo(10, 1);
      expect(metrics.totalCostBasis).toBe(5000);
      expect(metrics.totalCurrentValue).toBe(5500);
      expect(metrics.totalGainLoss).toBe(500);
    });

    it('should calculate negative portfolio return', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 45 }), // -10%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.portfolioReturn).toBeCloseTo(-10, 1);
      expect(metrics.totalGainLoss).toBe(-500);
    });

    it('should handle empty portfolio', () => {
      const metrics = calculatePortfolioRiskMetrics([]);
      expect(metrics.portfolioReturn).toBe(0);
      expect(metrics.volatility).toBe(0);
      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.totalCostBasis).toBe(0);
      expect(metrics.totalCurrentValue).toBe(0);
    });

    it('should handle zero cost basis', () => {
      const holdings = [
        createMockHolding({ quantity: 0, avgCost: 50, currentPrice: 55 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.portfolioReturn).toBe(0);
      expect(metrics.totalCostBasis).toBe(0);
      expect(metrics.totalCurrentValue).toBe(0);
    });

    it('should calculate multi-holding portfolio return', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }), // +10%
        createMockHolding({ id: '2', quantity: 50, avgCost: 100, currentPrice: 90 }), // -10%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      // Total cost: 5000 + 5000 = 10000
      // Total value: 5500 + 4500 = 10000
      // Return: (10000 - 10000) / 10000 = 0%
      expect(metrics.portfolioReturn).toBeCloseTo(0, 1);
      expect(metrics.totalCostBasis).toBe(10000);
      expect(metrics.totalCurrentValue).toBe(10000);
    });
  });

  describe('Portfolio Volatility Calculation', () => {
    it('should calculate volatility for single holding', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      // Single holding has zero variance
      expect(metrics.volatility).toBe(0);
    });

    it('should calculate volatility for multiple holdings with different returns', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 60 }), // +20%
        createMockHolding({ id: '2', quantity: 100, avgCost: 50, currentPrice: 40 }), // -20%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      // Returns: [0.2, -0.2]
      // Mean: 0
      // Variance: (0.2^2 + (-0.2)^2) / 2 = 0.08 / 2 = 0.04
      // Volatility: sqrt(0.04) = 0.2 = 20%
      expect(metrics.volatility).toBeCloseTo(20, 1);
    });

    it('should handle zero volatility portfolio', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 50 }), // 0%
        createMockHolding({ id: '2', quantity: 100, avgCost: 50, currentPrice: 50 }), // 0%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.volatility).toBe(0);
    });
  });

  describe('Sharpe Ratio Calculation', () => {
    it('should calculate Sharpe ratio for positive return portfolio', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }), // +10%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      // Return: 10% (0.1)
      // Volatility: 0%
      // Sharpe: (0.1 - 0.03) / 0 = Infinity
      expect(metrics.sharpeRatio).toBe(Infinity);
    });

    it('should calculate Sharpe ratio for portfolio with volatility', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 60 }), // +20%
        createMockHolding({ id: '2', quantity: 100, avgCost: 50, currentPrice: 40 }), // -20%
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      // Return: 0% (0)
      // Volatility: 20% (0.2)
      // Sharpe: (0 - 0.03) / 0.2 = -0.15
      expect(metrics.sharpeRatio).toBeCloseTo(-0.15, 2);
    });

    it('should handle zero volatility with positive return', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.sharpeRatio).toBe(Infinity);
    });

    it('should handle zero volatility with negative return', () => {
      const holdings = [
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 45 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.sharpeRatio).toBe(0);
    });
  });

  describe('Risk Classification', () => {
    it('should classify low risk-adjusted performance', () => {
      const classification = getRiskClassificationDetails('Low');
      expect(classification.label).toBe('Low Risk-Adjusted Performance');
      expect(classification.color).toBe('#EF4444');
      expect(classification.icon).toBe('⚠️');
    });

    it('should classify moderate risk-adjusted performance', () => {
      const classification = getRiskClassificationDetails('Moderate');
      expect(classification.label).toBe('Moderate Risk-Adjusted Performance');
      expect(classification.color).toBe('#F59E0B');
      expect(classification.icon).toBe('📊');
    });

    it('should classify strong risk-adjusted performance', () => {
      const classification = getRiskClassificationDetails('Strong');
      expect(classification.label).toBe('Strong Risk-Adjusted Performance');
      expect(classification.color).toBe('#10B981');
      expect(classification.icon).toBe('✨');
    });
  });

  describe('Metrics Formatting', () => {
    it('should format positive portfolio return', () => {
      const metrics = calculatePortfolioRiskMetrics([
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 55 }),
      ]);
      
      const formatted = formatPortfolioMetrics(metrics);
      expect(formatted.portfolioReturnDisplay).toBe('+10.00%');
      expect(formatted.volatilityDisplay).toBe('0.00%');
      expect(formatted.sharpeRatioDisplay).toBe('Infinity');
    });

    it('should format negative portfolio return', () => {
      const metrics = calculatePortfolioRiskMetrics([
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 45 }),
      ]);
      
      const formatted = formatPortfolioMetrics(metrics);
      expect(formatted.portfolioReturnDisplay).toBe('-10.00%');
    });

    it('should format zero return', () => {
      const metrics = calculatePortfolioRiskMetrics([
        createMockHolding({ quantity: 100, avgCost: 50, currentPrice: 50 }),
      ]);
      
      const formatted = formatPortfolioMetrics(metrics);
      expect(formatted.portfolioReturnDisplay).toBe('+0.00%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small numbers', () => {
      const holdings = [
        createMockHolding({ quantity: 1, avgCost: 0.01, currentPrice: 0.011 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.portfolioReturn).toBeCloseTo(10, 1);
    });

    it('should handle very large numbers', () => {
      const holdings = [
        createMockHolding({ quantity: 1000000, avgCost: 1000, currentPrice: 1100 }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.portfolioReturn).toBeCloseTo(10, 1);
      expect(metrics.totalCostBasis).toBe(1000000000);
    });

    it('should track holding count', () => {
      const holdings = [
        createMockHolding(),
        createMockHolding({ id: '2' }),
        createMockHolding({ id: '3' }),
      ];
      
      const metrics = calculatePortfolioRiskMetrics(holdings);
      expect(metrics.holdingCount).toBe(3);
    });
  });
});
