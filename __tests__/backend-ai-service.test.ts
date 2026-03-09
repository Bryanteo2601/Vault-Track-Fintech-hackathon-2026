import { describe, it, expect } from 'vitest';
import { chatWithAI } from '../server/ai-service';
import { AppData } from '../lib/types';

// Mock portfolio data
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

describe('Backend AI Service (Gemini API)', () => {
  describe('chatWithAI', () => {
    it('should return a non-empty response', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should generate dynamic responses (not template-based)', async () => {
      const response1 = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      const response2 = await chatWithAI('what about my investments', basicPortfolio, []);
      
      // Responses should be different for different questions
      expect(response1).not.toEqual(response2);
    });

    it('should reference portfolio data in response', async () => {
      const response = await chatWithAI('analyze my portfolio', basicPortfolio, []);
      // Should contain specific numbers or SGD reference
      expect(response.toLowerCase()).toMatch(/sgd|portfolio|assets|net worth|holdings|investments/i);
    });

    it('should handle conversation history', async () => {
      const history = [
        { role: 'user', content: 'What is my net worth?' },
        { role: 'model', content: 'Your net worth is approximately SGD -30,000 based on your current holdings.' },
      ];
      const response = await chatWithAI('Should I invest more?', basicPortfolio, history);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should provide conversational responses', async () => {
      const response = await chatWithAI('hello', basicPortfolio, []);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });
  });
});
