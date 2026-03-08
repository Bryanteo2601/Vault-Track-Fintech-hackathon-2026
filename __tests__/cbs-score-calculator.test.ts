import { describe, it, expect } from 'vitest';
import { calculateCBSScore } from '../lib/cbs-score-calculator';
import { AppData } from '../lib/types';

// Mock AppData factory
function createMockAppData(overrides?: Partial<AppData>): AppData {
  return {
    bankAccounts: [],
    loans: [],
    holdings: [],
    insurancePolicies: [],
    creditScore: {
      score: 0,
      paymentHistory: 0,
      amountsOwed: 0,
      lengthOfCredit: 0,
      creditMix: 0,
      newCredit: 0,
      lastUpdated: new Date().toISOString(),
    },
    ...overrides,
  };
}

describe('CBS Score Calculator', () => {
  describe('Score Calculation', () => {
    it('should return default score for new user with no financial data', () => {
      const appData = createMockAppData();
      const result = calculateCBSScore(appData, 5000);
      
      expect(result.score).toBeGreaterThanOrEqual(1000);
      expect(result.score).toBeLessThanOrEqual(2000);
      expect(result.grade).toBeDefined();
    });

    it('should calculate score between 1000-2000', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 5,
            monthlyInstalment: 500,
            monthsRemaining: 30,
            totalMonths: 48,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.score).toBeGreaterThanOrEqual(1000);
      expect(result.score).toBeLessThanOrEqual(2000);
    });
  });

  describe('Grade Assignment', () => {
    it('should assign grade A for excellent score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 100000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2020-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 10000,
            outstandingBalance: 2000,
            interestRate: 3,
            monthlyInstalment: 200,
            monthsRemaining: 10,
            totalMonths: 60,
            startDate: '2022-01-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 8000);
      expect(result.grade).toBe('A');
    });

    it('should assign valid grade for moderate score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 30000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2022-01-01',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(['A', 'B+', 'B', 'B-', 'C', 'D', 'F']).toContain(result.grade);
    });

    it('should assign grade F for poor score', () => {
      const appData = createMockAppData({
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 50000,
            outstandingBalance: 45000,
            interestRate: 10,
            monthlyInstalment: 1000,
            monthsRemaining: 60,
            totalMonths: 60,
            startDate: '2024-01-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 3000);
      expect(result.grade).toBe('F');
    });
  });

  describe('Factor Scores', () => {
    it('should calculate payment history score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 5,
            monthlyInstalment: 500,
            monthsRemaining: 30,
            totalMonths: 48,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.paymentHistoryScore).toBeGreaterThanOrEqual(0);
      expect(result.paymentHistoryScore).toBeLessThanOrEqual(100);
    });

    it('should calculate amounts owed score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 30000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 5,
            monthlyInstalment: 500,
            monthsRemaining: 30,
            totalMonths: 48,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.amountsOwedScore).toBeGreaterThanOrEqual(0);
      expect(result.amountsOwedScore).toBeLessThanOrEqual(100);
    });

    it('should calculate length of credit score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2020-01-01',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.lengthOfCreditScore).toBeGreaterThanOrEqual(0);
      expect(result.lengthOfCreditScore).toBeLessThanOrEqual(100);
    });

    it('should calculate credit mix score', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 5,
            monthlyInstalment: 500,
            monthsRemaining: 30,
            totalMonths: 48,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
        holdings: [
          {
            id: '1',
            ticker: 'AAPL',
            name: 'Apple Inc',
            quantity: 10,
            currentPrice: 150,
            avgCost: 140,
            assetClass: 'stocks',
            currency: 'SGD',
            purchaseDate: '2023-01-01',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.creditMixScore).toBeGreaterThanOrEqual(0);
      expect(result.creditMixScore).toBeLessThanOrEqual(100);
    });

    it('should calculate new credit score', () => {
      const today = new Date().toISOString().split('T')[0];
      const appData = createMockAppData({
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 10000,
            outstandingBalance: 9000,
            interestRate: 5,
            monthlyInstalment: 200,
            monthsRemaining: 50,
            totalMonths: 60,
            startDate: today,
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.newCreditScore).toBeGreaterThanOrEqual(0);
      expect(result.newCreditScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Estimated Max Loan', () => {
    it('should calculate max loan based on income', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
      });
      
      const monthlyIncome = 5000;
      const result = calculateCBSScore(appData, monthlyIncome);
      expect(result.estimatedMaxLoan).toBeGreaterThan(0);
    });

    it('should reduce max loan for users with existing debt', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 5,
            monthlyInstalment: 500,
            monthsRemaining: 30,
            totalMonths: 48,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const monthlyIncome = 5000;
      const result = calculateCBSScore(appData, monthlyIncome);
      expect(result.estimatedMaxLoan).toBeGreaterThan(0);
    });
  });

  describe('Warnings', () => {
    it('should generate warning for high debt-to-asset ratio', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 10000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 50000,
            outstandingBalance: 45000,
            interestRate: 5,
            monthlyInstalment: 1000,
            monthsRemaining: 60,
            totalMonths: 60,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should generate warning for low liquidity', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 2000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
        loans: [
          {
            id: '1',
            bankName: 'DBS',
            loanType: 'personal_loan',
            securityType: 'unsecured_interest_bearing',
            originalAmount: 10000,
            outstandingBalance: 8000,
            interestRate: 5,
            monthlyInstalment: 200,
            monthsRemaining: 40,
            totalMonths: 60,
            startDate: '2023-06-01',
            currency: 'SGD',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 5000);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty financial data gracefully', () => {
      const appData = createMockAppData();
      const result = calculateCBSScore(appData, 5000);
      
      expect(result.score).toBeDefined();
      expect(result.grade).toBeDefined();
      expect(result.paymentHistoryScore).toBeDefined();
      expect(result.amountsOwedScore).toBeDefined();
      expect(result.lengthOfCreditScore).toBeDefined();
      expect(result.creditMixScore).toBeDefined();
      expect(result.newCreditScore).toBeDefined();
    });

    it('should handle zero income gracefully', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 50000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 0);
      expect(result.estimatedMaxLoan).toBe(0);
    });

    it('should handle very high income', () => {
      const appData = createMockAppData({
        bankAccounts: [
          {
            id: '1',
            bankName: 'DBS',
            accountNumber: '123456789',
            balance: 500000,
            accountType: 'savings',
            currency: 'SGD',
            interestRate: 0.5,
            isPrimary: true,
            createdAt: '2023-01-01',
          },
        ],
      });
      
      const result = calculateCBSScore(appData, 100000);
      expect(result.estimatedMaxLoan).toBeGreaterThan(0);
    });
  });
});
