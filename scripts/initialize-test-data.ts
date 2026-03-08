/**
 * Initialize Test Data Script
 * Run this to populate the app with sample financial data for testing
 */

import { AppData, BankAccount, Loan, Holding, InsurancePolicy, CreditScoreData } from '../lib/types';

export const testBankAccounts: BankAccount[] = [
  {
    id: 'ba1',
    bankName: 'DBS',
    accountType: 'savings',
    accountNumber: '****1234',
    balance: 45000,
    interestRate: 0.5,
    currency: 'SGD',
    isPrimary: true,
    createdAt: '2020-01-15',
  },
  {
    id: 'ba2',
    bankName: 'OCBC',
    accountType: 'daily',
    accountNumber: '****5678',
    balance: 12500,
    interestRate: 0.3,
    currency: 'SGD',
    isPrimary: false,
    createdAt: '2021-06-20',
  },
  {
    id: 'ba3',
    bankName: 'UOB',
    accountType: 'savings',
    accountNumber: '****9012',
    balance: 28000,
    interestRate: 0.4,
    currency: 'SGD',
    isPrimary: false,
    createdAt: '2019-03-10',
  },
];

export const testLoans: Loan[] = [
  {
    id: 'l1',
    bankName: 'DBS',
    loanType: 'hdb_loan',
    securityType: 'secured',
    originalAmount: 350000,
    outstandingBalance: 245000,
    interestRate: 2.6,
    monthlyInstalment: 1650,
    monthsRemaining: 180,
    totalMonths: 360,
    startDate: '2018-03-01',
    currency: 'SGD',
  },
  {
    id: 'l2',
    bankName: 'OCBC',
    loanType: 'personal_loan',
    securityType: 'unsecured_interest_bearing',
    originalAmount: 25000,
    outstandingBalance: 15000,
    interestRate: 5.5,
    monthlyInstalment: 450,
    monthsRemaining: 36,
    totalMonths: 60,
    startDate: '2023-06-01',
    currency: 'SGD',
  },
];

export const testHoldings: Holding[] = [
  {
    id: 'h1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'stocks',
    quantity: 50,
    avgCost: 150,
    currentPrice: 180,
    currency: 'USD',
    purchaseDate: '2020-06-15',
  },
  {
    id: 'h2',
    ticker: 'BTC',
    name: 'Bitcoin',
    assetClass: 'crypto',
    quantity: 0.5,
    avgCost: 35000,
    currentPrice: 42000,
    currency: 'USD',
    purchaseDate: '2021-01-10',
  },
  {
    id: 'h3',
    ticker: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    assetClass: 'etf',
    quantity: 100,
    avgCost: 180,
    currentPrice: 220,
    currency: 'USD',
    purchaseDate: '2019-03-20',
  },
  {
    id: 'h4',
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    assetClass: 'etf',
    quantity: 200,
    avgCost: 80,
    currentPrice: 78,
    currency: 'USD',
    purchaseDate: '2021-06-01',
  },
  {
    id: 'h5',
    ticker: 'ES3',
    name: 'Straits Times Index ETF',
    assetClass: 'etf',
    quantity: 150,
    avgCost: 320,
    currentPrice: 340,
    currency: 'SGD',
    purchaseDate: '2022-01-15',
  },
];

export const testInsurancePolicies: InsurancePolicy[] = [
  {
    id: 'ip1',
    insurer: 'AIA',
    policyNumber: 'AIA-123456',
    policyType: 'life',
    coverageAmount: 500000,
    annualPremium: 1800,
    startDate: '2020-01-01',
    endDate: '2050-01-01',
    currency: 'SGD',
  },
  {
    id: 'ip2',
    insurer: 'Prudential',
    policyNumber: 'PRU-789012',
    policyType: 'health',
    coverageAmount: 1000000,
    annualPremium: 2400,
    startDate: '2021-06-01',
    endDate: '2026-06-01',
    currency: 'SGD',
  },
  {
    id: 'ip3',
    insurer: 'Great Eastern',
    policyNumber: 'GE-345678',
    policyType: 'critical_illness',
    coverageAmount: 250000,
    annualPremium: 1200,
    startDate: '2022-03-15',
    endDate: '2042-03-15',
    currency: 'SGD',
  },
];

export const testCreditScore: CreditScoreData = {
  score: 1825,
  paymentHistory: 95,
  amountsOwed: 85,
  lengthOfCredit: 80,
  creditMix: 90,
  newCredit: 75,
  lastUpdated: new Date().toISOString(),
};

export const testAppData: AppData = {
  bankAccounts: testBankAccounts,
  loans: testLoans,
  holdings: testHoldings,
  insurancePolicies: testInsurancePolicies,
  creditScore: testCreditScore,
};

export default testAppData;
