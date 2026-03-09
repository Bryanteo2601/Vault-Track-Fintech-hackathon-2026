/**
 * Age-Based Financial Advice Engine
 * 
 * Provides age-dynamic financial guidance aligned with Singapore's MoneySense framework.
 * Calculates user age from birthdate and determines financial life stage with personalized strategies.
 */

export type FinancialLifeStage = 'early_adulthood' | 'early_career' | 'family_building' | 'pre_retirement' | 'retirement';

export interface FinancialLifeStageInfo {
  stage: FinancialLifeStage;
  ageRange: string;
  minAge: number;
  maxAge: number;
  displayName: string;
  primaryFocus: string[];
  investmentStrategy: string[];
  keyFinancialPriorities: string[];
  educationTopics: string[];
  riskProfile: 'aggressive' | 'moderate-aggressive' | 'moderate' | 'conservative-moderate' | 'conservative';
  allocationTargets: {
    equities: { min: number; max: number };
    bonds: { min: number; max: number };
    cash: { min: number; max: number };
  };
  moneySenseReferences: string[];
}

/**
 * Calculate user age from birthdate
 * @param birthDate - Birth date string in format YYYY-MM-DD or Date object
 * @returns Age in years (floored)
 */
export function calculateAge(birthDate: string | Date | null | undefined): number {
  if (!birthDate) return 0;

  let date: Date;
  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else {
    date = birthDate;
  }

  if (isNaN(date.getTime())) return 0;

  const today = new Date();
  const ageDiff = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return ageDiff - 1;
  }

  return ageDiff;
}

/**
 * Determine financial life stage based on age
 * @param age - User age in years
 * @returns Financial life stage information
 */
export function getFinancialLifeStageByAge(age: number): FinancialLifeStageInfo {
  if (age < 18) {
    return LIFE_STAGES['early_adulthood'];
  } else if (age <= 25) {
    return LIFE_STAGES['early_adulthood'];
  } else if (age <= 35) {
    return LIFE_STAGES['early_career'];
  } else if (age <= 45) {
    return LIFE_STAGES['family_building'];
  } else if (age <= 55) {
    return LIFE_STAGES['pre_retirement'];
  } else {
    return LIFE_STAGES['retirement'];
  }
}

/**
 * Get financial life stage from birthdate
 * @param birthDate - Birth date string or Date object
 * @returns Financial life stage information
 */
export function getFinancialLifeStage(birthDate: string | Date | null | undefined): FinancialLifeStageInfo {
  const age = calculateAge(birthDate);
  return getFinancialLifeStageByAge(age);
}

/**
 * Get all financial life stage definitions
 */
const LIFE_STAGES: Record<FinancialLifeStage, FinancialLifeStageInfo> = {
  early_adulthood: {
    stage: 'early_adulthood',
    ageRange: '18–25',
    minAge: 18,
    maxAge: 25,
    displayName: 'Early Adulthood',
    primaryFocus: [
      'Financial literacy and budgeting',
      'Building emergency savings',
      'Starting to invest early',
      'Avoiding high-interest debt',
    ],
    investmentStrategy: [
      'Start investing early to benefit from compound growth',
      'Higher risk tolerance allows for growth-focused assets',
      'Invest in diversified ETFs and equity index funds',
      'Focus on long-term wealth building',
    ],
    keyFinancialPriorities: [
      'Build emergency fund (3–6 months of expenses)',
      'Start investing small amounts regularly',
      'Avoid high-interest debt and credit card debt',
      'Develop good financial habits early',
    ],
    educationTopics: [
      'Budgeting Basics',
      'Building Emergency Savings',
      'Beginner Investing Guide',
      'Understanding Debt and Credit',
    ],
    riskProfile: 'aggressive',
    allocationTargets: {
      equities: { min: 70, max: 85 },
      bonds: { min: 10, max: 20 },
      cash: { min: 5, max: 10 },
    },
    moneySenseReferences: [
      'https://www.moneysense.gov.sg/managing-your-money/',
      'https://www.moneysense.gov.sg/investments/types-of-investments/',
    ],
  },

  early_career: {
    stage: 'early_career',
    ageRange: '26–35',
    minAge: 26,
    maxAge: 35,
    displayName: 'Early Career',
    primaryFocus: [
      'Asset accumulation and wealth building',
      'Starting long-term investments',
      'Insurance protection',
      'Early retirement planning',
    ],
    investmentStrategy: [
      'Build diversified portfolio with equities and bonds',
      'Long-term growth investments through regular contributions',
      'Maximize CPF contributions for tax benefits',
      'Consider diversification into REITs and bonds',
    ],
    keyFinancialPriorities: [
      'Build investment portfolio through regular investing',
      'Secure adequate insurance protection (life and critical illness)',
      'Start retirement planning early',
      'Manage debt responsibly while building wealth',
    ],
    educationTopics: [
      'Investment Diversification',
      'Insurance Basics and Protection',
      'CPF Contribution Strategies',
      'Managing Debt Responsibly',
    ],
    riskProfile: 'moderate-aggressive',
    allocationTargets: {
      equities: { min: 65, max: 80 },
      bonds: { min: 15, max: 25 },
      cash: { min: 5, max: 10 },
    },
    moneySenseReferences: [
      'https://www.moneysense.gov.sg/managing-your-money/',
      'https://www.moneysense.gov.sg/investments/types-of-investments/',
      'https://www.moneysense.gov.sg/insurance-basics/',
    ],
  },

  family_building: {
    stage: 'family_building',
    ageRange: '36–45',
    minAge: 36,
    maxAge: 45,
    displayName: 'Family / Asset Building',
    primaryFocus: [
      'Wealth accumulation and property planning',
      'Insurance coverage for family protection',
      'Children\'s financial planning',
      'Retirement savings acceleration',
    ],
    investmentStrategy: [
      'Diversified portfolio balancing growth and stability',
      'Include bonds and stable assets for risk management',
      'Maximize CPF contributions and investment',
      'Consider property as part of wealth building',
    ],
    keyFinancialPriorities: [
      'Accelerate retirement savings',
      'Ensure CPF contributions are adequate',
      'Maintain comprehensive life and critical illness insurance',
      'Plan for children\'s education expenses',
    ],
    educationTopics: [
      'Insurance Protection for Families',
      'Financial Planning for Children\'s Education',
      'Investment Diversification',
      'CPF Retirement Planning',
    ],
    riskProfile: 'moderate',
    allocationTargets: {
      equities: { min: 60, max: 70 },
      bonds: { min: 20, max: 30 },
      cash: { min: 10, max: 15 },
    },
    moneySenseReferences: [
      'https://www.moneysense.gov.sg/insurance-basics/',
      'https://www.moneysense.gov.sg/managing-your-money/',
      'https://www.moneysense.gov.sg/investments/types-of-investments/',
    ],
  },

  pre_retirement: {
    stage: 'pre_retirement',
    ageRange: '46–55',
    minAge: 46,
    maxAge: 55,
    displayName: 'Pre-Retirement Preparation',
    primaryFocus: [
      'Retirement readiness assessment',
      'CPF planning and optimization',
      'Portfolio risk reduction',
      'Healthcare planning',
    ],
    investmentStrategy: [
      'Gradually shift to balanced portfolio',
      'Increase allocation to bonds and stable assets',
      'Reduce exposure to volatile equities',
      'Focus on capital preservation while maintaining growth',
    ],
    keyFinancialPriorities: [
      'Ensure CPF retirement sum is on track',
      'Reduce financial risk in investment portfolio',
      'Strengthen healthcare and insurance protection',
      'Plan for healthcare costs in retirement',
    ],
    educationTopics: [
      'CPF Retirement Planning',
      'Long-term Healthcare Planning',
      'Portfolio Risk Management',
      'Retirement Income Planning',
    ],
    riskProfile: 'conservative-moderate',
    allocationTargets: {
      equities: { min: 40, max: 55 },
      bonds: { min: 35, max: 45 },
      cash: { min: 10, max: 20 },
    },
    moneySenseReferences: [
      'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      'https://www.moneysense.gov.sg/managing-your-money/',
    ],
  },

  retirement: {
    stage: 'retirement',
    ageRange: '56+',
    minAge: 56,
    maxAge: 150,
    displayName: 'Retirement / Wealth Preservation',
    primaryFocus: [
      'Income stability and preservation',
      'Healthcare and long-term care planning',
      'Legacy planning',
      'Sustainable withdrawal strategy',
    ],
    investmentStrategy: [
      'Conservative investments focused on income generation',
      'Prioritize capital preservation over growth',
      'Include dividend-paying stocks and bonds',
      'Maintain adequate liquidity for healthcare expenses',
    ],
    keyFinancialPriorities: [
      'Optimize CPF LIFE payouts for retirement income',
      'Ensure adequate healthcare coverage',
      'Plan estate and legacy for heirs',
      'Maintain sustainable withdrawal strategy',
    ],
    educationTopics: [
      'CPF LIFE Payouts',
      'Retirement Income Planning',
      'Estate Planning Basics',
      'Healthcare Planning in Retirement',
    ],
    riskProfile: 'conservative',
    allocationTargets: {
      equities: { min: 20, max: 35 },
      bonds: { min: 40, max: 50 },
      cash: { min: 20, max: 30 },
    },
    moneySenseReferences: [
      'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      'https://www.moneysense.gov.sg/managing-your-money/',
    ],
  },
};

/**
 * Get all life stage definitions
 */
export function getAllLifeStages(): FinancialLifeStageInfo[] {
  return [
    LIFE_STAGES['early_adulthood'],
    LIFE_STAGES['early_career'],
    LIFE_STAGES['family_building'],
    LIFE_STAGES['pre_retirement'],
    LIFE_STAGES['retirement'],
  ];
}
