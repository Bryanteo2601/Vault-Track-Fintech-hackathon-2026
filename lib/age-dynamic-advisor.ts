/**
 * Age-Dynamic Financial Advisor Integration
 * 
 * Integrates age-based financial insights into the overall financial advisor system.
 * Generates personalized advice based on user's age, life stage, and financial situation.
 */

import { getFinancialLifeStage, calculateAge, FinancialLifeStageInfo } from './age-based-financial-engine';
import { getAgeBasedInvestmentStrategy, AllocationTarget } from './age-based-investment-strategy';
import { getRecommendedEducationalContent } from './financial-education-module';

export interface FinancialAdvisorInsight {
  category: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  lifeStageRelevance: boolean;
}

export interface AgeBasedFinancialAdvice {
  age: number;
  lifeStage: FinancialLifeStageInfo;
  investmentStrategy: ReturnType<typeof getAgeBasedInvestmentStrategy>;
  educationalContent: ReturnType<typeof getRecommendedEducationalContent>;
  insights: FinancialAdvisorInsight[];
  disclaimer: string;
}

/**
 * Generate comprehensive age-based financial advice
 */
export function generateAgeBasedFinancialAdvice(birthDate: string | Date | null | undefined): AgeBasedFinancialAdvice {
  const age = calculateAge(birthDate);
  const lifeStage = getFinancialLifeStage(birthDate);
  const investmentStrategy = getAgeBasedInvestmentStrategy(birthDate);
  const educationalContent = getRecommendedEducationalContent(birthDate);
  const insights = generateInsightsForLifeStage(lifeStage, age);

  return {
    age,
    lifeStage,
    investmentStrategy,
    educationalContent,
    insights,
    disclaimer:
      'This guidance is based on general financial education principles and may not reflect your full financial situation. Consider consulting a financial advisor for personalized advice.',
  };
}

/**
 * Generate insights specific to user's life stage
 */
function generateInsightsForLifeStage(lifeStageInfo: FinancialLifeStageInfo, age: number): FinancialAdvisorInsight[] {
  const insights: FinancialAdvisorInsight[] = [];

  switch (lifeStageInfo.stage) {
    case 'early_adulthood':
      insights.push(
        {
          category: 'Wealth Building',
          title: 'Start Investing Early',
          message: `At ${age} years old, you have a long investment horizon ahead. Starting to invest now allows you to benefit from compound growth over decades. Even small investments can grow significantly`,
          priority: 'high',
          actionItems: [
            'Open a brokerage account or use CPF Investment Scheme',
            'Start with low-cost index funds or ETFs',
            'Invest regularly through dollar-cost averaging',
            'Aim for 70-85% equities allocation for growth',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Emergency Fund',
          title: 'Build Your Safety Net',
          message: 'Before investing heavily, ensure you have an emergency fund covering 3-6 months of living expenses in a liquid, low-risk account.',
          priority: 'high',
          actionItems: [
            'Calculate your monthly expenses',
            'Save 3-6 months of expenses in a savings account',
            'Keep emergency fund separate from investment accounts',
            'Review and update annually',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Debt Management',
          title: 'Avoid High-Interest Debt',
          message: 'Avoid accumulating high-interest debt like credit card balances. Focus on building good credit habits early.',
          priority: 'high',
          actionItems: [
            'Pay credit card bills in full each month',
            'Avoid taking high-interest personal loans',
            'Build credit history responsibly',
            'Monitor your credit score',
          ],
          lifeStageRelevance: true,
        }
      );
      break;

    case 'early_career':
      insights.push(
        {
          category: 'Wealth Accumulation',
          title: 'Build Your Investment Portfolio',
          message: `At ${age} years old, you are in an excellent position to build long-term wealth. Focus on consistent investing and diversification.`,
          priority: 'high',
          actionItems: [
            'Increase investment contributions as income grows',
            'Diversify across equities, bonds, and alternatives',
            'Maximize CPF contributions for tax benefits',
            'Target 65-80% equities allocation',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Insurance Protection',
          title: 'Secure Adequate Insurance',
          message: 'Start building insurance protection now while you are young and healthy. Term life insurance is affordable at this age.',
          priority: 'high',
          actionItems: [
            'Get term life insurance (10-20x annual income)',
            'Consider critical illness insurance',
            'Review coverage annually as life changes',
            'Compare insurance options and costs',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Retirement Planning',
          title: 'Start Retirement Planning',
          message: 'Even though retirement seems far away, starting now gives you decades to accumulate wealth through compound growth.',
          priority: 'medium',
          actionItems: [
            'Calculate retirement income needs',
            'Maximize CPF contributions',
            'Start voluntary CPF contributions if possible',
            'Review retirement plans annually',
          ],
          lifeStageRelevance: true,
        }
      );
      break;

    case 'family_building':
      insights.push(
        {
          category: 'Family Protection',
          title: 'Ensure Adequate Family Protection',
          message: `At ${age} years old with family responsibilities, comprehensive insurance is critical. Ensure your family is protected if needed.`,
          priority: 'high',
          actionItems: [
            'Review and increase life insurance coverage',
            'Ensure critical illness insurance is adequate',
            'Consider disability insurance',
            'Update beneficiaries on all policies',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Wealth Accumulation',
          title: 'Accelerate Retirement Savings',
          message: 'You are at peak earning years. Maximize savings and investments to accelerate wealth accumulation for retirement.',
          priority: 'high',
          actionItems: [
            'Increase investment contributions',
            'Maximize CPF contributions',
            'Consider supplementary retirement accounts',
            'Target 60-70% equities allocation',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Children Planning',
          title: 'Plan for Children Education',
          message: 'Start planning for education expenses early. Education costs are rising, and planning ahead reduces financial stress.',
          priority: 'medium',
          actionItems: [
            'Estimate education costs',
            'Start education savings plans',
            'Consider education insurance',
            'Review plans as children grow',
          ],
          lifeStageRelevance: true,
        }
      );
      break;

    case 'pre_retirement':
      insights.push(
        {
          category: 'Retirement Readiness',
          title: 'Assess Retirement Readiness',
          message: `At ${age} years old, retirement is approaching. Review your retirement plans and ensure you are on track to meet your retirement goals`,
          priority: 'high',
          actionItems: [
            'Calculate retirement income needs',
            'Check CPF retirement sum status',
            'Review investment portfolio',
            'Consult with financial advisor if needed',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Portfolio Risk',
          title: 'Reduce Investment Risk',
          message: 'As retirement approaches, gradually shift your portfolio to more conservative investments to protect accumulated wealth.',
          priority: 'high',
          actionItems: [
            'Reduce equities allocation to 40-55%',
            'Increase bonds and stable assets',
            'Plan gradual rebalancing over 5-10 years',
            'Avoid major portfolio changes close to retirement',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Healthcare Planning',
          title: 'Plan for Healthcare Costs',
          message: 'Healthcare costs increase with age. Ensure you have adequate coverage and savings for healthcare in retirement.',
          priority: 'medium',
          actionItems: [
            'Review Medisave and Medishield coverage',
            'Consider integrated shield plans',
            'Plan for long-term care costs',
            'Estimate healthcare expenses in retirement',
          ],
          lifeStageRelevance: true,
        }
      );
      break;

    case 'retirement':
      insights.push(
        {
          category: 'Income Stability',
          title: 'Optimize Retirement Income',
          message: `At ${age} years old, focus on generating stable income from retirement savings. Optimize CPF LIFE payouts and withdrawal strategies.`,
          priority: 'high',
          actionItems: [
            'Optimize CPF LIFE payout options',
            'Plan sustainable withdrawal strategy',
            'Diversify income sources',
            'Review spending and adjust as needed',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Wealth Preservation',
          title: 'Preserve Your Wealth',
          message: 'Shift focus to preserving wealth and generating income. Conservative investments protect your retirement savings.',
          priority: 'high',
          actionItems: [
            'Maintain 20-35% equities allocation',
            'Increase bonds and income-generating assets',
            'Minimize volatility and risk',
            'Rebalance quarterly to maintain allocation',
          ],
          lifeStageRelevance: true,
        },
        {
          category: 'Legacy Planning',
          title: 'Plan Your Legacy',
          message: 'Consider your legacy and how to pass wealth to heirs. Update your will and estate plans.',
          priority: 'medium',
          actionItems: [
            'Review and update your will',
            'Consider trusts for asset management',
            'Plan estate distribution',
            'Discuss plans with family members',
          ],
          lifeStageRelevance: true,
        }
      );
      break;
  }

  return insights;
}

/**
 * Get age-specific nudge for dashboard
 */
export function getAgeSpecificNudge(birthDate: string | Date | null | undefined): string {
  const age = calculateAge(birthDate);
  const lifeStage = getFinancialLifeStage(birthDate);

  const nudges: Record<string, string> = {
    early_adulthood: `You're in the Early Adulthood stage (${age} years). Focus on building good financial habits and starting to invest early for long-term growth.`,
    early_career: `You're in the Early Career stage (${age} years). Build your investment portfolio and secure adequate insurance protection.`,
    family_building: `You're in the Family/Asset Building stage (${age} years). Ensure your family is protected and accelerate retirement savings.`,
    pre_retirement: `You're in the Pre-Retirement stage (${age} years). Review retirement readiness and gradually reduce investment risk.`,
    retirement: `You're in the Retirement stage (${age} years). Focus on income stability and wealth preservation for a secure retirement.`,
  };

  return nudges[lifeStage.stage] || `You are ${age} years old. Review your financial strategy based on your current life stage.`;
}
