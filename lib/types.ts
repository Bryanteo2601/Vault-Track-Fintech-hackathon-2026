// ─── Bank Account ────────────────────────────────────────────────────────────
export type AccountType = 'savings' | 'daily' | 'credit' | 'investment' | 'fixed_deposit';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  interestRate: number; // annual %
  currency: string;
  isPrimary: boolean;
  createdAt: string;
}

// ─── Loan ─────────────────────────────────────────────────────────────────────
export type LoanType =
  | 'hdb_loan'
  | 'mortgage'
  | 'personal_loan'
  | 'credit_card'
  | 'car_loan'
  | 'renovation_loan'
  | 'education_loan'
  | 'business_loan';

export type LoanSecurityType = 'secured' | 'unsecured_interest_bearing' | 'unsecured_non_interest' | 'exempted';

export interface Loan {
  id: string;
  bankName: string;
  loanType: LoanType;
  securityType: LoanSecurityType;
  originalAmount: number;
  outstandingBalance: number;
  interestRate: number; // annual %
  monthlyInstalment: number;
  monthsRemaining: number;
  totalMonths: number;
  startDate: string;
  currency: string;
  linkedAccountId?: string;
}

// ─── Investment ───────────────────────────────────────────────────────────────
export type AssetClass = 'stocks' | 'crypto' | 'etf' | 'bonds' | 'futures' | 'options' | 'reits' | 'commodities';

export interface Holding {
  id: string;
  assetClass: AssetClass;
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currency: string;
  exchange?: string;
  purchaseDate: string;
}

// ─── Insurance ────────────────────────────────────────────────────────────────
export type InsuranceType =
  | 'life'
  | 'health'
  | 'critical_illness'
  | 'disability'
  | 'property'
  | 'vehicle'
  | 'travel'
  | 'endowment'
  | 'investment_linked';

export interface InsurancePolicy {
  id: string;
  insurer: string;
  policyNumber: string;
  policyType: InsuranceType;
  coverageAmount: number;
  annualPremium: number;
  startDate: string;
  endDate: string;
  beneficiary?: string;
  notes?: string;
  pdfUri?: string;
  pdfName?: string;
  currency: string;
}

// ─── Credit Score ─────────────────────────────────────────────────────────────
export interface CreditScoreData {
  score: number; // 1000–2000 CBS scale
  paymentHistory: number; // 0–100
  amountsOwed: number; // 0–100
  lengthOfCredit: number; // 0–100
  creditMix: number; // 0–100
  newCredit: number; // 0–100
  lastUpdated: string;
}

// ─── Aggregated Outstanding Balance ──────────────────────────────────────────
export interface AggregatedBalance {
  month: string; // "May 2025"
  secured: number;
  unsecuredInterestBearing: number;
  unsecuredNonInterest: number;
  exempted: number;
}

// ─── Private Assets ──────────────────────────────────────────────────────────
export interface HistoricalValuation {
  date: string;
  estimatedValue: number;
  source: string;
  note?: string;
}

export type ConfidenceLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';

export interface PrivateAsset {
  id: string;
  assetName: string;
  assetType: string;
  description: string;
  purchasePrice: number;
  currentEstimatedValue: number;
  purchaseDate: string;
  currency: string;
  quantity?: number;
  valuationNotes?: string;
  valuationSource?: string;
  confidenceLevel?: ConfidenceLevel;
  historicalValuations: HistoricalValuation[];
  customAttributes: Record<string, string | number | boolean>;
  inferredCategory?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── App State ────────────────────────────────────────────────────────────────────
export interface AppData {
  bankAccounts: BankAccount[];
  loans: Loan[];
  holdings: Holding[];
  insurancePolicies: InsurancePolicy[];
  privateAssets: PrivateAsset[];
  creditScore: CreditScoreData;
  userAccountStartDate?: string; // ISO date string (e.g., "2022-01-01")
}