/**
 * CPF Constants and Configuration
 * Singapore Central Provident Fund (CPF) values and rates for 2026
 * Source: CPF Board Singapore official rates and retirement sums
 */

// ─── Retirement Sums (2026) ───────────────────────────────────────────────────
// These are the official CPF retirement sum targets for 2026
export const CPF_RETIREMENT_SUMS = {
  // Basic Retirement Sum - minimum to receive monthly payouts
  BRS: 180000,
  // Full Retirement Sum - benchmark retirement target (recommended)
  FRS: 360000,
  // Enhanced Retirement Sum - for higher monthly payouts
  ERS: 540000,
} as const;

// ─── Interest Rates (2026) ─────────────────────────────────────────────────────
// CPF interest rates vary by account and balance level
export const CPF_INTEREST_RATES = {
  // OA (Ordinary Account) - base rate for first SGD 60,000
  OA_BASE: 2.5, // %
  // OA - additional 1% for balance above SGD 60,000
  OA_ADDITIONAL: 1.0, // %
  // SMRA (Special/MediSave/Retirement Account) - base rate
  SMRA_BASE: 4.0, // %
  // SMRA - additional 1% for balance above SGD 60,000
  SMRA_ADDITIONAL: 1.0, // %
} as const;

// ─── Healthcare Limits ─────────────────────────────────────────────────────────
export const CPF_HEALTHCARE = {
  // Basic Healthcare Sum - minimum MediSave balance to maintain
  BHS: 70500,
  // Withdrawal limit for MediSave per year
  MA_WITHDRAWAL_LIMIT: 1050,
} as const;

// ─── Age Milestones ───────────────────────────────────────────────────────────
export const CPF_AGE_MILESTONES = {
  // Age when RA is created and SA is closed
  RA_CREATION_AGE: 55,
  // Age when CPF payout eligibility begins
  PAYOUT_ELIGIBILITY_AGE: 65,
  // Age when CPF LIFE payouts start automatically if not started earlier
  MANDATORY_PAYOUT_AGE: 70,
  // Earliest age to withdraw from OA for housing (first-time buyer)
  HOUSING_WITHDRAWAL_AGE: 35,
} as const;

// ─── CPF LIFE Payout Rates (2026) ──────────────────────────────────────────────
// Monthly payout amounts based on RA balance and payout start age
// These are estimates - actual rates depend on CPF LIFE product chosen
export const CPF_LIFE_PAYOUTS = {
  // Estimated monthly payout per SGD 100,000 in RA if starting at age 65
  PAYOUT_PER_100K_AT_65: 420, // SGD
  // Estimated monthly payout per SGD 100,000 in RA if starting at age 70
  PAYOUT_PER_100K_AT_70: 560, // SGD (higher due to deferment bonus)
  // Deferment bonus per year (approximately 7-8% per year)
  ANNUAL_DEFERMENT_BONUS: 0.075, // 7.5%
} as const;

// ─── CPF Contribution Rates (2026) ─────────────────────────────────────────────
// Employer and employee contribution rates by age group
export const CPF_CONTRIBUTION_RATES = {
  // Age 35 and below
  UNDER_35: {
    employee: 0.20, // 20% of salary
    employer: 0.17, // 17% of salary
  },
  // Age 35-50
  AGE_35_50: {
    employee: 0.20, // 20% of salary
    employer: 0.13, // 13% of salary
  },
  // Age 50-55
  AGE_50_55: {
    employee: 0.20, // 20% of salary
    employer: 0.075, // 7.5% of salary
  },
  // Age 55-60
  AGE_55_60: {
    employee: 0.13, // 13% of salary
    employer: 0.04, // 4% of salary
  },
  // Age 60-65
  AGE_60_65: {
    employee: 0.075, // 7.5% of salary
    employer: 0.04, // 4% of salary
  },
  // Age 65 and above
  OVER_65: {
    employee: 0.05, // 5% of salary
    employer: 0.025, // 2.5% of salary
  },
} as const;

// ─── Account Descriptions ─────────────────────────────────────────────────────
export const CPF_ACCOUNT_DESCRIPTIONS = {
  OA: {
    name: 'Ordinary Account (OA)',
    icon: '💼',
    color: '#1A3C5E',
    description: 'Used mainly for housing, approved investments, education, and insurance. Earns base CPF OA interest rate.',
    uses: [
      'Housing (HDB/private property purchases)',
      'Approved investments (stocks, bonds, unit trusts)',
      'Education expenses',
      'Insurance premiums',
      'Healthcare expenses',
    ],
  },
  SA: {
    name: 'Special Account (SA)',
    icon: '🏦',
    color: '#2A5C8E',
    description: 'Meant mainly for retirement savings before age 55. Earns higher SMRA interest rate.',
    uses: [
      'Retirement savings',
      'Long-term investment',
      'Healthcare expenses (limited)',
    ],
    note: 'Closed at age 55. Balance is transferred to RA.',
  },
  MA: {
    name: 'MediSave Account (MA)',
    icon: '🏥',
    color: '#00C896',
    description: 'For healthcare expenses and approved medical insurance. Earns SMRA interest rate.',
    uses: [
      'Hospital bills',
      'Medical insurance premiums',
      'Approved outpatient treatment',
      'Approved medical devices',
    ],
  },
  RA: {
    name: 'Retirement Account (RA)',
    icon: '🎯',
    color: '#F59E0B',
    description: 'Created at age 55 from SA first, then OA, up to the Full Retirement Sum. Used for retirement payouts.',
    uses: [
      'CPF LIFE payouts (monthly retirement income)',
      'Healthcare expenses',
      'Long-term retirement planning',
    ],
    note: 'Created automatically at age 55.',
  },
} as const;

// ─── Retirement Milestone Timeline ─────────────────────────────────────────────
export const CPF_MILESTONES = [
  {
    age: 55,
    title: 'Retirement Account Created',
    description: 'RA is created from SA first, then OA, up to the Full Retirement Sum. SA is closed.',
    icon: '🎯',
  },
  {
    age: 65,
    title: 'CPF Payout Eligibility',
    description: 'You can start receiving monthly CPF LIFE payouts.',
    icon: '💰',
  },
  {
    age: 70,
    title: 'Automatic Payout Start',
    description: 'If you have not started CPF LIFE payouts, they will start automatically.',
    icon: '⏰',
  },
] as const;

// ─── CPF Account Types ─────────────────────────────────────────────────────────
export type CPFAccountType = 'OA' | 'SA' | 'MA' | 'RA';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get CPF contribution rates based on age
 */
export function getCPFContributionRateByAge(age: number) {
  if (age <= 35) return CPF_CONTRIBUTION_RATES.UNDER_35;
  if (age <= 50) return CPF_CONTRIBUTION_RATES.AGE_35_50;
  if (age <= 55) return CPF_CONTRIBUTION_RATES.AGE_50_55;
  if (age <= 60) return CPF_CONTRIBUTION_RATES.AGE_55_60;
  if (age <= 65) return CPF_CONTRIBUTION_RATES.AGE_60_65;
  return CPF_CONTRIBUTION_RATES.OVER_65;
}

/**
 * Get OA interest rate based on balance
 */
export function getOAInterestRate(balance: number): number {
  if (balance <= 60000) {
    return CPF_INTEREST_RATES.OA_BASE;
  }
  return CPF_INTEREST_RATES.OA_BASE + CPF_INTEREST_RATES.OA_ADDITIONAL;
}

/**
 * Get SMRA interest rate based on balance
 */
export function getSMRAInterestRate(balance: number): number {
  if (balance <= 60000) {
    return CPF_INTEREST_RATES.SMRA_BASE;
  }
  return CPF_INTEREST_RATES.SMRA_BASE + CPF_INTEREST_RATES.SMRA_ADDITIONAL;
}

/**
 * Check if user should have SA (age < 55)
 */
export function shouldHaveSA(age: number): boolean {
  return age < CPF_AGE_MILESTONES.RA_CREATION_AGE;
}

/**
 * Check if user should have RA (age >= 55)
 */
export function shouldHaveRA(age: number): boolean {
  return age >= CPF_AGE_MILESTONES.RA_CREATION_AGE;
}

/**
 * Get CPF account description by type
 */
export function getCPFAccountDescription(type: CPFAccountType) {
  return CPF_ACCOUNT_DESCRIPTIONS[type];
}
