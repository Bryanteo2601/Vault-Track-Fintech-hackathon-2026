import { LifeStage, AppData } from './types';
import { UnifiedFinancialSummary } from './unified-financial-engine';

type FinancialSummary = UnifiedFinancialSummary;

/**
 * Nudge rule definition
 */
export interface NudgeRule {
  id: string;
  title: string;
  category: 'savings' | 'investment' | 'insurance' | 'tax' | 'subscriptions' | 'goals';
  priority: 'high' | 'medium' | 'low';
  applicableLifeStages: LifeStage[];
  triggerCondition: (appData: AppData, summary: FinancialSummary) => boolean;
  content: {
    headline: string;
    body: string;
    actionLabel: string;
    actionLink: string;
  };
  icon: string;
}

/**
 * Evaluated nudge result
 */
export interface EvaluatedNudge {
  id: string;
  title: string;
  content: {
    headline: string;
    body: string;
    actionLabel: string;
    actionLink: string;
  };
  category: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  displayedAt: string;
}

/**
 * All nudge rules for all life stages
 */
export const NUDGE_RULES: NudgeRule[] = [
  // Fresh Entrant (19-29)
  {
    id: 'fresh_emergency_fund',
    title: 'Build Emergency Fund',
    category: 'savings',
    priority: 'high',
    applicableLifeStages: ['fresh_entrant'],
    triggerCondition: (appData, summary) => {
      const monthlyExpenses = (summary.assetsBreakdown.banks || 0) / 12;
      return summary.assetsBreakdown.banks < monthlyExpenses;
    },
    content: {
      headline: '💰 Start Your Safety Net',
      body: 'Build 1 month of expenses in savings. This emergency fund protects you from unexpected costs like job loss or medical emergencies.',
      actionLabel: 'View Savings',
      actionLink: '/banks',
    },
    icon: '💰',
  },
  {
    id: 'fresh_cpf_topup',
    title: 'Maximize CPF Top-Up',
    category: 'tax',
    priority: 'high',
    applicableLifeStages: ['fresh_entrant'],
    triggerCondition: (appData, summary) => {
      // Simplified: trigger if has income
      return appData.bankAccounts.length > 0;
    },
    content: {
      headline: '📈 Save on Taxes with CPF',
      body: 'Voluntarily contribute to CPF for tax deductions. Every SGD 1,000 contribution saves ~SGD 220 in taxes and builds retirement savings.',
      actionLabel: 'Learn More',
      actionLink: '/cpf',
    },
    icon: '📈',
  },
  {
    id: 'fresh_start_investing',
    title: 'Begin Stock Market Investing',
    category: 'investment',
    priority: 'medium',
    applicableLifeStages: ['fresh_entrant'],
    triggerCondition: (appData) => {
      return appData.holdings.length === 0;
    },
    content: {
      headline: '🚀 Start Your Investment Journey',
      body: 'With 40+ years until retirement, you can weather market volatility. Start with low-cost index funds (STI ETF, VTSAX). Time in market beats timing the market.',
      actionLabel: 'View Investments',
      actionLink: '/investments',
    },
    icon: '🚀',
  },
  {
    id: 'fresh_insurance',
    title: 'Get Affordable Life Insurance',
    category: 'insurance',
    priority: 'medium',
    applicableLifeStages: ['fresh_entrant'],
    triggerCondition: (appData) => {
      const hasLifeInsurance = appData.insurancePolicies.some(p => p.policyType === 'life');
      return !hasLifeInsurance;
    },
    content: {
      headline: '🛡️ Protect Your Future',
      body: 'At your age, term life insurance is very affordable (SGD 20–50/month). It protects your family if something happens to you.',
      actionLabel: 'View Insurance',
      actionLink: '/insurance',
    },
    icon: '🛡️',
  },

  // Starting Family (25-34)
  {
    id: 'family_life_insurance',
    title: 'Adequate Life Insurance',
    category: 'insurance',
    priority: 'high',
    applicableLifeStages: ['starting_family'],
    triggerCondition: (appData, summary) => {
      const totalLifeInsurance = appData.insurancePolicies
        .filter(p => p.policyType === 'life')
        .reduce((sum, p) => sum + p.coverageAmount, 0);
      const estimatedIncome = summary.assetsBreakdown.banks * 0.1; // Rough estimate
      return totalLifeInsurance < estimatedIncome * 5;
    },
    content: {
      headline: '👨‍👩‍👧 Protect Your Family',
      body: 'With dependents, aim for 5–10× your annual income in life insurance. This protects your family\'s lifestyle if something happens.',
      actionLabel: 'Review Insurance',
      actionLink: '/insurance',
    },
    icon: '👨‍👩‍👧',
  },
  {
    id: 'family_emergency_fund',
    title: 'Build 6-Month Emergency Fund',
    category: 'savings',
    priority: 'high',
    applicableLifeStages: ['starting_family'],
    triggerCondition: (appData, summary) => {
      const monthlyExpenses = (summary.assetsBreakdown.banks || 0) / 12;
      return summary.assetsBreakdown.banks < monthlyExpenses * 6;
    },
    content: {
      headline: '🏦 Secure Your Family\'s Future',
      body: 'With a family, build 6 months of expenses in savings. This covers job loss, medical emergencies, or other unexpected costs.',
      actionLabel: 'View Savings',
      actionLink: '/banks',
    },
    icon: '🏦',
  },
  {
    id: 'family_education_fund',
    title: 'Start Child Education Fund',
    category: 'goals',
    priority: 'high',
    applicableLifeStages: ['starting_family'],
    triggerCondition: (appData) => {
      // Simplified: trigger if no education-related savings
      return appData.holdings.length < 2;
    },
    content: {
      headline: '🎓 Plan for Education',
      body: 'Open a Child Development Account (CDA) or education insurance. Compound growth over 18 years is powerful—start now.',
      actionLabel: 'Learn More',
      actionLink: '/investments',
    },
    icon: '🎓',
  },

  // Supporting Parents (35-59)
  {
    id: 'parents_retirement_savings',
    title: 'Maximize Retirement Savings',
    category: 'savings',
    priority: 'high',
    applicableLifeStages: ['supporting_parents'],
    triggerCondition: (appData, summary) => {
      // Simplified: always show for supporting parents
      return true;
    },
    content: {
      headline: '🎯 Peak Earning Years',
      body: 'You\'re in your peak earning years. Maximize CPF contributions (SGD 37,740/year) for guaranteed retirement income. Every year counts.',
      actionLabel: 'View CPF',
      actionLink: '/cpf',
    },
    icon: '🎯',
  },
  {
    id: 'parents_care_planning',
    title: 'Plan Parent Care Costs',
    category: 'insurance',
    priority: 'high',
    applicableLifeStages: ['supporting_parents'],
    triggerCondition: (appData) => {
      const hasLongTermCare = appData.insurancePolicies.some(p => 
        p.policyType === 'health' || p.policyType === 'critical_illness'
      );
      return !hasLongTermCare;
    },
    content: {
      headline: '👴 Plan for Parent Care',
      body: 'Consider long-term care insurance for aging parents. Costs SGD 100–300/month now, but prevents SGD 5,000+/month care costs later.',
      actionLabel: 'View Insurance',
      actionLink: '/insurance',
    },
    icon: '👴',
  },
  {
    id: 'parents_diversify',
    title: 'Diversify Beyond CPF',
    category: 'investment',
    priority: 'high',
    applicableLifeStages: ['supporting_parents'],
    triggerCondition: (appData, summary) => {
      const cpfPercentage = 0.8; // Simplified
      return cpfPercentage > 0.8;
    },
    content: {
      headline: '📊 Grow Your Wealth',
      body: 'CPF is safe but limited returns. Allocate 20–30% to diversified investments (stocks, bonds, REITs) for better growth.',
      actionLabel: 'View Investments',
      actionLink: '/investments',
    },
    icon: '📊',
  },

  // Dual Responsibility (30-59)
  {
    id: 'dual_cash_flow',
    title: 'Manage Dual Responsibilities',
    category: 'goals',
    priority: 'high',
    applicableLifeStages: ['dual_responsibility'],
    triggerCondition: (appData, summary) => {
      // Simplified: show if has loans
      return appData.loans.length > 0;
    },
    content: {
      headline: '⚖️ Balance Your Obligations',
      body: 'You\'re balancing family and parent support. Review your budget to ensure 20% of income goes to retirement savings.',
      actionLabel: 'View Dashboard',
      actionLink: '/dashboard',
    },
    icon: '⚖️',
  },
  {
    id: 'dual_protection',
    title: 'Protect Dependents',
    category: 'insurance',
    priority: 'high',
    applicableLifeStages: ['dual_responsibility'],
    triggerCondition: (appData, summary) => {
      const totalLifeInsurance = appData.insurancePolicies
        .filter(p => p.policyType === 'life')
        .reduce((sum, p) => sum + p.coverageAmount, 0);
      const estimatedIncome = summary.assetsBreakdown.banks * 0.1; // Rough estimate
      return totalLifeInsurance < estimatedIncome * 10;
    },
    content: {
      headline: '🛡️ Full Family Protection',
      body: 'With dual responsibilities, aim for 10× income in life insurance. Ensures your family and parents are protected.',
      actionLabel: 'Review Insurance',
      actionLink: '/insurance',
    },
    icon: '🛡️',
  },

  // Pre-Retiree (55-64)
  {
    id: 'preretire_cpf_max',
    title: 'Maximize CPF Contributions',
    category: 'savings',
    priority: 'high',
    applicableLifeStages: ['pre_retiree'],
    triggerCondition: (appData, summary) => {
      // Always show for pre-retirees
      return true;
    },
    content: {
      headline: '⏰ Final Push for Retirement',
      body: 'You have 5–10 years to build CPF. Max contributions now (SGD 37,740/year) for guaranteed retirement income.',
      actionLabel: 'View CPF',
      actionLink: '/cpf',
    },
    icon: '⏰',
  },
  {
    id: 'preretire_conservative',
    title: 'Shift to Conservative Allocation',
    category: 'investment',
    priority: 'high',
    applicableLifeStages: ['pre_retiree'],
    triggerCondition: (appData) => {
      const stockPercentage = 0.7; // Simplified
      return stockPercentage > 0.7;
    },
    content: {
      headline: '📉 Protect Your Gains',
      body: 'As retirement approaches, reduce stock exposure to 40–50%. This protects your gains from market downturns.',
      actionLabel: 'Rebalance Portfolio',
      actionLink: '/investments',
    },
    icon: '📉',
  },
  {
    id: 'preretire_withdrawal',
    title: 'Plan Withdrawal Strategy',
    category: 'goals',
    priority: 'high',
    applicableLifeStages: ['pre_retiree'],
    triggerCondition: () => true, // Always show for pre-retirees
    content: {
      headline: '💡 Plan Your Retirement',
      body: 'Model your retirement: CPF payouts, investment withdrawals, part-time income. Aim for 70–80% of pre-retirement income.',
      actionLabel: 'View Timeline',
      actionLink: '/net-worth-timeline',
    },
    icon: '💡',
  },

  // Golden Years (65+)
  {
    id: 'golden_cpf_drawdown',
    title: 'Optimize CPF Drawdown',
    category: 'goals',
    priority: 'high',
    applicableLifeStages: ['golden_years'],
    triggerCondition: () => true, // Always show for golden years
    content: {
      headline: '💰 Smart Withdrawal Strategy',
      body: 'Withdraw strategically: take investment income first, then CPF. This preserves capital and minimizes taxes.',
      actionLabel: 'View CPF',
      actionLink: '/cpf',
    },
    icon: '💰',
  },
  {
    id: 'golden_inflation',
    title: 'Protect Against Inflation',
    category: 'investment',
    priority: 'high',
    applicableLifeStages: ['golden_years'],
    triggerCondition: (appData, summary) => {
      const cashPercentage = 0.5; // Simplified
      return cashPercentage > 0.4;
    },
    content: {
      headline: '📈 Maintain Purchasing Power',
      body: 'Inflation erodes purchasing power. Keep 30–40% in dividend stocks or REITs for growth and income.',
      actionLabel: 'View Investments',
      actionLink: '/investments',
    },
    icon: '📈',
  },
  {
    id: 'golden_healthcare',
    title: 'Manage Healthcare Costs',
    category: 'insurance',
    priority: 'high',
    applicableLifeStages: ['golden_years'],
    triggerCondition: (appData, summary) => {
      const hasShieldPlan = appData.insurancePolicies.some(p => p.policyType === 'health');
      return !hasShieldPlan;
    },
    content: {
      headline: '🏥 Prepare for Healthcare',
      body: 'Explore subsidized healthcare (Medisave, Medifund, CHAS). Can reduce costs by 30–50%.',
      actionLabel: 'Learn More',
      actionLink: '/insurance',
    },
    icon: '🏥',
  },
];

/**
 * Evaluate nudges for a user based on their life stage and financial data
 */
export function evaluateNudgesForUser(
  lifeStage: string | undefined,
  appData: AppData,
  summary: FinancialSummary
): EvaluatedNudge[] {
  if (!lifeStage) return [];

  // Get applicable rules for this life stage
  const applicableRules = NUDGE_RULES.filter(rule =>
    rule.applicableLifeStages.includes(lifeStage as LifeStage)
  );

  // Evaluate each rule
  const triggeredNudges = applicableRules
    .filter(rule => {
      try {
        return rule.triggerCondition(appData, summary);
      } catch (error) {
        console.error(`Error evaluating nudge ${rule.id}:`, error);
        return false;
      }
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5); // Limit to top 5

  // Convert to evaluated nudges
  return triggeredNudges.map(rule => ({
    id: rule.id,
    title: rule.title,
    content: rule.content,
    category: rule.category,
    priority: rule.priority,
    icon: rule.icon,
    displayedAt: new Date().toISOString(),
  }));
}
