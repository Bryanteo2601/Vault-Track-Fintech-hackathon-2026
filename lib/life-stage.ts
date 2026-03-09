import { LifeStage, AgeRange, UserProfile, AppData } from './types';

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Convert age to age range
 */
export function getAgeRange(age: number): AgeRange {
  if (age >= 65) return '65+';
  if (age >= 55) return '55-64';
  if (age >= 35) return '35-59';
  if (age >= 25) return '25-34';
  return '19-29';
}

/**
 * Determine life stage based on age, dependents, and aged parents
 */
export function determineLifeStage(
  age: number,
  hasDependents: boolean = false,
  hasAgedParents: boolean = false
): LifeStage {
  if (age >= 65) return 'golden_years';
  if (age >= 55) return 'pre_retiree';
  if (age >= 35) {
    if (hasDependents && hasAgedParents) return 'dual_responsibility';
    if (hasAgedParents) return 'supporting_parents';
  }
  if (age >= 25) return 'starting_family';
  return 'fresh_entrant';
}

/**
 * Get or create user profile from AppData
 */
export function getUserProfile(appData: AppData): UserProfile {
  if (appData.userProfile) {
    return appData.userProfile;
  }

  // Default profile (no birth date set yet)
  return {
    birthDate: undefined,
    ageRange: undefined,
    lifeStage: undefined,
    hasDependents: false,
    hasAgedParents: false,
  };
}

/**
 * Update user profile with calculated life stage
 */
export function updateUserProfile(
  appData: AppData,
  birthDate: string,
  hasDependents?: boolean,
  hasAgedParents?: boolean
): AppData {
  const age = calculateAge(birthDate);
  const ageRange = getAgeRange(age);
  const lifeStage = determineLifeStage(
    age,
    hasDependents ?? appData.userProfile?.hasDependents ?? false,
    hasAgedParents ?? appData.userProfile?.hasAgedParents ?? false
  );

  return {
    ...appData,
    userProfile: {
      birthDate,
      ageRange,
      lifeStage,
      hasDependents: hasDependents ?? appData.userProfile?.hasDependents ?? false,
      hasAgedParents: hasAgedParents ?? appData.userProfile?.hasAgedParents ?? false,
    },
  };
}

/**
 * Get life stage display name
 */
export function getLifeStageName(lifeStage: LifeStage): string {
  const names: Record<LifeStage, string> = {
    fresh_entrant: 'Fresh Entrant to Workforce',
    starting_family: 'Working Adult Starting Family',
    supporting_parents: 'Working Adult Supporting Aged Parents',
    dual_responsibility: 'Parent with Children & Aging Parents',
    pre_retiree: 'Pre-Retiree',
    golden_years: 'Golden Years',
  };
  return names[lifeStage];
}

/**
 * Get life stage description
 */
export function getLifeStageDescription(lifeStage: LifeStage): string {
  const descriptions: Record<LifeStage, string> = {
    fresh_entrant: 'Build your foundation: emergency fund, start investing, understand taxes',
    starting_family: 'Protect your family: adequate insurance, education planning, savings growth',
    supporting_parents: 'Balance dual responsibilities: maximize retirement, plan parent care',
    dual_responsibility: 'Manage competing obligations: optimize cash flow, protect dependents',
    pre_retiree: 'Prepare for retirement: maximize savings, reduce risk, plan withdrawals',
    golden_years: 'Protect capital: generate income, manage healthcare, plan longevity',
  };
  return descriptions[lifeStage];
}

/**
 * Get recommended financial goals for life stage
 */
export function getRecommendedGoals(lifeStage: LifeStage): string[] {
  const goals: Record<LifeStage, string[]> = {
    fresh_entrant: [
      'Build 1-3 months emergency fund',
      'Start investing in low-cost index funds',
      'Maximize CPF contributions for tax benefits',
      'Understand and file tax returns',
      'Get affordable term life insurance',
    ],
    starting_family: [
      'Build 6-month emergency fund',
      'Secure 5-10× annual income in life insurance',
      'Start child education savings plan',
      'Optimize mortgage terms',
      'Diversify investment portfolio',
    ],
    supporting_parents: [
      'Maximize CPF contributions (SGD 37,740/year)',
      'Plan long-term care for aging parents',
      'Diversify beyond CPF (20-30% in investments)',
      'Review and update life insurance',
      'Claim parent relief on taxes',
    ],
    dual_responsibility: [
      'Build 9-month emergency fund',
      'Secure 10× annual income in life insurance',
      'Plan long-term care options for parents',
      'Build balanced portfolio (60/30/10)',
      'Optimize debt strategy',
    ],
    pre_retiree: [
      'Maximize CPF contributions (target SGD 250k+)',
      'Shift to conservative allocation (40-50% stocks)',
      'Model retirement income sources',
      'Secure comprehensive health coverage',
      'Create will and designate beneficiaries',
    ],
    golden_years: [
      'Optimize CPF drawdown strategy',
      'Maintain 30-40% in dividend stocks/REITs',
      'Explore subsidized healthcare programs',
      'Plan for 30+ years of retirement',
      'Consider part-time income opportunities',
    ],
  };
  return goals[lifeStage];
}

/**
 * Get key focus areas for life stage
 */
export function getKeyFocusAreas(lifeStage: LifeStage): string[] {
  const areas: Record<LifeStage, string[]> = {
    fresh_entrant: [
      'Building financial foundation',
      'Starting investment journey',
      'Tax optimization',
      'Insurance basics',
    ],
    starting_family: [
      'Family protection',
      'Education planning',
      'Mortgage optimization',
      'Portfolio diversification',
    ],
    supporting_parents: [
      'Retirement savings maximization',
      'Parent care planning',
      'Multi-generational support',
      'Tax deduction optimization',
    ],
    dual_responsibility: [
      'Cash flow optimization',
      'Dual obligation management',
      'Comprehensive protection',
      'Long-term care planning',
    ],
    pre_retiree: [
      'Retirement readiness',
      'Risk reduction',
      'Income planning',
      'Legacy planning',
    ],
    golden_years: [
      'Capital preservation',
      'Income generation',
      'Healthcare management',
      'Longevity planning',
    ],
  };
  return areas[lifeStage];
}
