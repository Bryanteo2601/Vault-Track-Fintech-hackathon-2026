import {
  AppData,
  BankAccount,
  Loan,
  Holding,
  InsurancePolicy,
  CreditScoreData,
  AggregatedBalance,
  PrivateAsset,
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
  return `users/${userId}/appData/data`;
}

// ─── Default Sample Data ──────────────────────────────────────────────────────
const defaultBankAccounts: BankAccount[] = [
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

const defaultLoans: Loan[] = [
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
]

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

const defaultHoldings: Holding[] = [
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
]

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

const defaultInsurancePolicies: InsurancePolicy[] = [
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
]

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

// Default CPF data
const defaultCPFData = {
  age: 35,
  oa: 125000,  // Ordinary Account - for housing, education, investment
  sa: 85000,   // Special Account - for retirement savings
  ma: 45000,   // Medisave Account - for healthcare
  ra: 0,       // Retirement Account - activated at 55
  annualSalary: 72000,
};

// Sample credit score with good standing
const defaultCreditScore: CreditScoreData = {
  score: 1825,
  paymentHistory: 95,
  amountsOwed: 85,
  lengthOfCredit: 80,
  creditMix: 90,
  newCredit: 75,
  lastUpdated: new Date().toISOString(),
};

// Sample private assets with historical valuations
const defaultPrivateAssets: PrivateAsset[] = [
  {
    id: 'pa1',
    assetType: 'jewelry',
    assetName: 'Diamond Engagement Ring',
    description: 'Certified 2.5 carat diamond ring',
    purchasePrice: 8500,
    currentEstimatedValue: 9200,
    currency: 'SGD',
    purchaseDate: '2018-06-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confidenceLevel: 'High',
    historicalValuations: [
      { date: '2018-06-15', estimatedValue: 8500, source: 'Purchase' },
      { date: '2019-12-31', estimatedValue: 8650, source: 'Professional Appraisal' },
      { date: '2021-06-30', estimatedValue: 8900, source: 'Professional Appraisal' },
      { date: '2023-12-31', estimatedValue: 9100, source: 'Professional Appraisal' },
      { date: '2025-03-09', estimatedValue: 9200, source: 'Current Estimate' },
    ],
    customAttributes: { carat: '2.5', certification: 'GIA' },
  },
  {
    id: 'pa2',
    assetType: 'art',
    assetName: 'Contemporary Art Painting',
    description: 'Original oil painting by local artist',
    purchasePrice: 15000,
    currentEstimatedValue: 22500,
    currency: 'SGD',
    purchaseDate: '2019-03-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confidenceLevel: 'Medium',
    historicalValuations: [
      { date: '2019-03-20', estimatedValue: 15000, source: 'Purchase' },
      { date: '2020-06-30', estimatedValue: 17200, source: 'Auction Estimate' },
      { date: '2021-12-31', estimatedValue: 19800, source: 'Gallery Valuation' },
      { date: '2023-06-30', estimatedValue: 21500, source: 'Gallery Valuation' },
      { date: '2025-03-09', estimatedValue: 22500, source: 'Current Estimate' },
    ],
    customAttributes: { artist: 'Local Singapore Artist', year: 2019 },
  },
  {
    id: 'pa3',
    assetType: 'collectibles',
    assetName: 'Vintage Watch Collection',
    description: 'Rolex Submariner and Omega Seamaster',
    purchasePrice: 28000,
    currentEstimatedValue: 35800,
    currency: 'SGD',
    purchaseDate: '2017-09-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confidenceLevel: 'High',
    historicalValuations: [
      { date: '2017-09-10', estimatedValue: 28000, source: 'Purchase' },
      { date: '2019-03-31', estimatedValue: 29500, source: 'Jeweler Appraisal' },
      { date: '2021-06-30', estimatedValue: 31200, source: 'Jeweler Appraisal' },
      { date: '2023-09-30', estimatedValue: 34200, source: 'Auction House' },
      { date: '2025-03-09', estimatedValue: 35800, source: 'Current Estimate' },
    ],
    customAttributes: { pieces: 2, brands: 'Rolex, Omega' },
  },
  {
    id: 'pa4',
    assetType: 'property',
    assetName: 'Residential Property - Sentosa Cove',
    description: 'Luxury apartment with sea view',
    purchasePrice: 1200000,
    currentEstimatedValue: 1485000,
    currency: 'SGD',
    purchaseDate: '2016-11-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confidenceLevel: 'High',
    historicalValuations: [
      { date: '2016-11-05', estimatedValue: 1200000, source: 'Purchase' },
      { date: '2018-12-31', estimatedValue: 1260000, source: 'Property Valuation' },
      { date: '2020-12-31', estimatedValue: 1320000, source: 'Property Valuation' },
      { date: '2023-06-30', estimatedValue: 1410000, source: 'Property Valuation' },
      { date: '2025-03-09', estimatedValue: 1485000, source: 'Current Market' },
    ],
    customAttributes: { location: 'Sentosa Cove', bedrooms: 3, sqft: 3500 },
  },
];

export const defaultAppData: AppData = {
  bankAccounts: defaultBankAccounts,
  loans: defaultLoans,
  holdings: defaultHoldings,
  insurancePolicies: defaultInsurancePolicies,
  privateAssets: defaultPrivateAssets,
  creditScore: defaultCreditScore,
  cpf: defaultCPFData,
  userAccountStartDate: '2022-01-01', // User account creation date
  userProfile: {
    birthDate: '1995-05-15',
    ageRange: '25-34',
    lifeStage: 'fresh_entrant',
    hasDependents: false,
    hasAgedParents: false,
  },
};

// ─── Load App Data from Firestore ─────────────────────────────────────────────
export async function loadAppData(): Promise<AppData> {
  try {
    const userId = getCurrentUserId();
    const userDataRef = doc(db, 'users', userId, 'appData', 'data');
    const snapshot = await getDoc(userDataRef);

    if (snapshot.exists()) {
      const firestoreData = snapshot.data() as AppData;
      // Merge with defaults to ensure all fields are present (for backward compatibility)
      const merged = {
        ...defaultAppData,
        ...firestoreData,
        // Ensure userAccountStartDate is always present
        userAccountStartDate: firestoreData.userAccountStartDate || defaultAppData.userAccountStartDate,
      };
      // Also save to AsyncStorage as backup
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to backup to AsyncStorage:', e);
      }
      return merged;
    } else {
      // First time user - initialize with default data
      await setDoc(userDataRef, defaultAppData);
      return defaultAppData;
    }
  } catch (error) {
    console.error('Error loading app data from Firestore:', error);
    // Fallback to AsyncStorage if Firestore fails (e.g., offline)
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('Loaded app data from AsyncStorage (offline mode)');
        return JSON.parse(stored);
      }
    } catch (storageError) {
      console.error('Error loading from AsyncStorage:', storageError);
    }
    // Last resort: return default data
    console.log('Using default app data');
    return defaultAppData;
  }
}

// ─── Save App Data to Firestore ───────────────────────────────────────────────
export async function saveAppData(data: AppData): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const userDataRef = doc(db, 'users', userId, 'appData', 'data');
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
