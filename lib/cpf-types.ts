/**
 * CPF (Central Provident Fund) - Singapore
 * Types and interfaces for CPF account management
 */

export interface CPFAccount {
  id: string;
  accountType: 'OA' | 'SA' | 'MA'; // Ordinary Account, Special Account, Medisave Account
  balance: number;
  lastUpdated: Date;
  contributions: CPFContribution[];
  withdrawals: CPFWithdrawal[];
}

export interface CPFContribution {
  id: string;
  date: Date;
  amount: number;
  employerContribution: number;
  employeeContribution: number;
  month: string; // YYYY-MM format
}

export interface CPFWithdrawal {
  id: string;
  date: Date;
  amount: number;
  reason: 'retirement' | 'housing' | 'healthcare' | 'education' | 'other';
  description: string;
}

export interface CPFData {
  oa: CPFAccount; // Ordinary Account - for housing, education, investment
  sa: CPFAccount; // Special Account - for retirement savings
  ma: CPFAccount; // Medisave Account - for healthcare
}

export interface CPFProjection {
  year: number;
  oaProjected: number;
  saProjected: number;
  maProjected: number;
  totalProjected: number;
}

export interface CPFWithdrawalSimulation {
  scenario: string;
  monthlyWithdrawal: number;
  yearsOfCoverage: number;
  remainingBalance: number;
  recommendations: string[];
}

/**
 * CPF Contribution Limits and Rates (2024)
 * Source: CPF Board Singapore
 */
export const CPF_RATES_2024 = {
  employeeContributionRate: 0.20, // 20% of ordinary wages
  employerContributionRate: 0.17, // 17% of ordinary wages
  oaAllocationRate: 0.60, // 60% to OA
  saAllocationRate: 0.15, // 15% to SA
  maAllocationRate: 0.08, // 8% to MA
  additionalVoluntaryContribution: 0.02, // 2% additional voluntary
};

export const CPF_WITHDRAWAL_LIMITS = {
  retirementAge: 65,
  earlyWithdrawalAge: 55,
  minimumSumForRetirement: 181500, // 2024 figure
  maMinimumBalance: 54500, // 2024 figure
};

/**
 * Calculate CPF balance projection
 */
export function projectCPFBalance(
  currentBalance: number,
  annualContribution: number,
  annualInterestRate: number = 0.025, // Average CPF interest rate
  years: number = 10
): CPFProjection[] {
  const projections: CPFProjection[] = [];
  let balance = currentBalance;

  for (let year = 0; year < years; year++) {
    balance = balance * (1 + annualInterestRate) + annualContribution;
    projections.push({
      year: new Date().getFullYear() + year,
      oaProjected: balance * CPF_RATES_2024.oaAllocationRate,
      saProjected: balance * CPF_RATES_2024.saAllocationRate,
      maProjected: balance * CPF_RATES_2024.maAllocationRate,
      totalProjected: balance,
    });
  }

  return projections;
}

/**
 * Calculate CPF adequacy for retirement
 */
export function calculateRetirementAdequacy(
  saBalance: number,
  oaBalance: number,
  age: number,
  monthlyExpenses: number
): {
  isAdequate: boolean;
  yearsOfCoverage: number;
  shortfall: number;
  recommendations: string[];
} {
  const retirementAge = CPF_WITHDRAWAL_LIMITS.retirementAge;
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const minimumSum = CPF_WITHDRAWAL_LIMITS.minimumSumForRetirement;

  const totalRetirementFunds = saBalance + Math.max(0, oaBalance - 40000); // Keep 40k in OA
  const monthlyIncome = totalRetirementFunds / (20 * 12); // 20-year drawdown
  const yearsOfCoverage = totalRetirementFunds / (monthlyExpenses * 12);
  const shortfall = Math.max(0, monthlyExpenses - monthlyIncome);

  const recommendations: string[] = [];

  if (totalRetirementFunds < minimumSum) {
    recommendations.push(`Your CPF balance is below the minimum sum of SGD ${minimumSum.toLocaleString()}. Increase contributions to meet retirement goals.`);
  }

  if (yearsOfCoverage < 20) {
    recommendations.push(`Your CPF covers only ${yearsOfCoverage.toFixed(1)} years of retirement. Consider increasing savings or reducing expenses.`);
  }

  if (yearsToRetirement > 0 && yearsToRetirement <= 5) {
    recommendations.push('You are approaching retirement age. Review your CPF withdrawal strategy and healthcare coverage.');
  }

  if (shortfall > 0) {
    recommendations.push(`Monthly shortfall: SGD ${shortfall.toLocaleString()}. Plan additional retirement income sources.`);
  }

  return {
    isAdequate: yearsOfCoverage >= 20 && totalRetirementFunds >= minimumSum,
    yearsOfCoverage,
    shortfall,
    recommendations,
  };
}

/**
 * Calculate CPF contribution for given salary
 */
export function calculateCPFContribution(monthlySalary: number): {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  oaAllocation: number;
  saAllocation: number;
  maAllocation: number;
} {
  const employeeContribution = monthlySalary * CPF_RATES_2024.employeeContributionRate;
  const employerContribution = monthlySalary * CPF_RATES_2024.employerContributionRate;
  const totalContribution = employeeContribution + employerContribution;

  const oaAllocation = totalContribution * CPF_RATES_2024.oaAllocationRate;
  const saAllocation = totalContribution * CPF_RATES_2024.saAllocationRate;
  const maAllocation = totalContribution * CPF_RATES_2024.maAllocationRate;

  return {
    employeeContribution,
    employerContribution,
    totalContribution,
    oaAllocation,
    saAllocation,
    maAllocation,
  };
}
