import { AppData, Loan } from './types';

/**
 * CBS Credit Score Calculation Engine
 * Computes Singapore CBS-style credit score (1000-2000) with five weighted factors
 */

export interface CBSScoreResult {
  score: number; // 1000-2000
  grade: string; // A, B+, B, B-, C, D
  paymentHistoryScore: number; // 0-100
  amountsOwedScore: number; // 0-100
  lengthOfCreditScore: number; // 0-100
  creditMixScore: number; // 0-100
  newCreditScore: number; // 0-100
  estimatedMaxLoan: number; // in SGD
  lastUpdated: Date;
  warnings: string[];
}

/**
 * Calculate Payment History factor (35% weight)
 * Measures ability to pay loans on time based on liquid assets vs monthly instalments
 */
function calculatePaymentHistory(appData: AppData): number {
  const { bankAccounts, loans } = appData;

  // If no loans, default to 75 (neutral)
  if (!loans || loans.length === 0) {
    return 75;
  }

  // Calculate total liquid assets
  const totalLiquidAssets = bankAccounts.reduce((sum, bank) => sum + (bank.balance || 0), 0);

  // Calculate total monthly instalments
  const totalMonthlyInstalments = loans.reduce((sum, loan) => {
    const monthlyPayment = loan.monthlyInstalment || 0;
    return sum + monthlyPayment;
  }, 0);

  // Avoid division by zero
  if (totalMonthlyInstalments === 0) {
    return 75;
  }

  const paymentCapacityRatio = totalLiquidAssets / totalMonthlyInstalments;

  // Map ratio to score
  if (paymentCapacityRatio >= 12) return 95;
  if (paymentCapacityRatio >= 6) return 85;
  if (paymentCapacityRatio >= 3) return 70;
  if (paymentCapacityRatio >= 1) return 50;
  return 25;
}

/**
 * Calculate Amounts Owed factor (30% weight)
 * Measures debt burden using debt-to-asset ratio
 */
function calculateAmountsOwed(appData: AppData): number {
  const { bankAccounts, loans, holdings, insurancePolicies } = appData;

  // Calculate total assets
  let totalAssets = 0;
  if (bankAccounts) {
    totalAssets += bankAccounts.reduce((sum, bank) => sum + (bank.balance || 0), 0);
  }
  if (holdings) {
    totalAssets += holdings.reduce((sum, holding) => sum + (holding.currentPrice * holding.quantity || 0), 0);
  }

  // Calculate total liabilities
  let totalLiabilities = 0;
  if (loans) {
    totalLiabilities += loans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0);
  }

  // Handle edge case: no assets
  if (totalAssets === 0) {
    return totalLiabilities === 0 ? 95 : 20;
  }

  const debtToAssetRatio = totalLiabilities / totalAssets;

  // Map ratio to score
  if (debtToAssetRatio <= 0.2) return 95;
  if (debtToAssetRatio <= 0.4) return 80;
  if (debtToAssetRatio <= 0.6) return 65;
  if (debtToAssetRatio <= 0.8) return 45;
  return 20;
}

/**
 * Calculate Length of Credit factor (15% weight)
 * Infers credit age from earliest account/loan creation date
 */
function calculateLengthOfCredit(appData: AppData): number {
  const { bankAccounts, loans } = appData;
  const now = new Date();
  let earliestDate: Date | null = null;

  // Find earliest bank account creation date
  if (bankAccounts && bankAccounts.length > 0) {
    const earliestBank = bankAccounts.reduce((earliest, bank) => {
      const bankDate = new Date(bank.createdAt || now);
      return !earliest || bankDate < earliest ? bankDate : earliest;
    }, null as Date | null);
    if (earliestBank) earliestDate = earliestBank;
  }

  // Find earliest loan creation date
  if (loans && loans.length > 0) {
    const earliestLoan = loans.reduce((earliest, loan) => {
      const loanDate = new Date(loan.startDate || now);
      return !earliest || loanDate < earliest ? loanDate : earliest;
    }, null as Date | null);
    if (earliestLoan && (!earliestDate || earliestLoan < earliestDate)) {
      earliestDate = earliestLoan;
    }
  }

  // If no historical dates, return neutral default
  if (!earliestDate) {
    return 50;
  }

  const creditAgeYears = (now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Map age to score
  if (creditAgeYears >= 8) return 90;
  if (creditAgeYears >= 5) return 75;
  if (creditAgeYears >= 3) return 60;
  if (creditAgeYears >= 1) return 40;
  return 20;
}

/**
 * Calculate Credit Mix factor (10% weight)
 * Counts distinct financial product types
 */
function calculateCreditMix(appData: AppData): number {
  const { bankAccounts, loans, holdings, insurancePolicies } = appData;
  let productTypes = 0;

  // Check for different account types
  if (bankAccounts && bankAccounts.length > 0) {
    productTypes += 1; // Savings/checking accounts
  }

  if (loans && loans.length > 0) {
    productTypes += 1; // Loans
  }

  if (holdings && holdings.length > 0) {
    productTypes += 1; // Investments
  }

  if (insurancePolicies && insurancePolicies.length > 0) {
    productTypes += 1; // Insurance
  }

  // Map product count to score
  if (productTypes >= 5) return 90;
  if (productTypes === 4) return 75;
  if (productTypes === 3) return 60;
  if (productTypes === 2) return 45;
  if (productTypes === 1) return 25;
  return 10;
}

/**
 * Calculate New Credit factor (10% weight)
 * Counts recent credit accounts opened in past 12 months
 */
function calculateNewCredit(appData: AppData): number {
  const { loans } = appData;
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  if (!loans || loans.length === 0) {
    return 70; // Neutral default
  }

  const recentCreditCount = loans.filter((loan) => {
    const loanDate = new Date(loan.startDate || now);
    return loanDate > oneYearAgo;
  }).length;

  // Map count to score
  if (recentCreditCount === 0) return 90;
  if (recentCreditCount === 1) return 75;
  if (recentCreditCount === 2) return 55;
  if (recentCreditCount === 3) return 35;
  return 20;
}

/**
 * Calculate estimated max loan using Singapore TDSR logic
 */
function calculateEstimatedMaxLoan(appData: AppData, monthlyIncome: number): number {
  const { loans } = appData;

  // If no monthly income provided, return 0
  if (!monthlyIncome || monthlyIncome <= 0) {
    return 0;
  }

  // Calculate existing monthly debt service
  const existingMonthlyDebt = loans.reduce((sum, loan) => sum + (loan.monthlyInstalment || 0), 0);

  // Maximum allowed debt service ratio (TDSR) is 55%
  const maxAllowedDebtService = 0.55 * monthlyIncome;
  const remainingDebtCapacity = maxAllowedDebtService - existingMonthlyDebt;

  // If no remaining capacity, max loan is 0
  if (remainingDebtCapacity <= 0) {
    return 0;
  }

  // Use amortization formula to estimate loan principal
  const loanTenureYears = 20;
  const annualInterestRate = 0.04; // 4% default
  const monthlyRate = annualInterestRate / 12;
  const months = loanTenureYears * 12;

  // Amortization formula: P = PMT * ((1 + r)^n - 1) / (r * (1 + r)^n)
  const numerator = Math.pow(1 + monthlyRate, months) - 1;
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const loanPrincipal = remainingDebtCapacity * (numerator / denominator);

  return Math.round(loanPrincipal);
}

/**
 * Main CBS Score Calculation Function
 */
export function calculateCBSScore(appData: AppData, monthlyIncome: number = 0): CBSScoreResult {
  const warnings: string[] = [];

  // Calculate individual factors
  const paymentHistoryScore = calculatePaymentHistory(appData);
  const amountsOwedScore = calculateAmountsOwed(appData);
  const lengthOfCreditScore = calculateLengthOfCredit(appData);
  const creditMixScore = calculateCreditMix(appData);
  const newCreditScore = calculateNewCredit(appData);

  // Calculate weighted score
  const weightedScore =
    0.35 * paymentHistoryScore +
    0.3 * amountsOwedScore +
    0.15 * lengthOfCreditScore +
    0.1 * creditMixScore +
    0.1 * newCreditScore;

  // Convert to CBS-style score (1000-2000)
  let cbsScore = Math.round(1000 + weightedScore * 10);
  cbsScore = Math.max(1000, Math.min(2000, cbsScore)); // Clamp between 1000-2000

  // Determine grade
  let grade = 'D';
  if (cbsScore >= 1900) grade = 'A';
  else if (cbsScore >= 1700) grade = 'B+';
  else if (cbsScore >= 1500) grade = 'B';
  else if (cbsScore >= 1300) grade = 'B-';
  else if (cbsScore >= 1100) grade = 'C';

  // Calculate estimated max loan
  const estimatedMaxLoan = calculateEstimatedMaxLoan(appData, monthlyIncome);

  // Add warnings for edge cases
  if (!appData.loans || appData.loans.length === 0) {
    warnings.push('Limited credit history');
  }
  if (!monthlyIncome || monthlyIncome <= 0) {
    warnings.push('Add monthly income to calculate estimated max loan');
  }

  return {
    score: cbsScore,
    grade,
    paymentHistoryScore,
    amountsOwedScore,
    lengthOfCreditScore,
    creditMixScore,
    newCreditScore,
    estimatedMaxLoan,
    lastUpdated: new Date(),
    warnings,
  };
}

/**
 * Get credit score details for display
 */
export function getCreditScoreDetails(appData: AppData, monthlyIncome: number = 0) {
  return calculateCBSScore(appData, monthlyIncome);
}
