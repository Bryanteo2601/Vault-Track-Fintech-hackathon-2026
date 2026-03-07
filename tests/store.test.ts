import { describe, it, expect } from 'vitest';
import {
  calcTotalAssets,
  calcTotalLiabilities,
  calcNetWorth,
  calcWellnessScore,
  calcCBSScore,
  calcPortfolioByAssetClass,
  formatCurrency,
} from '../lib/store';
import { AppData } from '../lib/types';

const mockData: AppData = {
  bankAccounts: [
    { id: 'ba1', bankName: 'DBS', accountNumber: '****1234', accountType: 'savings', balance: 50000, interestRate: 3.5, currency: 'SGD', isPrimary: true, createdAt: '2022-01-01' },
    { id: 'ba2', bankName: 'OCBC', accountNumber: '****5678', accountType: 'credit', balance: -2000, interestRate: 26.9, currency: 'SGD', isPrimary: false, createdAt: '2022-01-01' },
  ],
  loans: [
    { id: 'l1', bankName: 'Bank A', loanType: 'hdb_loan', securityType: 'secured', originalAmount: 300000, outstandingBalance: 150000, interestRate: 2.6, monthlyInstalment: 1400, monthsRemaining: 120, totalMonths: 240, startDate: '2015-01-01', currency: 'SGD' },
  ],
  holdings: [
    { id: 'h1', assetClass: 'stocks', ticker: 'AAPL', name: 'Apple', quantity: 10, avgCost: 150, currentPrice: 180, currency: 'USD', purchaseDate: '2023-01-01' },
    { id: 'h2', assetClass: 'crypto', ticker: 'BTC', name: 'Bitcoin', quantity: 0.1, avgCost: 30000, currentPrice: 60000, currency: 'USD', purchaseDate: '2023-01-01' },
  ],
  insurancePolicies: [
    { id: 'ip1', insurer: 'Prudential', policyNumber: 'PRU-001', policyType: 'life', coverageAmount: 500000, annualPremium: 3600, startDate: '2021-01-01', endDate: '2051-01-01', currency: 'SGD' },
  ],
  creditScore: { score: 1850, paymentHistory: 90, amountsOwed: 60, lengthOfCredit: 75, creditMix: 80, newCredit: 70, lastUpdated: '2025-05-01' },
};

describe('Financial Calculations', () => {
  it('calcTotalAssets includes positive bank balances and investments', () => {
    const assets = calcTotalAssets(mockData);
    // bank: 50000 (positive only)
    // investments: 10*180 + 0.1*60000 = 1800 + 6000 = 7800
    expect(assets).toBeCloseTo(50000 + 7800, 0);
  });

  it('calcTotalLiabilities sums credit card debt and loan balances', () => {
    const liabilities = calcTotalLiabilities(mockData);
    // credit card: 2000, loans: 150000
    expect(liabilities).toBe(152000);
  });

  it('calcNetWorth = assets - liabilities', () => {
    const netWorth = calcNetWorth(mockData);
    const assets = calcTotalAssets(mockData);
    const liabilities = calcTotalLiabilities(mockData);
    expect(netWorth).toBeCloseTo(assets - liabilities, 0);
  });

  it('calcWellnessScore returns a value between 0 and 100', () => {
    const score = calcWellnessScore(mockData);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('calcCBSScore returns B+ for score 1850', () => {
    const result = calcCBSScore(mockData.creditScore);
    expect(result).toBe('B+');
  });

  it('calcCBSScore returns A for score >= 1900', () => {
    const highScoreCreditData = { ...mockData.creditScore, score: 1950 };
    const result = calcCBSScore(highScoreCreditData);
    expect(result).toBe('A');
  });

  it('calcPortfolioByAssetClass groups holdings correctly', () => {
    const portfolio = calcPortfolioByAssetClass(mockData.holdings);
    expect(portfolio.stocks).toBeCloseTo(10 * 180, 0);
    expect(portfolio.crypto).toBeCloseTo(0.1 * 60000, 0);
  });

  it('formatCurrency formats large numbers correctly', () => {
    expect(formatCurrency(1500000)).toContain('1.5');
  });

  it('formatCurrency formats thousands correctly', () => {
    expect(formatCurrency(45000)).toContain('45');
  });
});
