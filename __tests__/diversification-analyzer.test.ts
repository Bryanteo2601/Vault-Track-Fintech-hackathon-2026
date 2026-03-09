import { describe, it, expect } from 'vitest';
import {
  calculateHHI,
  calculateDiversificationScore,
  classifyDiversificationLevel,
  getDiversificationLevelDescription,
  generateAdjustmentRecommendations,
  generateDiversificationRecommendations,
  analyzeDiversification,
  calculateConcentrationRisk,
  compareToBenchmark,
} from '../lib/diversification-analyzer';

describe('Diversification Analyzer', () => {
  describe('calculateHHI', () => {
    it('should return 0 for empty portfolio', () => {
      const hhi = calculateHHI({}, 0);
      expect(hhi).toBe(0);
    });

    it('should return 1 for single asset portfolio', () => {
      const assets = { 'Stocks': 100000 };
      const hhi = calculateHHI(assets, 100000);
      expect(hhi).toBeCloseTo(1, 2);
    });

    it('should return 0.5 for two equal assets', () => {
      const assets = { 'Stocks': 50000, 'Bonds': 50000 };
      const hhi = calculateHHI(assets, 100000);
      expect(hhi).toBeCloseTo(0.5, 2);
    });

    it('should return ~0.33 for three equal assets', () => {
      const assets = { 'Stocks': 33333, 'Bonds': 33333, 'ETFs': 33334 };
      const hhi = calculateHHI(assets, 100000);
      expect(hhi).toBeCloseTo(0.333, 2);
    });

    it('should handle concentrated portfolio', () => {
      const assets = { 'Stocks': 80000, 'Bonds': 20000 };
      const hhi = calculateHHI(assets, 100000);
      expect(hhi).toBeCloseTo(0.68, 2); // 0.8^2 + 0.2^2
    });

    it('should handle zero total value', () => {
      const assets = { 'Stocks': 0 };
      const hhi = calculateHHI(assets, 0);
      expect(hhi).toBe(0);
    });
  });

  describe('calculateDiversificationScore', () => {
    it('should return 100 for perfectly diversified (HHI=0)', () => {
      const score = calculateDiversificationScore(0);
      expect(score).toBe(100);
    });

    it('should return 0 for single asset (HHI=1)', () => {
      const score = calculateDiversificationScore(1);
      expect(score).toBe(0);
    });

    it('should return 50 for HHI=0.5', () => {
      const score = calculateDiversificationScore(0.5);
      expect(score).toBeCloseTo(50, 1);
    });

    it('should clamp score to 0-100 range', () => {
      const scoreLow = calculateDiversificationScore(-0.5);
      const scoreHigh = calculateDiversificationScore(1.5);
      expect(scoreLow).toBeGreaterThanOrEqual(0);
      expect(scoreLow).toBeLessThanOrEqual(100);
      expect(scoreHigh).toBeGreaterThanOrEqual(0);
      expect(scoreHigh).toBeLessThanOrEqual(100);
    });
  });

  describe('classifyDiversificationLevel', () => {
    it('should classify HHI < 0.15 as well-diversified', () => {
      const level = classifyDiversificationLevel(0.1);
      expect(level).toBe('well-diversified');
    });

    it('should classify HHI 0.15-0.25 as moderate', () => {
      const level = classifyDiversificationLevel(0.2);
      expect(level).toBe('moderate');
    });

    it('should classify HHI > 0.25 as concentrated', () => {
      const level = classifyDiversificationLevel(0.3);
      expect(level).toBe('concentrated');
    });

    it('should handle boundary case HHI = 0.15', () => {
      const level = classifyDiversificationLevel(0.15);
      expect(level).toBe('moderate');
    });

    it('should handle boundary case HHI = 0.25', () => {
      const level = classifyDiversificationLevel(0.25);
      expect(level).toBe('concentrated');
    });
  });

  describe('getDiversificationLevelDescription', () => {
    it('should return correct description for well-diversified', () => {
      const desc = getDiversificationLevelDescription('well-diversified');
      expect(desc.label).toBe('Well Diversified');
      expect(desc.riskLevel).toBe('Low');
    });

    it('should return correct description for moderate', () => {
      const desc = getDiversificationLevelDescription('moderate');
      expect(desc.label).toBe('Moderately Diversified');
      expect(desc.riskLevel).toBe('Medium');
    });

    it('should return correct description for concentrated', () => {
      const desc = getDiversificationLevelDescription('concentrated');
      expect(desc.label).toBe('Concentrated Portfolio');
      expect(desc.riskLevel).toBe('High');
    });
  });

  describe('generateAdjustmentRecommendations', () => {
    it('should return empty array for well-diversified portfolio', () => {
      const assets = { 'Stocks': 25000, 'Bonds': 25000, 'ETFs': 25000, 'REITs': 25000 };
      const recommendations = generateAdjustmentRecommendations(assets, 100000);
      expect(recommendations).toHaveLength(0);
    });

    it('should recommend reduction for concentrated asset', () => {
      const assets = { 'Stocks': 80000, 'Bonds': 20000 };
      const recommendations = generateAdjustmentRecommendations(assets, 100000);
      const stocksRec = recommendations.find((r) => r.assetClass === 'Stocks');
      expect(stocksRec?.action).toBe('decrease');
    });

    it('should recommend addition of missing asset classes', () => {
      const assets = { 'Stocks': 100000 };
      const recommendations = generateAdjustmentRecommendations(assets, 100000);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.action === 'increase')).toBe(true);
    });

    it('should handle empty portfolio', () => {
      const recommendations = generateAdjustmentRecommendations({}, 0);
      expect(recommendations).toHaveLength(0);
    });
  });

  describe('generateDiversificationRecommendations', () => {
    it('should provide recommendations for concentrated portfolio', () => {
      const recommendations = generateDiversificationRecommendations(0.8, 'concentrated', { 'Stocks': 100000 }, 100000);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toContain('concentrated');
    });

    it('should provide recommendations for moderate portfolio', () => {
      const recommendations = generateDiversificationRecommendations(0.2, 'moderate', { 'Stocks': 60000, 'Bonds': 40000 }, 100000);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should provide positive feedback for well-diversified portfolio', () => {
      const assets = { 'Stocks': 25000, 'Bonds': 25000, 'ETFs': 25000, 'REITs': 25000 };
      const recommendations = generateDiversificationRecommendations(0.1, 'well-diversified', assets, 100000);
      expect(recommendations[0]).toContain('✅');
    });
  });

  describe('analyzeDiversification', () => {
    it('should return complete diversification metrics', () => {
      const assets = { 'Stocks': 50000, 'Bonds': 50000 };
      const metrics = analyzeDiversification(assets, 100000);
      expect(metrics.hhi).toBeCloseTo(0.5, 1);
      expect(metrics.diversificationScore).toBeCloseTo(50, 1);
      expect(metrics.level).toBe('concentrated'); // HHI = 0.5 > 0.25
      expect(metrics.topHoldings).toHaveLength(2);
      expect(metrics.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty portfolio', () => {
      const metrics = analyzeDiversification({}, 0);
      expect(metrics.hhi).toBe(0);
      expect(metrics.diversificationScore).toBe(100);
      expect(metrics.topHoldings).toHaveLength(0);
    });

    it('should rank top holdings correctly', () => {
      const assets = { 'Stocks': 40000, 'Bonds': 30000, 'ETFs': 20000, 'REITs': 10000 };
      const metrics = analyzeDiversification(assets, 100000);
      expect(metrics.topHoldings[0].assetClass).toBe('Stocks');
      expect(metrics.topHoldings[1].assetClass).toBe('Bonds');
    });
  });

  describe('calculateConcentrationRisk', () => {
    it('should calculate concentration in top 3 holdings', () => {
      const assets = { 'Stocks': 40000, 'Bonds': 30000, 'ETFs': 20000, 'REITs': 10000 };
      const risk = calculateConcentrationRisk(assets, 100000, 3);
      expect(risk.topNPercentage).toBeCloseTo(90, 1);
      expect(risk.topNCount).toBe(3);
    });

    it('should classify high concentration risk', () => {
      const assets = { 'Stocks': 75000, 'Bonds': 25000 };
      const risk = calculateConcentrationRisk(assets, 100000, 1);
      expect(risk.riskLevel).toBe('high');
    });

    it('should classify medium concentration risk', () => {
      const assets = { 'Stocks': 55000, 'Bonds': 45000 };
      const risk = calculateConcentrationRisk(assets, 100000, 1);
      expect(risk.riskLevel).toBe('medium');
    });

    it('should classify low concentration risk', () => {
      const assets = { 'Stocks': 40000, 'Bonds': 30000, 'ETFs': 30000 };
      const risk = calculateConcentrationRisk(assets, 100000, 1);
      expect(risk.riskLevel).toBe('low');
    });

    it('should handle empty portfolio', () => {
      const risk = calculateConcentrationRisk({}, 0, 3);
      expect(risk.topNPercentage).toBe(0);
      expect(risk.riskLevel).toBe('none');
    });
  });

  describe('compareToBenchmark', () => {
    it('should identify portfolio better than benchmark', () => {
      const comparison = compareToBenchmark(0.1, 0.15);
      expect(comparison.betterThanBenchmark).toBe(true);
      expect(comparison.difference).toBeCloseTo(0.05, 2);
    });

    it('should identify portfolio worse than benchmark', () => {
      const comparison = compareToBenchmark(0.3, 0.15);
      expect(comparison.betterThanBenchmark).toBe(false);
      expect(comparison.difference).toBeCloseTo(-0.15, 2);
    });

    it('should calculate percentage difference correctly', () => {
      const comparison = compareToBenchmark(0.12, 0.15);
      expect(comparison.percentageDifference).toBeCloseTo(20, 1);
    });

    it('should handle equal HHI', () => {
      const comparison = compareToBenchmark(0.15, 0.15);
      expect(comparison.betterThanBenchmark).toBe(false);
      expect(comparison.difference).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should analyze concentrated portfolio correctly', () => {
      const assets = { 'Stocks': 90000, 'Bonds': 10000 };
      const metrics = analyzeDiversification(assets, 100000);
      expect(metrics.level).toBe('concentrated');
      expect(metrics.diversificationScore).toBeLessThan(20);
      expect(metrics.recommendations.length).toBeGreaterThan(0);
    });

    it('should analyze well-diversified portfolio correctly', () => {
      // Create portfolio with HHI < 0.15 by having 7+ equal assets
      const assets = {
        'Stocks': 15000,
        'Bonds': 15000,
        'ETFs': 15000,
        'REITs': 15000,
        'Crypto': 15000,
        'Commodities': 15000,
        'Options': 10000,
      };
      const metrics = analyzeDiversification(assets, 100000);
      expect(metrics.level).toBe('well-diversified');
      expect(metrics.diversificationScore).toBeGreaterThan(75);
    });

    it('should analyze real-world portfolio', () => {
      const assets = {
        'Stocks': 45000,
        'Bonds': 25000,
        'ETFs': 15000,
        'Crypto': 10000,
        'REITs': 5000,
      };
      const metrics = analyzeDiversification(assets, 100000);
      expect(metrics.hhi).toBeGreaterThan(0);
      expect(metrics.hhi).toBeLessThan(1);
      expect(metrics.diversificationScore).toBeGreaterThan(0);
      expect(metrics.diversificationScore).toBeLessThan(100);
    });
  });
});
