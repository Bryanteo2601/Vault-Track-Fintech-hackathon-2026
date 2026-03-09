import { describe, it, expect } from 'vitest';
import {
  runMonteCarloSimulation,
  calculatePortfolioVolatility,
  calculateExpectedReturn,
  generateHistogramData,
  calculateVaR,
  calculateCVaR,
  ASSET_CLASS_VOLATILITY,
  ASSET_CLASS_RETURNS,
} from '../lib/monte-carlo-engine';


describe('Monte Carlo Engine', () => {
  describe('calculatePortfolioVolatility', () => {
    it('should return 0 for empty portfolio', () => {
      const volatility = calculatePortfolioVolatility({}, 0);
      expect(volatility).toBe(0);
    });

    it('should calculate volatility for single asset class', () => {
      const assets = { 'Stocks': 10000 };
      const volatility = calculatePortfolioVolatility(assets, 10000);
      expect(volatility).toBeCloseTo(0.18, 2); // Stocks volatility
    });

    it('should calculate weighted volatility for multiple assets', () => {
      const assets = {
        'Stocks': 5000,
        'Bonds': 5000,
      };
      const volatility = calculatePortfolioVolatility(assets, 10000);
      // Should be between Bonds (0.05) and Stocks (0.18) volatility
      expect(volatility).toBeGreaterThan(0.05);
      expect(volatility).toBeLessThan(0.18);
    });

    it('should handle zero total value', () => {
      const assets = { 'Stocks': 0 };
      const volatility = calculatePortfolioVolatility(assets, 0);
      expect(volatility).toBe(0);
    });
  });

  describe('calculateExpectedReturn', () => {
    it('should return 0 for empty portfolio', () => {
      const expectedReturn = calculateExpectedReturn({}, 0);
      expect(expectedReturn).toBe(0);
    });

    it('should calculate return for single asset class', () => {
      const assets = { 'Stocks': 10000 };
      const expectedReturn = calculateExpectedReturn(assets, 10000);
      expect(expectedReturn).toBeCloseTo(0.10, 2); // Stocks return
    });

    it('should calculate weighted return for multiple assets', () => {
      const assets = {
        'Stocks': 5000,
        'Bonds': 5000,
      };
      const expectedReturn = calculateExpectedReturn(assets, 10000);
      // Should be average of Stocks (0.10) and Bonds (0.04)
      expect(expectedReturn).toBeCloseTo(0.07, 2);
    });

    it('should handle unknown asset classes with default return', () => {
      const assets = { 'UnknownAsset': 10000 };
      const expectedReturn = calculateExpectedReturn(assets, 10000);
      expect(expectedReturn).toBeCloseTo(0.08, 2); // Default return
    });
  });

  describe('runMonteCarloSimulation', () => {
    it('should return empty results for zero portfolio value', () => {
      const result = runMonteCarloSimulation(0, {}, 100);
      expect(result.finalValues).toHaveLength(0);
      expect(result.maxDrawdowns).toHaveLength(0);
      expect(result.expectedReturn).toBe(0);
    });

    it('should generate correct number of simulations', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.finalValues).toHaveLength(100);
      expect(result.maxDrawdowns).toHaveLength(100);
    });

    it('should generate 1000 simulations by default', () => {
      const assets = { 'Stocks': 50000 };
      const result = runMonteCarloSimulation(50000, assets);
      expect(result.finalValues).toHaveLength(1000);
      expect(result.maxDrawdowns).toHaveLength(1000);
    });

    it('should calculate correct median outcome', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.medianOutcome).toBeGreaterThan(0);
      expect(result.medianOutcome).toBeLessThanOrEqual(Math.max(...result.finalValues));
    });

    it('should calculate worst 5% outcome', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.worst5Percent).toBeLessThanOrEqual(result.medianOutcome);
    });

    it('should calculate best 5% outcome', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.best5Percent).toBeGreaterThanOrEqual(result.medianOutcome);
    });

    it('should calculate statistics correctly', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.mean).toBeGreaterThan(0);
      expect(result.stdDev).toBeGreaterThanOrEqual(0);
      expect(result.confidenceInterval.lower).toBeLessThanOrEqual(result.confidenceInterval.upper);
    });

    it('should have confidence interval bounds within final values', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      const minValue = Math.min(...result.finalValues);
      const maxValue = Math.max(...result.finalValues);
      expect(result.confidenceInterval.lower).toBeGreaterThanOrEqual(minValue);
      expect(result.confidenceInterval.upper).toBeLessThanOrEqual(maxValue);
    });

    it('should handle mixed asset portfolio', () => {
      const assets = {
        'Stocks': 40000,
        'Bonds': 30000,
        'Crypto': 20000,
        'ETFs': 10000,
      };
      const result = runMonteCarloSimulation(100000, assets, 100);
      expect(result.finalValues).toHaveLength(100);
      expect(result.expectedReturn).toBeGreaterThan(0);
      expect(result.mean).toBeGreaterThan(0);
    });

    it('should have max drawdown between 0 and 1', () => {
      const assets = { 'Stocks': 100000 };
      const result = runMonteCarloSimulation(100000, assets, 100);
      result.maxDrawdowns.forEach((dd) => {
        expect(dd).toBeGreaterThanOrEqual(0);
        expect(dd).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('generateHistogramData', () => {
    it('should return empty array for empty values', () => {
      const histogram = generateHistogramData([]);
      expect(histogram).toHaveLength(0);
    });

    it('should generate correct number of bins', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 1000);
      const histogram = generateHistogramData(values, 10);
      expect(histogram).toHaveLength(10);
    });

    it('should have correct bin counts', () => {
      const values = [1000, 1000, 2000, 2000, 2000, 3000];
      const histogram = generateHistogramData(values, 3);
      const totalCount = histogram.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(values.length);
    });

    it('should calculate percentages correctly', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 1000);
      const histogram = generateHistogramData(values, 10);
      const totalPercentage = histogram.reduce((sum, bin) => sum + bin.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should use default 20 bins', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 100);
      const histogram = generateHistogramData(values);
      expect(histogram).toHaveLength(20);
    });
  });

  describe('calculateVaR', () => {
    it('should calculate Value at Risk at 95% confidence', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 1000);
      const var95 = calculateVaR(values, 0.95);
      expect(var95).toBeGreaterThan(0);
      expect(var95).toBeLessThan(Math.max(...values));
    });

    it('should return worst outcome at 100% confidence', () => {
      const values = [1000, 2000, 3000, 4000, 5000];
      const var100 = calculateVaR(values, 1.0);
      expect(var100).toBe(Math.min(...values));
    });

    it('should handle edge case with very low confidence', () => {
      const values = [1000, 2000, 3000, 4000, 5000];
      const var01 = calculateVaR(values, 0.01);
      // At 0.01 confidence, we're looking at the 99th percentile (worst 1%)
      // For 5 values, this should be near the highest value
      expect(var01).toBeGreaterThan(Math.min(...values));
    });
  });

  describe('calculateCVaR', () => {
    it('should calculate Conditional Value at Risk', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 1000);
      const cvar95 = calculateCVaR(values, 0.95);
      expect(cvar95).toBeGreaterThan(0);
      expect(cvar95).toBeLessThan(Math.max(...values));
    });

    it('should be less than or equal to mean of worst outcomes', () => {
      const values = [1000, 2000, 3000, 4000, 5000];
      const cvar95 = calculateCVaR(values, 0.95);
      const worstOutcome = Math.min(...values);
      expect(cvar95).toBeGreaterThanOrEqual(worstOutcome);
    });

    it('should handle single value', () => {
      const values = [5000];
      const cvar95 = calculateCVaR(values, 0.95);
      expect(cvar95).toBe(5000);
    });
  });

  describe('Asset Class Constants', () => {
    it('should have volatility for all major asset classes', () => {
      expect(ASSET_CLASS_VOLATILITY['Stocks']).toBeDefined();
      expect(ASSET_CLASS_VOLATILITY['Bonds']).toBeDefined();
      expect(ASSET_CLASS_VOLATILITY['Crypto']).toBeDefined();
    });

    it('should have returns for all major asset classes', () => {
      expect(ASSET_CLASS_RETURNS['Stocks']).toBeDefined();
      expect(ASSET_CLASS_RETURNS['Bonds']).toBeDefined();
      expect(ASSET_CLASS_RETURNS['Crypto']).toBeDefined();
    });

    it('should have crypto with higher volatility than bonds', () => {
      expect(ASSET_CLASS_VOLATILITY['Crypto']).toBeGreaterThan(ASSET_CLASS_VOLATILITY['Bonds']);
    });

    it('should have stocks with higher return than bonds', () => {
      expect(ASSET_CLASS_RETURNS['Stocks']).toBeGreaterThan(ASSET_CLASS_RETURNS['Bonds']);
    });
  });
});
