import {
  AppData,
  BankAccount,
  Loan,
  Holding,
  InsurancePolicy,
  CreditScoreData,
  AggregatedBalance,
} from './types';
import { db, auth } from './firebase-config';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wwh_app_data';

// ─── Get Current User ─────────────────────────────────────────────────────────
function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User not authenticated');
  }
  return uid;
}

// ─── Firestore Paths ──────────────────────────────────────────────────────────
function getUserDataPath(userId: string): string {
  return `users/${userId}/appData`;
}

// ─── Default Sample Data ──────────────────────────────────────────────────────
const defaultBankAccounts: BankAccount[] = [];

const defaultLoans: Loan[] = []; // Empty for new users

const defaultLoansOld: Loan[] = [
  {
    id: 'l1',
    bankName: 'Bank A',
    loanType: 'hdb_loan',
    securityType: 'secured',
    originalAmount: 300000,
    outstandingBalance: 157000,
    interestRate: 2.6,
    monthlyInstalment: 1450,
    monthsRemaining: 108,
    totalMonths: 240,
    startDate: '2015-05-01',
    currency: 'SGD',
  },
  {
    id: 'l2',
    bankName: 'Bank B',
    loanType: 'mortgage',
    securityType: 'secured',
    originalAmount: 2000000,
    outstandingBalance: 1700250,
    interestRate: 3.25,
    monthlyInstalment: 8750,
    monthsRemaining: 194,
    totalMonths: 240,
    startDate: '2022-01-15',
    currency: 'SGD',
  },
  {
    id: 'l3',
    bankName: 'Bank B',
    loanType: 'personal_loan',
    securityType: 'unsecured_interest_bearing',
    originalAmount: 10000,
    outstandingBalance: 7000,
    interestRate: 6.5,
    monthlyInstalment: 300,
    monthsRemaining: 24,
    totalMonths: 36,
    startDate: '2022-12-01',
    currency: 'SGD',
  },
  {
    id: 'l4',
    bankName: 'Bank C',
    loanType: 'credit_card',
    securityType: 'unsecured_interest_bearing',
    originalAmount: 7000,
    outstandingBalance: 7000,
    interestRate: 24.0,
    monthlyInstalment: 500,
    monthsRemaining: 14,
    totalMonths: 14,
    startDate: '2024-01-01',
    currency: 'SGD',
  },
];

const defaultHoldings: Holding[] = []; // Empty for new users

const defaultHoldingsOld: Holding[] = [
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
];

const defaultInsurancePolicies: InsurancePolicy[] = []; // Empty for new users

const defaultInsurancePoliciesOld: InsurancePolicy[] = [
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
];

// Empty credit score for new users - will show "No Data" state
const defaultCreditScore: CreditScoreData = {
  score: 0,
  paymentHistory: 0,
  amountsOwed: 0,
  lengthOfCredit: 0,
  creditMix: 0,
  newCredit: 0,
  lastUpdated: '',
};

const defaultAppData: AppData = {
  bankAccounts: defaultBankAccounts,
  loans: defaultLoans,
  holdings: defaultHoldings,
  insurancePolicies: defaultInsurancePolicies,
  creditScore: defaultCreditScore,
};

// ─── Load App Data from Firestore ─────────────────────────────────────────────
export async function loadAppData(): Promise<AppData> {
  try {
    const userId = getCurrentUserId();
    const userDataRef = doc(db, getUserDataPath(userId));
    const snapshot = await getDoc(userDataRef);

    if (snapshot.exists()) {
      return snapshot.data() as AppData;
    } else {
      // First time user - initialize with default data
      await setDoc(userDataRef, defaultAppData);
      return defaultAppData;
    }
  } catch (error) {
    console.error('Error loading app data from Firestore:', error);
    // Fallback to AsyncStorage if Firestore fails
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultAppData;
    } catch {
      return defaultAppData;
    }
  }
}

// ─── Save App Data to Firestore ───────────────────────────────────────────────
export async function saveAppData(data: AppData): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const userDataRef = doc(db, getUserDataPath(userId));
    await setDoc(userDataRef, data, { merge: true });
    
    // Also save to AsyncStorage as backup
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving app data to Firestore:', error);
    // Fallback to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// ─── Reset App Data ───────────────────────────────────────────────────────────
export async function resetAppData(): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const userDataRef = doc(db, getUserDataPath(userId));
    await setDoc(userDataRef, defaultAppData);
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting app data:', error);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

// ─── Financial Calculations ───────────────────────────────────────────────────

export function calcTotalAssets(data: AppData): number {
  const bankAssets = data.bankAccounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  const investmentAssets = data.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  return bankAssets + investmentAssets;
}

export function calcTotalLiabilities(data: AppData): number {
  const creditCardDebt = data.bankAccounts.reduce((sum, acc) => sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0), 0);
  const loanDebt = data.loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  return creditCardDebt + loanDebt;
}

export function calcNetWorth(data: AppData): number {
  return calcTotalAssets(data) - calcTotalLiabilities(data);
}

export function calcWellnessScore(data: AppData): number {
  // Use new improved wellness score algorithm
  const { calculateWellnessScore } = require('./wellness-score-calculator');
  
  // Calculate liquid assets (bank accounts)
  const liquidAssets = data.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Estimate monthly expenses (assume 5% of liquid assets or 3000 SGD minimum)
  const monthlyExpenses = Math.max(liquidAssets * 0.05, 3000);
  
  // Build asset allocation from holdings
  const assetAllocation: Record<string, number> = {};
  data.holdings.forEach((holding) => {
    const assetClass = holding.assetClass || 'other';
    const holdingValue = holding.currentPrice * holding.quantity;
    assetAllocation[assetClass] = (assetAllocation[assetClass] || 0) + holdingValue;
  });
  
  // Calculate totals
  const totalAssets = calcTotalAssets(data);
  const totalLiabilities = calcTotalLiabilities(data);
  const currentNetWorth = calcNetWorth(data);
  
  // Normalize CBS credit score (1000-2000 range) to 300-850 range for algorithm
  // CBS 1000 = 300, CBS 2000 = 850
  const cbsScore = data.creditScore.score;
  const normalizedCreditScore = 300 + ((cbsScore - 1000) / 1000) * 550;
  
  // Use previous net worth (default to current if not available)
  const previousNetWorth = currentNetWorth > 0 ? currentNetWorth * 0.95 : 0;
  
  // Calculate wellness score using new algorithm
  const breakdown = calculateWellnessScore({
    creditScore: Math.max(300, Math.min(850, normalizedCreditScore)),
    liquidAssets,
    monthlyExpenses,
    assetAllocation,
    currentNetWorth,
    previousNetWorth,
    liabilities: totalLiabilities,
    assets: totalAssets,
  });
  
  return breakdown.totalScore;
}

export function calcCBSScore(creditScore: CreditScoreData): string {
  const score = creditScore.score;
  if (score >= 1900) return 'A';
  if (score >= 1700) return 'B+';
  if (score >= 1500) return 'B';
  if (score >= 1300) return 'B-';
  if (score >= 1100) return 'C';
  return 'D';
}

export function getCreditScoreDetails(creditScore: CreditScoreData): { score: number; grade: string; color: string } {
  const score = creditScore.score;
  let grade = 'D';
  let color = '#EF4444';
  
  if (score >= 1900) { grade = 'A'; color = '#22C55E'; }
  else if (score >= 1700) { grade = 'B+'; color = '#84CC16'; }
  else if (score >= 1500) { grade = 'B'; color = '#EAB308'; }
  else if (score >= 1300) { grade = 'B-'; color = '#F97316'; }
  else if (score >= 1100) { grade = 'C'; color = '#EF4444'; }
  
  return { score, grade, color };
}

export function formatCurrency(value: number, currency: string = 'SGD'): string {
  const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

export function calcPortfolioByAssetClass(holdings: Holding[]): Record<string, number> {
  const result: Record<string, number> = {};
  holdings.forEach(h => {
    const value = h.quantity * h.currentPrice;
    result[h.assetClass] = (result[h.assetClass] || 0) + value;
  });
  return result;
}

export function calcPortfolioMetrics(data: AppData): {
  totalValue: number;
  totalGain: number;
  gainPercent: number;
} {
  let totalValue = 0;
  let totalCost = 0;

  data.holdings.forEach(h => {
    const value = h.quantity * h.currentPrice;
    const cost = h.quantity * h.avgCost;
    totalValue += value;
    totalCost += cost;
  });

  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return { totalValue, totalGain, gainPercent };
}

export function calcAssetAllocation(data: AppData): { label: string; value: number; color: string }[] {
  const totalAssets = calcTotalAssets(data);
  if (totalAssets === 0) return [];

  const bankTotal = data.bankAccounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  const investmentTotal = data.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);

  return [
    { label: 'Banks', value: (bankTotal / totalAssets) * 100, color: '#3B82F6' },
    { label: 'Investments', value: (investmentTotal / totalAssets) * 100, color: '#F59E0B' },
  ];
}

export function calcLiquidityMonths(data: AppData): number {
  const liquidAssets = data.bankAccounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  const monthlyExpenses = data.loans.reduce((sum, l) => sum + l.monthlyInstalment, 0);
  return monthlyExpenses > 0 ? Math.floor(liquidAssets / monthlyExpenses) : 0;
}

export function calcDebtRatio(data: AppData): number {
  const totalAssets = calcTotalAssets(data);
  const totalLiabilities = calcTotalLiabilities(data);
  return totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
}

export function calcDiversificationScore(data: AppData): number {
  const assetClasses = new Set(data.holdings.map(h => h.assetClass));
  return Math.min(assetClasses.size, 8);
}

export function calcAggregatedBalances(data: AppData): Record<string, number> {
  const balances: Record<string, number> = {};

  data.loans.forEach(loan => {
    if (!balances[loan.bankName]) {
      balances[loan.bankName] = 0;
    }
    balances[loan.bankName] += loan.outstandingBalance;
  });

  return balances;
}
