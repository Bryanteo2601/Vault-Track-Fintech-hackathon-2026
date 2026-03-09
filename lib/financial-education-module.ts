/**
 * Financial Education Module
 * 
 * Provides age-appropriate educational content aligned with Singapore's MoneySense framework.
 * Recommends learning topics and resources based on user's financial life stage.
 */

import { getFinancialLifeStage, FinancialLifeStageInfo } from './age-based-financial-engine';

export interface EducationalTopic {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
  moneySenseUrl: string;
  estimatedReadTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relevanceScore: number; // 0-100
}

export interface EducationalContent {
  lifeStage: string;
  recommendedTopics: EducationalTopic[];
  disclaimer: string;
}

/**
 * Get recommended educational content for user's life stage
 */
export function getRecommendedEducationalContent(birthDate: string | Date | null | undefined): EducationalContent {
  const lifeStageInfo = getFinancialLifeStage(birthDate);

  const recommendedTopics = getTopicsForLifeStage(lifeStageInfo).sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    lifeStage: lifeStageInfo.displayName,
    recommendedTopics,
    disclaimer:
      'This guidance is based on general financial education principles from MoneySense and may not reflect your full financial situation. Consider consulting a financial advisor for personalized advice.',
  };
}

/**
 * Get educational topics for a specific life stage
 */
function getTopicsForLifeStage(lifeStageInfo: FinancialLifeStageInfo): EducationalTopic[] {
  const allTopics = getAllEducationalTopics();

  // Filter topics that match the life stage's education topics
  return allTopics.filter((topic) => lifeStageInfo.educationTopics.includes(topic.title));
}

/**
 * Get all available educational topics
 */
function getAllEducationalTopics(): EducationalTopic[] {
  return [
    {
      id: 'budgeting-basics',
      title: 'Budgeting Basics',
      description:
        'Learn how to create and maintain a budget that aligns with your income and expenses. Understand the 50/30/20 rule and track your spending effectively.',
      keyPoints: [
        'Create a realistic budget based on your income',
        'Track expenses across different categories',
        'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
        'Review and adjust your budget regularly',
        'Use budgeting tools and apps to stay on track',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 8,
      difficulty: 'beginner',
      relevanceScore: 95,
    },

    {
      id: 'emergency-savings',
      title: 'Building Emergency Savings',
      description:
        'Understand why emergency savings are crucial and how to build a fund that covers 3-6 months of living expenses.',
      keyPoints: [
        'Emergency fund should cover 3-6 months of living expenses',
        'Keep emergency savings in accessible, low-risk accounts',
        'Start small and build gradually',
        'Automate your savings to make it easier',
        'Review and adjust your emergency fund target annually',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 6,
      difficulty: 'beginner',
      relevanceScore: 98,
    },

    {
      id: 'beginner-investing',
      title: 'Beginner Investing Guide',
      description:
        'Start your investment journey with fundamentals. Learn about different investment types, risk tolerance, and how to begin investing with small amounts.',
      keyPoints: [
        'Understand different investment types: stocks, bonds, funds, ETFs',
        'Assess your risk tolerance based on age and goals',
        'Start with low-cost index funds or ETFs',
        'Dollar-cost averaging: invest fixed amounts regularly',
        'Diversification reduces risk across your portfolio',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/investments/types-of-investments/',
      estimatedReadTime: 12,
      difficulty: 'beginner',
      relevanceScore: 90,
    },

    {
      id: 'debt-credit',
      title: 'Understanding Debt and Credit',
      description:
        'Learn how to manage debt responsibly, understand credit scores, and avoid debt traps like high-interest loans.',
      keyPoints: [
        'Types of debt: credit cards, personal loans, mortgages',
        'Credit score factors and how to improve them',
        'Avoid high-interest debt and predatory loans',
        'Debt repayment strategies: snowball vs. avalanche',
        'Build good credit habits early for future financial opportunities',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 10,
      difficulty: 'beginner',
      relevanceScore: 85,
    },

    {
      id: 'investment-diversification',
      title: 'Investment Diversification',
      description:
        'Understand how to build a diversified portfolio that balances risk and return across different asset classes.',
      keyPoints: [
        'Diversification across asset classes: stocks, bonds, cash',
        'Geographic diversification: local and international investments',
        'Sector diversification within stock holdings',
        'Rebalancing: maintain target allocation over time',
        'Modern portfolio theory and risk-return tradeoff',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/investments/types-of-investments/',
      estimatedReadTime: 14,
      difficulty: 'intermediate',
      relevanceScore: 88,
    },

    {
      id: 'insurance-basics',
      title: 'Insurance Basics and Protection',
      description:
        'Learn about different types of insurance and how to ensure adequate protection for yourself and your family.',
      keyPoints: [
        'Life insurance: term, whole life, and universal life policies',
        'Critical illness insurance: covers major health conditions',
        'Disability insurance: protects income if you cannot work',
        'Health insurance: covers medical expenses',
        'Determine adequate coverage based on your life stage and dependents',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/insurance-basics/',
      estimatedReadTime: 11,
      difficulty: 'intermediate',
      relevanceScore: 92,
    },

    {
      id: 'cpf-strategies',
      title: 'CPF Contribution Strategies',
      description:
        'Maximize your Central Provident Fund (CPF) contributions for retirement and tax benefits. Understand CPF investment options.',
      keyPoints: [
        'CPF contribution rates and limits for different age groups',
        'CPF Ordinary Account (OA), Special Account (SA), Medisave Account (MA)',
        'CPF Investment Scheme: invest CPF funds for higher returns',
        'Voluntary contributions for tax deductions',
        'CPF LIFE: automatic monthly payouts in retirement',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 13,
      difficulty: 'intermediate',
      relevanceScore: 95,
    },

    {
      id: 'family-financial-planning',
      title: 'Financial Planning for Children\'s Education',
      description:
        'Plan for your children\'s education expenses and understand education savings options available in Singapore.',
      keyPoints: [
        'Estimate education costs: primary, secondary, tertiary',
        'Education savings plans and endowment policies',
        'Scholarships and financial aid options',
        'CPF Education Savings: use CPF for education expenses',
        'Start planning early to benefit from compound growth',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 10,
      difficulty: 'intermediate',
      relevanceScore: 85,
    },

    {
      id: 'cpf-retirement',
      title: 'CPF Retirement Planning',
      description:
        'Plan for retirement using CPF. Understand CPF Retirement Sum, CPF LIFE, and how to ensure adequate retirement income.',
      keyPoints: [
        'CPF Retirement Sum targets for different age groups',
        'CPF LIFE: guaranteed monthly income for life',
        'CPF Withdrawal: lump sum options available',
        'Combine CPF with other retirement savings',
        'Review retirement plans regularly as you age',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      estimatedReadTime: 12,
      difficulty: 'intermediate',
      relevanceScore: 94,
    },

    {
      id: 'portfolio-risk-management',
      title: 'Portfolio Risk Management',
      description:
        'Understand how to manage investment risk as you approach retirement. Learn about asset allocation and risk reduction strategies.',
      keyPoints: [
        'Risk tolerance assessment based on age and goals',
        'Asset allocation: stocks, bonds, cash allocation',
        'Gradual shift to conservative investments approaching retirement',
        'Volatility and sequence of returns risk',
        'Hedging strategies and protective investments',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/investments/types-of-investments/',
      estimatedReadTime: 14,
      difficulty: 'advanced',
      relevanceScore: 90,
    },

    {
      id: 'healthcare-planning',
      title: 'Long-term Healthcare Planning',
      description:
        'Plan for healthcare costs in retirement. Understand Medisave, Medishield Life, and long-term care insurance.',
      keyPoints: [
        'Medisave: mandatory health savings account',
        'Medishield Life: basic health insurance coverage',
        'Integrated Shield Plans: enhanced coverage options',
        'Long-term care insurance: nursing and care costs',
        'Estimate healthcare costs and plan accordingly',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 11,
      difficulty: 'intermediate',
      relevanceScore: 88,
    },

    {
      id: 'retirement-income',
      title: 'Retirement Income Planning',
      description:
        'Create a sustainable retirement income plan. Learn about withdrawal strategies and income sources in retirement.',
      keyPoints: [
        '4% rule: sustainable withdrawal rate from investments',
        'Diversify income sources: CPF LIFE, investments, part-time work',
        'Sequence of returns risk in early retirement',
        'Inflation impact on retirement spending',
        'Adjust spending and withdrawals based on market conditions',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      estimatedReadTime: 13,
      difficulty: 'advanced',
      relevanceScore: 92,
    },

    {
      id: 'estate-planning',
      title: 'Estate Planning Basics',
      description:
        'Understand the importance of estate planning. Learn about wills, trusts, and how to protect your family\'s future.',
      keyPoints: [
        'Will: document your wishes for asset distribution',
        'Probate: legal process of distributing assets',
        'Trusts: manage assets for beneficiaries',
        'Guardianship: care for minor children',
        'Review and update your estate plan regularly',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      estimatedReadTime: 10,
      difficulty: 'intermediate',
      relevanceScore: 85,
    },

    {
      id: 'cpf-life',
      title: 'CPF LIFE Payouts',
      description:
        'Understand CPF LIFE and how it provides guaranteed monthly income for life. Learn about payout options and optimization strategies.',
      keyPoints: [
        'CPF LIFE: automatic monthly payouts starting at 65',
        'Three payout options: Standard, Basic, Escalating',
        'Deferment: delay CPF LIFE to increase monthly payouts',
        'Bequest: leave remaining CPF balance to heirs',
        'Combine CPF LIFE with other retirement income sources',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/legacy-planning/planning-for-retirement/',
      estimatedReadTime: 9,
      difficulty: 'intermediate',
      relevanceScore: 96,
    },

    {
      id: 'managing-debt',
      title: 'Managing Debt Responsibly',
      description:
        'Learn strategies for managing debt effectively while building wealth. Understand debt consolidation and repayment strategies.',
      keyPoints: [
        'Debt-to-income ratio: measure of financial health',
        'Prioritize high-interest debt repayment',
        'Debt consolidation: combine multiple debts into one',
        'Balance debt repayment with wealth building',
        'Avoid accumulating new debt while repaying',
      ],
      moneySenseUrl: 'https://www.moneysense.gov.sg/managing-your-money/',
      estimatedReadTime: 10,
      difficulty: 'intermediate',
      relevanceScore: 87,
    },
  ];
}

/**
 * Get a specific educational topic by ID
 */
export function getEducationalTopicById(topicId: string): EducationalTopic | undefined {
  return getAllEducationalTopics().find((topic) => topic.id === topicId);
}

/**
 * Get all educational topics
 */
export function getAllTopics(): EducationalTopic[] {
  return getAllEducationalTopics();
}
