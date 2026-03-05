import { describe, it, expect } from 'vitest';
import {
  calcTotalAssets,
  calcTotalLiabilities,
  calcNetWorth,
  calcWellnessScore,
  calcCBSScore,
  calcMaxLoan,
  calcPortfolioByAssetClass,
  calcTotalInterestPayable,
  calcTotalPaid,
  formatCurrency,
  formatPercent,
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
  it('calcTotalAssets includes positive bank balances, investments, and insurance value', () => {
    const assets = calcTotalAssets(mockData);
    // bank: 50000 (positive only)
    // investments: 10*180 + 0.1*60000 = 1800 + 6000 = 7800
    // insurance: 500000 * 0.05 = 25000
    expect(assets).toBeCloseTo(50000 + 7800 + 25000, 0);
  });

  it('calcTotalLiabilities sums all outstanding loan balances', () => {
    const liabilities = calcTotalLiabilities(mockData);
    expect(liabilities).toBe(150000);
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

  it('calcCBSScore returns correct grade for score 1850 (BB: 1844-1910)', () => {
    const result = calcCBSScore(mockData);
    expect(result.score).toBe(1850);
    expect(result.grade).toBe('BB');
  });

  it('calcCBSScore returns AA for score >= 1911', () => {
    const highScoreData = { ...mockData, creditScore: { ...mockData.creditScore, score: 1950 } };
    const result = calcCBSScore(highScoreData);
    expect(result.grade).toBe('AA');
  });

  it('calcMaxLoan returns a positive number', () => {
    const maxLoan = calcMaxLoan(mockData);
    expect(maxLoan).toBeGreaterThan(0);
  });

  it('calcPortfolioByAssetClass groups holdings correctly', () => {
    const portfolio = calcPortfolioByAssetClass(mockData.holdings);
    expect(portfolio.stocks).toBeCloseTo(10 * 180, 0);
    expect(portfolio.crypto).toBeCloseTo(0.1 * 60000, 0);
  });

  it('calcTotalInterestPayable computes remaining interest', () => {
    const loan = mockData.loans[0];
    const interest = calcTotalInterestPayable(loan);
    // 1400 * 120 - 150000 = 168000 - 150000 = 18000
    expect(interest).toBe(18000);
  });

  it('calcTotalPaid computes amount already paid', () => {
    const loan = mockData.loans[0];
    const paid = calcTotalPaid(loan);
    // (240 - 120) * 1400 = 120 * 1400 = 168000
    expect(paid).toBe(168000);
  });

  it('formatCurrency formats large numbers with M suffix', () => {
    expect(formatCurrency(1500000)).toBe('SGD 1.50M');
  });

  it('formatCurrency formats thousands with commas', () => {
    expect(formatCurrency(45000)).toBe('SGD 45,000');
  });

  it('formatPercent formats positive and negative percentages', () => {
    expect(formatPercent(5.25)).toBe('+5.25%');
    expect(formatPercent(-3.5)).toBe('-3.50%');
  });
});
