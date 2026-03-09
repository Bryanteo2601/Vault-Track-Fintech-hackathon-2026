/**
 * CPF Calculation Utilities
 * Retirement projections, payout estimators, and insights generation
 */

import {
  CPF_RETIREMENT_SUMS,
  CPF_LIFE_PAYOUTS,
  CPF_AGE_MILESTONES,
  CPF_HEALTHCARE,
  getOAInterestRate,
  getSMRAInterestRate,
  shouldHaveSA,
  shouldHaveRA,
} from './cpf-constants';

export interface CPFUserData {
  age: number;
  oa: number; // Ordinary Account balance
  sa: number; // Special Account balance
  ma: number; // MediSave Account balance
  ra: number; // Retirement Account balance
  annualSalary?: number; // Optional for contribution calculations
}

export interface RetirementProjection {
  currentRA: number;
  projectedRAAt55: number;
  projectedRAAt65: number;
  projectedRAAt70: number;
  monthlyPayoutAt65: number;
  monthlyPayoutAt70: number;
  payoutDifference: number;
  yearsToFRS: number;
  yearsToERS: number;
  retirementReadiness: 'below_brs' | 'brs_to_frs' | 'frs_to_ers' | 'above_ers';
}

export interface CPFInsight {
  type: 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  icon: string;
}

/**
 * Calculate total CPF balance across all accounts
 */
export function calculateTotalCPF(data: CPFUserData): number {
  return data.oa + data.sa + data.ma + data.ra;
}

/**
 * Calculate retirement account balance at a given age
 * Assumes annual growth based on interest rates
 */
export function projectRABalance(
  data: CPFUserData,
  targetAge: number,
  topUpAmount: number = 0
): number {
  let currentRA = data.ra;
  let currentOA = data.oa;
  let currentSA = data.sa;
  let currentMA = data.ma;
  let currentAge = data.age;

  // If user is below 55, project to 55 first
  if (currentAge < 55) {
    const yearsTo55 = 55 - currentAge;
    for (let i = 0; i < yearsTo55; i++) {
      // OA grows at base rate
      const oaRate = getOAInterestRate(currentOA) / 100;
      currentOA = currentOA * (1 + oaRate);

      // SA grows at SMRA rate
      const saRate = getSMRAInterestRate(currentSA) / 100;
      currentSA = currentSA * (1 + saRate);

      // MA grows at SMRA rate
      const maRate = getSMRAInterestRate(currentMA) / 100;
      currentMA = currentMA * (1 + maRate);
    }

    // At age 55, transfer SA to RA (up to FRS)
    const transferAmount = Math.min(currentSA, CPF_RETIREMENT_SUMS.FRS);
    currentRA = currentRA + transferAmount;
    currentSA = 0; // SA is closed
  }

  // Project RA from current age to target age
  const yearsToTarget = Math.max(0, targetAge - Math.max(currentAge, 55));
  for (let i = 0; i < yearsToTarget; i++) {
    const raRate = getSMRAInterestRate(currentRA) / 100;
    currentRA = currentRA * (1 + raRate);
  }

  // Add top-up amount
  currentRA += topUpAmount;

  return currentRA;
}

/**
 * Calculate estimated monthly CPF LIFE payout
 */
export function calculateMonthlyPayout(raBalance: number, startAge: number): number {
  if (raBalance < CPF_RETIREMENT_SUMS.BRS) {
    return 0; // Not eligible for payouts
  }

  const yearsDeferred = Math.max(0, startAge - CPF_AGE_MILESTONES.PAYOUT_ELIGIBILITY_AGE);
  const defermentBonus = Math.pow(1 + CPF_LIFE_PAYOUTS.ANNUAL_DEFERMENT_BONUS, yearsDeferred);

  const payoutRate =
    startAge >= CPF_AGE_MILESTONES.MANDATORY_PAYOUT_AGE
      ? CPF_LIFE_PAYOUTS.PAYOUT_PER_100K_AT_70
      : CPF_LIFE_PAYOUTS.PAYOUT_PER_100K_AT_65;

  return Math.round((raBalance / 100000) * payoutRate * defermentBonus);
}

/**
 * Generate retirement projection for user
 */
export function generateRetirementProjection(
  data: CPFUserData,
  topUpAmount: number = 0
): RetirementProjection {
  const currentRA = data.ra;
  const projectedRAAt55 = data.age >= 55 ? currentRA : projectRABalance(data, 55, 0);
  const projectedRAAt65 = projectRABalance(data, 65, topUpAmount);
  const projectedRAAt70 = projectRABalance(data, 70, topUpAmount);

  const monthlyPayoutAt65 = calculateMonthlyPayout(projectedRAAt65, 65);
  const monthlyPayoutAt70 = calculateMonthlyPayout(projectedRAAt70, 70);
  const payoutDifference = monthlyPayoutAt70 - monthlyPayoutAt65;

  const yearsToFRS = projectedRAAt65 < CPF_RETIREMENT_SUMS.FRS
    ? Math.ceil((CPF_RETIREMENT_SUMS.FRS - projectedRAAt65) / 20000) // Rough estimate
    : 0;

  const yearsToERS = projectedRAAt65 < CPF_RETIREMENT_SUMS.ERS
    ? Math.ceil((CPF_RETIREMENT_SUMS.ERS - projectedRAAt65) / 20000) // Rough estimate
    : 0;

  let retirementReadiness: 'below_brs' | 'brs_to_frs' | 'frs_to_ers' | 'above_ers';
  if (projectedRAAt65 < CPF_RETIREMENT_SUMS.BRS) {
    retirementReadiness = 'below_brs';
  } else if (projectedRAAt65 < CPF_RETIREMENT_SUMS.FRS) {
    retirementReadiness = 'brs_to_frs';
  } else if (projectedRAAt65 < CPF_RETIREMENT_SUMS.ERS) {
    retirementReadiness = 'frs_to_ers';
  } else {
    retirementReadiness = 'above_ers';
  }

  return {
    currentRA,
    projectedRAAt55,
    projectedRAAt65,
    projectedRAAt70,
    monthlyPayoutAt65,
    monthlyPayoutAt70,
    payoutDifference,
    yearsToFRS,
    yearsToERS,
    retirementReadiness,
  };
}

/**
 * Generate smart insights based on user's CPF status
 */
export function generateCPFInsights(data: CPFUserData, projection: RetirementProjection): CPFInsight[] {
  const insights: CPFInsight[] = [];
  const totalCPF = calculateTotalCPF(data);

  // Insight 1: Retirement readiness
  if (projection.retirementReadiness === 'below_brs') {
    insights.push({
      type: 'warning',
      title: 'Below Basic Retirement Sum',
      description: `Your projected RA at 65 is SGD ${projection.projectedRAAt65.toLocaleString()}, below the BRS of SGD ${CPF_RETIREMENT_SUMS.BRS.toLocaleString()}. You may not be eligible for CPF LIFE payouts.`,
      icon: '⚠️',
    });
  } else if (projection.retirementReadiness === 'brs_to_frs') {
    insights.push({
      type: 'opportunity',
      title: `SGD ${(CPF_RETIREMENT_SUMS.FRS - projection.projectedRAAt65).toLocaleString()} to Full Retirement Sum`,
      description: `You need SGD ${(CPF_RETIREMENT_SUMS.FRS - projection.projectedRAAt65).toLocaleString()} more to reach the FRS. Consider topping up your SA or RA.`,
      icon: '📈',
    });
  } else if (projection.retirementReadiness === 'above_ers') {
    insights.push({
      type: 'info',
      title: 'Excellent Retirement Savings',
      description: `Your projected RA exceeds the ERS. You are well-positioned for a comfortable retirement with higher monthly payouts.`,
      icon: '🏆',
    });
  }

  // Insight 2: Deferment opportunity
  if (projection.payoutDifference > 0 && data.age >= CPF_AGE_MILESTONES.PAYOUT_ELIGIBILITY_AGE) {
    insights.push({
      type: 'opportunity',
      title: `Defer to 70 for +SGD ${projection.payoutDifference} monthly`,
      description: `Deferring your CPF LIFE payout from 65 to 70 increases your monthly payout by SGD ${projection.payoutDifference} (${((projection.payoutDifference / projection.monthlyPayoutAt65) * 100).toFixed(0)}% increase).`,
      icon: '⏳',
    });
  }

  // Insight 3: MediSave balance
  if (data.ma < CPF_HEALTHCARE.BHS) {
    insights.push({
      type: 'warning',
      title: `MediSave Below Basic Healthcare Sum`,
      description: `Your MA is SGD ${data.ma.toLocaleString()}, below the BHS of SGD ${CPF_HEALTHCARE.BHS.toLocaleString()}. Consider topping up for healthcare protection.`,
      icon: '🏥',
    });
  }

  // Insight 4: OA balance for housing
  if (data.age >= CPF_AGE_MILESTONES.HOUSING_WITHDRAWAL_AGE && data.oa > 0) {
    insights.push({
      type: 'info',
      title: `OA Available for Housing`,
      description: `You have SGD ${data.oa.toLocaleString()} in OA available for housing purchases, education, or approved investments.`,
      icon: '🏠',
    });
  }

  // Insight 5: SA closure warning (age 55)
  if (data.age === 54 && shouldHaveSA(data.age)) {
    insights.push({
      type: 'warning',
      title: 'SA Will Close Next Year',
      description: `Your Special Account will close at age 55. Balance will be transferred to RA (up to FRS). Excess will remain in OA.`,
      icon: '📋',
    });
  }

  // Insight 6: Age milestone
  if (data.age === 64) {
    insights.push({
      type: 'info',
      title: 'CPF Payout Eligibility Next Year',
      description: `At age 65, you can start receiving monthly CPF LIFE payouts. Plan your retirement strategy now.`,
      icon: '🎯',
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
}

/**
 * Calculate CPF contribution based on salary and age
 */
export function calculateCPFContribution(
  annualSalary: number,
  age: number
): { employee: number; employer: number; total: number } {
  // Contribution is capped at monthly salary of SGD 6,000
  const cappedMonthlySalary = Math.min(annualSalary / 12, 6000);
  const cappedAnnualSalary = cappedMonthlySalary * 12;

  // Get rates based on age
  let employeeRate = 0.2;
  let employerRate = 0.17;

  if (age > 35 && age <= 50) {
    employerRate = 0.13;
  } else if (age > 50 && age <= 55) {
    employerRate = 0.075;
  } else if (age > 55 && age <= 60) {
    employeeRate = 0.13;
    employerRate = 0.04;
  } else if (age > 60 && age <= 65) {
    employeeRate = 0.075;
    employerRate = 0.04;
  } else if (age > 65) {
    employeeRate = 0.05;
    employerRate = 0.025;
  }

  const employee = cappedAnnualSalary * employeeRate;
  const employer = cappedAnnualSalary * employerRate;

  return {
    employee: Math.round(employee),
    employer: Math.round(employer),
    total: Math.round(employee + employer),
  };
}

/**
 * Calculate years until reaching a retirement sum target
 */
export function yearsToReachTarget(
  currentRA: number,
  targetAmount: number,
  annualContribution: number = 0
): number {
  if (currentRA >= targetAmount) return 0;

  const raRate = getSMRAInterestRate(currentRA) / 100;
  let balance = currentRA;
  let years = 0;

  while (balance < targetAmount && years < 50) {
    balance = balance * (1 + raRate) + annualContribution;
    years++;
  }

  return years;
}
