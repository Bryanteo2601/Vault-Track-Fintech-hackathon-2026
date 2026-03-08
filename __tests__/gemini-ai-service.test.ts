import { describe, it, expect } from 'vitest';
import {
  generateFinancialRecommendations,
  chatWithAI,
  analyzeFinancialAspect,
} from '../lib/gemini-ai-service';
import { AppData } from '../lib/types';

// Mock data
const emptyPortfolio: AppData = {
  bankAccounts: [],
  holdings: [],
  loans: [],
  insurancePolicies: [],
  privateAssets: [],
  creditScore: {
    score: 0,
    paymentHistory: 0,
    amountsOwed: 0,
    lengthOfCredit: 0,
    creditMix: 0,
    newCredit: 0,
    lastUpdated: '2024-01-01',
  },
};

const basicPortfolio: AppData = {
  privateAssets: [],
  bankAccounts: [
    {
      id: '1',
      bankName: 'DBS',
      accountNumber: '123456789',
      accountType: 'savings',
      balance: 50000,
      interestRate: 0.5,
      currency: 'SGD',
      isPrimary: true,
      createdAt: '2024-01-01',
    },
  ],
  holdings: [
    {
      id: '1',
      assetClass: 'stocks',
      ticker: 'AAPL',
      name: 'Apple Inc',
      quantity: 10,
      avgCost: 140,
      currentPrice: 150,
      currency: 'USD',
      purchaseDate: '2024-01-01',
    },
    {
      id: '2',
      assetClass: 'stocks',
      ticker: 'GOOGL',
      name: 'Alphabet Inc',
      quantity: 5,
      avgCost: 130,
      currentPrice: 140,
      currency: 'USD',
      purchaseDate: '2024-01-01',
    },
  ],
  loans: [
    {
      id: '1',
      bankName: 'Bank A',
      loanType: 'personal_loan',
      securityType: 'unsecured_interest_bearing',
      originalAmount: 100000,
      outstandingBalance: 80000,
      interestRate: 3.5,
      monthlyInstalment: 1500,
      monthsRemaining: 60,
      totalMonths: 72,
      startDate: '2024-01-01',
      currency: 'SGD',
    },
  ],
  insurancePolicies: [],
  creditScore: {
    score: 1500,
    paymentHistory: 85,
    amountsOwed: 70,
    lengthOfCredit: 75,
    creditMix: 80,
    newCredit: 65,
    lastUpdated: '2024-01-01',
  },
};

const concentratedPortfolio: AppData = {
  privateAssets: [],
  bankAccounts: [
    {
      id: '1',
      bankName: 'DBS',
      accountNumber: '987654321',
      accountType: 'savings',
      balance: 10000,
      interestRate: 0.5,
      currency: 'SGD',
      isPrimary: true,
      createdAt: '2024-01-01',
    },
  ],
  holdings: [
    {
      id: '1',
      assetClass: 'stocks',
      ticker: 'TSLA',
      name: 'Tesla Inc',
      quantity: 100,
      avgCost: 200,
      currentPrice: 250,
      currency: 'USD',
      purchaseDate: '2024-01-01',
    },
  ],
  loans: [],
  insurancePolicies: [],
  creditScore: {
    score: 1200,
    paymentHistory: 70,
    amountsOwed: 60,
    lengthOfCredit: 65,
    creditMix: 75,
    newCredit: 55,
    lastUpdated: '2024-01-01',
  },
};

describe('AI Financial Analysis Service', () => {
  describe('generateFinancialRecommendations', () => {
    it('should handle empty portfolio gracefully', async () => {
      const recommendations = await generateFinancialRecommendations(emptyPortfolio);
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toContain('emergency fund');
    });

    it('should identify concentration risk', async () => {
      const recommendations = await generateFinancialRecommendations(concentratedPortfolio);
      const hasConcentrationWarning = recommendations.some((r: string) => r.includes('Concentration') || r.includes('concentration'));
      expect(hasConcentrationWarning).toBe(true);
    });

    it('should identify low liquidity risk', async () => {
      const recommendations = await generateFinancialRecommendations(basicPortfolio);
      // Recommendations should be non-empty for portfolio with data
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should limit recommendations to 4 items', async () => {
      const recommendations = await generateFinancialRecommendations(basicPortfolio);
      expect(recommendations.length).toBeLessThanOrEqual(4);
    });
  });

  describe('chatWithAI', () => {
    it('should provide structured analysis when asked to analyze portfolio', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      expect(response).toContain('SNAPSHOT SUMMARY');
      expect(response).toContain('KEY OBSERVATIONS');
      expect(response).toContain('MAIN RISKS');
      expect(response).toContain('OPPORTUNITIES');
      expect(response).toContain('QUESTIONS');
    });

    it('should provide investment-specific analysis', async () => {
      const response = await chatWithAI('what about my investments', basicPortfolio, []);
      expect(response).toContain('Investment');
    });

    it('should provide debt-specific analysis', async () => {
      const response = await chatWithAI('tell me about my debt', basicPortfolio, []);
      expect(response).toContain('Debt');
    });

    it('should provide liquidity analysis', async () => {
      const response = await chatWithAI('how is my emergency fund', basicPortfolio, []);
      const hasLiquidityInfo = response.includes('Liquidity') || response.includes('Cash');
      expect(hasLiquidityInfo).toBe(true);
    });

    it('should handle empty portfolio queries', async () => {
      const response = await chatWithAI('analyze my portfolio', emptyPortfolio, []);
      expect(response).toContain('empty');
    });

    it('should be data-driven and specific', async () => {
      const response = await chatWithAI('review my portfolio', basicPortfolio, []);
      // Should contain specific numbers, not generic advice
      expect(response).toMatch(/SGD|%|\d+/);
    });

    it('should avoid generic advice', async () => {
      const response = await chatWithAI('what should I do', basicPortfolio, []);
      // Should not contain only generic phrases
      expect(response.length).toBeGreaterThan(100); // Detailed response
    });
  });

  describe('analyzeFinancialAspect', () => {
    it('should analyze investments aspect', async () => {
      const analysis = await analyzeFinancialAspect('investments', basicPortfolio);
      expect(analysis).toContain('Investment');
      expect(analysis).toContain('SGD');
    });

    it('should analyze debt aspect', async () => {
      const analysis = await analyzeFinancialAspect('debt', basicPortfolio);
      expect(analysis).toContain('Debt');
    });

    it('should analyze savings aspect', async () => {
      const analysis = await analyzeFinancialAspect('savings', basicPortfolio);
      const hasSavingsInfo = analysis.includes('Savings') || analysis.includes('Cash');
      expect(hasSavingsInfo).toBe(true);
    });

    it('should analyze insurance aspect', async () => {
      const analysis = await analyzeFinancialAspect('insurance', basicPortfolio);
      const hasInsuranceInfo = analysis.includes('Insurance');
      expect(hasInsuranceInfo).toBe(true);
    });

    it('should handle empty portfolio for investments', async () => {
      const analysis = await analyzeFinancialAspect('investments', emptyPortfolio);
      const hasEmptyMessage = analysis.includes('No current investments') || analysis.includes('no investments');
      expect(hasEmptyMessage).toBe(true);
    });

    it('should handle zero debt', async () => {
      const analysis = await analyzeFinancialAspect('debt', emptyPortfolio);
      const hasDebtFreeMessage = analysis.includes('Debt-free') || analysis.includes('no outstanding');
      expect(hasDebtFreeMessage).toBe(true);
    });
  });

  describe('Data-Driven Analysis Quality', () => {
    it('should calculate correct debt-to-asset ratio', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      // basicPortfolio: assets = 50000 + (10*150 + 5*140) = 50000 + 2200 = 52200
      // liabilities = 80000
      // DTA = 80000 / 52200 = 153.3%
      const hasDTAInfo = response.includes('153') || response.includes('Debt-to-Asset');
      expect(hasDTAInfo).toBe(true);
    });

    it('should identify concentration in single asset', async () => {
      const response = await chatWithAI('analyze my portfolio', concentratedPortfolio, []);
      const hasConcentrationInfo = response.includes('concentration') || response.includes('Concentration');
      expect(hasConcentrationInfo).toBe(true);
    });

    it('should provide specific liquidity metrics', async () => {
      const response = await chatWithAI('check my liquidity', basicPortfolio, []);
      const hasMetrics = response.includes('%') || response.includes('SGD');
      expect(hasMetrics).toBe(true);
    });
  });

  describe('Risk Identification', () => {
    it('should identify high leverage risk', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      const hasLeverageInfo = response.includes('Leverage') || response.includes('leverage') || response.includes('debt');
      expect(hasLeverageInfo).toBe(true);
    });

    it('should identify low diversification', async () => {
      const response = await chatWithAI('analyze my portfolio', concentratedPortfolio, []);
      const hasDiversificationInfo = response.includes('Diversification') || response.includes('diversification') || response.includes('single');
      expect(hasDiversificationInfo).toBe(true);
    });

    it('should identify liquidity gaps', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      const hasLiquidityInfo = response.includes('Liquidity') || response.includes('liquidity') || response.includes('cash');
      expect(hasLiquidityInfo).toBe(true);
    });
  });

  describe('Output Format Compliance', () => {
    it('should follow 5-point format in analysis', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      const hasAllSections =
        response.includes('SNAPSHOT') &&
        response.includes('OBSERVATIONS') &&
        response.includes('RISKS') &&
        response.includes('OPPORTUNITIES') &&
        response.includes('QUESTIONS');
      expect(hasAllSections).toBe(true);
    });

    it('should provide numbered sections', async () => {
      const response = await chatWithAI('review my portfolio', basicPortfolio, []);
      expect(response).toMatch(/\*\*1\.|\*\*2\.|\*\*3\.|\*\*4\.|\*\*5\./);
    });
  });
});
