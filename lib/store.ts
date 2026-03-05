import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppData,
  BankAccount,
  Loan,
  Holding,
  InsurancePolicy,
  CreditScoreData,
  AggregatedBalance,
} from './types';

const STORAGE_KEY = 'wwh_app_data';

// ─── Default Sample Data ──────────────────────────────────────────────────────
const defaultBankAccounts: BankAccount[] = [
  {
    id: 'ba1',
    bankName: 'DBS Bank',
    accountNumber: '****1234',
    accountType: 'savings',
    balance: 45000,
    interestRate: 3.5,
    currency: 'SGD',
    isPrimary: true,
    createdAt: '2022-01-15',
  },
  {
    id: 'ba2',
    bankName: 'OCBC Bank',
    accountNumber: '****5678',
    accountType: 'daily',
    balance: 8500,
    interestRate: 0.05,
    currency: 'SGD',
    isPrimary: false,
    createdAt: '2021-06-01',
  },
  {
    id: 'ba3',
    bankName: 'UOB Bank',
    accountNumber: '****9012',
    accountType: 'credit',
    balance: -2500,
    interestRate: 26.9,
    currency: 'SGD',
    isPrimary: false,
    createdAt: '2020-03-10',
  },
  {
    id: 'ba4',
    bankName: 'Standard Chartered',
    accountNumber: '****3456',
    accountType: 'fixed_deposit',
    balance: 20000,
    interestRate: 3.8,
    currency: 'SGD',
    isPrimary: false,
    createdAt: '2023-08-20',
  },
];

const defaultLoans: Loan[] = [
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
    startDate: '2023-05-01',
    currency: 'SGD',
  },
  {
    id: 'l4',
    bankName: 'Bank B',
    loanType: 'credit_card',
    securityType: 'unsecured_non_interest',
    originalAmount: 5000,
    outstandingBalance: 2500,
    interestRate: 0,
    monthlyInstalment: 500,
    monthsRemaining: 5,
    totalMonths: 10,
    startDate: '2024-08-01',
    currency: 'SGD',
  },
  {
    id: 'l5',
    bankName: 'Bank C',
    loanType: 'mortgage',
    securityType: 'secured',
    originalAmount: 120000,
    outstandingBalance: 75000,
    interestRate: 3.0,
    monthlyInstalment: 650,
    monthsRemaining: 115,
    totalMonths: 180,
    startDate: '2018-03-01',
    currency: 'SGD',
  },
];

const defaultHoldings: Holding[] = [
  {
    id: 'h1',
    assetClass: 'stocks',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 50,
    avgCost: 165.0,
    currentPrice: 189.5,
    currency: 'USD',
    exchange: 'NASDAQ',
    purchaseDate: '2023-01-10',
  },
  {
    id: 'h2',
    assetClass: 'stocks',
    ticker: 'D05.SI',
    name: 'DBS Group Holdings',
    quantity: 200,
    avgCost: 32.5,
    currentPrice: 36.8,
    currency: 'SGD',
    exchange: 'SGX',
    purchaseDate: '2022-06-15',
  },
  {
    id: 'h3',
    assetClass: 'crypto',
    ticker: 'BTC',
    name: 'Bitcoin',
    quantity: 0.5,
    avgCost: 35000,
    currentPrice: 62000,
    currency: 'USD',
    purchaseDate: '2022-11-01',
  },
  {
    id: 'h4',
    assetClass: 'etf',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    quantity: 30,
    avgCost: 380.0,
    currentPrice: 445.0,
    currency: 'USD',
    exchange: 'NYSE',
    purchaseDate: '2021-03-20',
  },
  {
    id: 'h5',
    assetClass: 'bonds',
    ticker: 'SGS2030',
    name: 'Singapore Govt Bond 2030',
    quantity: 10000,
    avgCost: 1.0,
    currentPrice: 0.98,
    currency: 'SGD',
    purchaseDate: '2023-07-01',
  },
  {
    id: 'h6',
    assetClass: 'reits',
    ticker: 'A17U.SI',
    name: 'CapitaLand Integrated Commercial Trust',
    quantity: 5000,
    avgCost: 2.1,
    currentPrice: 2.25,
    currency: 'SGD',
    exchange: 'SGX',
    purchaseDate: '2022-09-05',
  },
  {
    id: 'h7',
    assetClass: 'crypto',
    ticker: 'ETH',
    name: 'Ethereum',
    quantity: 3,
    avgCost: 1800,
    currentPrice: 3200,
    currency: 'USD',
    purchaseDate: '2023-02-14',
  },
];

const defaultInsurancePolicies: InsurancePolicy[] = [
  {
    id: 'ip1',
    insurer: 'Prudential',
    policyNumber: 'PRU-2021-001234',
    policyType: 'life',
    coverageAmount: 500000,
    annualPremium: 3600,
    startDate: '2021-01-01',
    endDate: '2051-01-01',
    beneficiary: 'Spouse',
    notes: 'Whole life policy with cash value accumulation',
    currency: 'SGD',
  },
  {
    id: 'ip2',
    insurer: 'AIA Singapore',
    policyNumber: 'AIA-2022-056789',
    policyType: 'health',
    coverageAmount: 1000000,
    annualPremium: 2400,
    startDate: '2022-03-15',
    endDate: '2072-03-15',
    notes: 'Integrated Shield Plan with rider',
    currency: 'SGD',
  },
  {
    id: 'ip3',
    insurer: 'Great Eastern',
    policyNumber: 'GE-2020-089012',
    policyType: 'critical_illness',
    coverageAmount: 300000,
    annualPremium: 1800,
    startDate: '2020-06-01',
    endDate: '2050-06-01',
    notes: 'Covers 37 critical illnesses',
    currency: 'SGD',
  },
  {
    id: 'ip4',
    insurer: 'NTUC Income',
    policyNumber: 'NTUC-2023-112233',
    policyType: 'property',
    coverageAmount: 2000000,
    annualPremium: 1200,
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    notes: 'HDB fire insurance + home contents',
    currency: 'SGD',
  },
];

const defaultCreditScore: CreditScoreData = {
  score: 1825,
  paymentHistory: 88,
  amountsOwed: 62,
  lengthOfCredit: 75,
  creditMix: 80,
  newCredit: 70,
  lastUpdated: '2025-05-01',
};

const defaultData: AppData = {
  bankAccounts: defaultBankAccounts,
  loans: defaultLoans,
  holdings: defaultHoldings,
  insurancePolicies: defaultInsurancePolicies,
  creditScore: defaultCreditScore,
};

// ─── Aggregated Balance History (CBS format) ──────────────────────────────────
export const aggregatedBalanceHistory: AggregatedBalance[] = [
  { month: 'May 2025', secured: 1932250, unsecuredInterestBearing: 7000, unsecuredNonInterest: 2500, exempted: 0 },
  { month: 'Apr 2025', secured: 1938550, unsecuredInterestBearing: 7300, unsecuredNonInterest: 1680, exempted: 0 },
  { month: 'Mar 2025', secured: 1944850, unsecuredInterestBearing: 7600, unsecuredNonInterest: 1700, exempted: 0 },
  { month: 'Feb 2025', secured: 1951150, unsecuredInterestBearing: 7900, unsecuredNonInterest: 2400, exempted: 0 },
  { month: 'Jan 2025', secured: 1957450, unsecuredInterestBearing: 8200, unsecuredNonInterest: 1100, exempted: 0 },
  { month: 'Dec 2024', secured: 1963750, unsecuredInterestBearing: 8500, unsecuredNonInterest: 700, exempted: 0 },
];

// ─── Storage API ──────────────────────────────────────────────────────────────
export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch (_) {}
  return defaultData;
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function resetAppData(): Promise<AppData> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
}

// ─── Financial Calculations ───────────────────────────────────────────────────
export function calcTotalAssets(data: AppData): number {
  const bankAssets = data.bankAccounts
    .filter((a) => a.balance > 0)
    .reduce((s, a) => s + a.balance, 0);
  const investmentValue = data.holdings.reduce(
    (s, h) => s + h.quantity * h.currentPrice,
    0
  );
  const insuranceValue = data.insurancePolicies.reduce(
    (s, p) => s + p.coverageAmount * 0.05,
    0
  );
  return bankAssets + investmentValue + insuranceValue;
}

export function calcTotalLiabilities(data: AppData): number {
  return data.loans.reduce((s, l) => s + l.outstandingBalance, 0);
}

export function calcNetWorth(data: AppData): number {
  return calcTotalAssets(data) - calcTotalLiabilities(data);
}

export function calcWellnessScore(data: AppData): number {
  const netWorth = calcNetWorth(data);
  const totalAssets = calcTotalAssets(data);
  const totalLiabilities = calcTotalLiabilities(data);

  // Debt-to-asset ratio (lower is better)
  const dta = totalAssets > 0 ? totalLiabilities / totalAssets : 1;
  const dtaScore = Math.max(0, Math.min(100, (1 - dta) * 100));

  // Diversification: number of asset classes used
  const assetClasses = new Set(data.holdings.map((h) => h.assetClass)).size;
  const divScore = Math.min(100, assetClasses * 14);

  // Credit score normalized (CBS 1000-2000 → 0-100)
  const creditNorm = ((data.creditScore.score - 1000) / 1000) * 100;

  // Liquidity: bank balance vs monthly expenses (estimated)
  const monthlyExpenses = data.loans.reduce((s, l) => s + l.monthlyInstalment, 0);
  const liquidAssets = data.bankAccounts
    .filter((a) => ['savings', 'daily'].includes(a.accountType))
    .reduce((s, a) => s + a.balance, 0);
  const liquidityRatio = monthlyExpenses > 0 ? Math.min(liquidAssets / (monthlyExpenses * 6), 1) : 1;
  const liquidityScore = liquidityRatio * 100;

  // Insurance coverage
  const totalCoverage = data.insurancePolicies.reduce((s, p) => s + p.coverageAmount, 0);
  const insuranceScore = Math.min(100, (totalCoverage / 1000000) * 50);

  const score = dtaScore * 0.25 + divScore * 0.2 + creditNorm * 0.25 + liquidityScore * 0.2 + insuranceScore * 0.1;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calcCBSScore(data: AppData): { score: number; grade: string; color: string } {
  const s = data.creditScore.score;
  if (s >= 1911) return { score: s, grade: 'AA', color: '#00C896' };
  if (s >= 1844) return { score: s, grade: 'BB', color: '#22C55E' };
  if (s >= 1825) return { score: s, grade: 'CC', color: '#84CC16' };
  if (s >= 1813) return { score: s, grade: 'DD', color: '#F59E0B' };
  if (s >= 1782) return { score: s, grade: 'EE', color: '#F97316' };
  if (s >= 1755) return { score: s, grade: 'FF', color: '#EF4444' };
  if (s >= 1724) return { score: s, grade: 'GG', color: '#DC2626' };
  return { score: s, grade: 'HH', color: '#991B1B' };
}

export function calcMaxLoan(data: AppData): number {
  const monthlyIncome = 8000; // estimated
  const existingMonthlyDebt = data.loans.reduce((s, l) => s + l.monthlyInstalment, 0);
  const tdsr = 0.55; // Total Debt Servicing Ratio cap
  const availableMonthly = monthlyIncome * tdsr - existingMonthlyDebt;
  if (availableMonthly <= 0) return 0;
  // Estimate max loan at 3.5% over 25 years
  const r = 0.035 / 12;
  const n = 300;
  return Math.round((availableMonthly * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)));
}

export function calcPortfolioByAssetClass(holdings: Holding[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const h of holdings) {
    const value = h.quantity * h.currentPrice;
    result[h.assetClass] = (result[h.assetClass] || 0) + value;
  }
  return result;
}

export function calcTotalInterestPayable(loan: Loan): number {
  return loan.monthlyInstalment * loan.monthsRemaining - loan.outstandingBalance;
}

export function calcTotalPaid(loan: Loan): number {
  const paidMonths = loan.totalMonths - loan.monthsRemaining;
  return paidMonths * loan.monthlyInstalment;
}

export function formatCurrency(amount: number, currency = 'SGD'): string {
  if (Math.abs(amount) >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${currency} ${amount.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
