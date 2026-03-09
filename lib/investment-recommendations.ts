import { LifeStage, Holding } from './types';

/**
 * Investment recommendation for a life stage
 */
export interface InvestmentRecommendation {
  lifeStage: LifeStage;
  recommendedAllocation: {
    stocks: number; // percentage
    bonds: number;
    alternatives: number;
  };
  riskProfile: 'aggressive' | 'moderate-aggressive' | 'moderate' | 'conservative-moderate' | 'conservative';
  rationale: string;
  suggestedActions: string[];
}

/**
 * Recommended allocations by life stage
 */
export const ALLOCATION_BY_LIFE_STAGE: Record<LifeStage, InvestmentRecommendation> = {
  fresh_entrant: {
    lifeStage: 'fresh_entrant',
    recommendedAllocation: {
      stocks: 80,
      bonds: 20,
      alternatives: 0,
    },
    riskProfile: 'aggressive',
    rationale: 'With 40+ years until retirement, you can weather market volatility. Focus on growth with low-cost index funds.',
    suggestedActions: [
      'Start with STI ETF or VTSAX for diversified stock exposure',
      'Contribute regularly (dollar-cost averaging reduces timing risk)',
      'Avoid individual stock picking; stick to broad index funds',
      'Review allocation annually, rebalance if drift > 10%',
    ],
  },
  starting_family: {
    lifeStage: 'starting_family',
    recommendedAllocation: {
      stocks: 70,
      bonds: 25,
      alternatives: 5,
    },
    riskProfile: 'moderate-aggressive',
    rationale: 'Balance growth with family protection. Bonds provide stability for education and family goals.',
    suggestedActions: [
      'Allocate 60% to stock index funds, 25% to bonds, 15% to REITs/alternatives',
      'Start education savings plan (CDA or insurance)',
      'Review insurance coverage (life, health, critical illness)',
      'Rebalance annually to maintain target allocation',
    ],
  },
  supporting_parents: {
    lifeStage: 'supporting_parents',
    recommendedAllocation: {
      stocks: 60,
      bonds: 30,
      alternatives: 10,
    },
    riskProfile: 'moderate',
    rationale: 'Moderate growth with capital preservation. Support both retirement and parent care obligations.',
    suggestedActions: [
      'Allocate 60% to stocks, 30% to bonds, 10% to REITs/alternatives',
      'Maximize CPF contributions (SGD 37,740/year) for tax benefits',
      'Diversify beyond CPF to reduce concentration risk',
      'Consider dividend-paying stocks for income generation',
      'Plan for parent care costs (long-term care insurance)',
    ],
  },
  dual_responsibility: {
    lifeStage: 'dual_responsibility',
    recommendedAllocation: {
      stocks: 50,
      bonds: 35,
      alternatives: 15,
    },
    riskProfile: 'conservative-moderate',
    rationale: 'Conservative approach due to competing obligations. Prioritize stability and income.',
    suggestedActions: [
      'Allocate 50% to stocks, 35% to bonds, 15% to REITs/alternatives',
      'Focus on dividend-paying stocks and bond funds for income',
      'Reduce single-stock concentration (no holding > 5% of portfolio)',
      'Build 9-month emergency fund for dual obligations',
      'Review and optimize debt (mortgages, personal loans)',
    ],
  },
  pre_retiree: {
    lifeStage: 'pre_retiree',
    recommendedAllocation: {
      stocks: 40,
      bonds: 45,
      alternatives: 15,
    },
    riskProfile: 'conservative-moderate',
    rationale: 'Protect gains while maintaining growth. Shift toward income-generating assets.',
    suggestedActions: [
      'Allocate 40% to stocks, 45% to bonds, 15% to REITs/alternatives',
      'Maximize CPF contributions to reach target (SGD 250k+)',
      'Shift to dividend-paying stocks and bond funds',
      'Reduce equity exposure gradually (avoid sudden shifts)',
      'Model retirement income sources (CPF, investments, part-time work)',
      'Review and lock in health insurance before retirement',
    ],
  },
  golden_years: {
    lifeStage: 'golden_years',
    recommendedAllocation: {
      stocks: 30,
      bonds: 50,
      alternatives: 20,
    },
    riskProfile: 'conservative',
    rationale: 'Capital preservation with income focus. Protect purchasing power against inflation.',
    suggestedActions: [
      'Allocate 30% to stocks, 50% to bonds, 20% to REITs/alternatives',
      'Focus on dividend-paying stocks and high-yield bonds',
      'Optimize CPF drawdown strategy (take investment income first)',
      'Consider annuities for guaranteed income',
      'Maintain 30-40% in growth assets to combat inflation',
      'Plan for 30+ years of retirement (longevity risk)',
      'Explore subsidized healthcare programs (Medisave, Medifund, CHAS)',
    ],
  },
};

/**
 * Calculate current allocation from holdings
 */
export function calculateAllocation(holdings: Holding[]): {
  stocks: number;
  bonds: number;
  alternatives: number;
  cash: number;
} {
  if (holdings.length === 0) {
    return { stocks: 0, bonds: 0, alternatives: 0, cash: 100 };
  }

  let totalValue = 0;
  let stocks = 0;
  let bonds = 0;
  let alternatives = 0;

  holdings.forEach(holding => {
    const value = holding.quantity * holding.currentPrice;
    totalValue += value;

    switch (holding.assetClass) {
      case 'stocks':
        stocks += value;
        break;
      case 'bonds':
        bonds += value;
        break;
      case 'etf':
        // Assume ETFs are diversified; split based on name heuristics
        if (holding.name.toLowerCase().includes('bond')) {
          bonds += value;
        } else if (holding.name.toLowerCase().includes('reit')) {
          alternatives += value;
        } else {
          stocks += value;
        }
        break;
      case 'reits':
        alternatives += value;
        break;
      case 'crypto':
      case 'commodities':
      case 'futures':
      case 'options':
        alternatives += value;
        break;
    }
  });

  return {
    stocks: Math.round((stocks / totalValue) * 100),
    bonds: Math.round((bonds / totalValue) * 100),
    alternatives: Math.round((alternatives / totalValue) * 100),
    cash: 0,
  };
}

/**
 * Get investment recommendation for a life stage
 */
export function getInvestmentRecommendation(lifeStage: LifeStage): InvestmentRecommendation {
  return ALLOCATION_BY_LIFE_STAGE[lifeStage];
}

/**
 * Check if rebalancing is needed
 */
export function shouldRebalance(
  current: { stocks: number; bonds: number; alternatives: number },
  target: { stocks: number; bonds: number; alternatives: number },
  threshold: number = 10
): boolean {
  return (
    Math.abs(current.stocks - target.stocks) > threshold ||
    Math.abs(current.bonds - target.bonds) > threshold ||
    Math.abs(current.alternatives - target.alternatives) > threshold
  );
}

/**
 * Get rebalancing suggestions
 */
export function getRebalancingSuggestions(
  current: { stocks: number; bonds: number; alternatives: number },
  target: { stocks: number; bonds: number; alternatives: number }
): string[] {
  const suggestions: string[] = [];

  const stockDiff = target.stocks - current.stocks;
  const bondDiff = target.bonds - current.bonds;
  const altDiff = target.alternatives - current.alternatives;

  if (stockDiff > 5) {
    suggestions.push(`Increase stocks by ${Math.abs(stockDiff)}% (buy more index funds)`);
  } else if (stockDiff < -5) {
    suggestions.push(`Decrease stocks by ${Math.abs(stockDiff)}% (sell some holdings)`);
  }

  if (bondDiff > 5) {
    suggestions.push(`Increase bonds by ${Math.abs(bondDiff)}% (buy bond ETFs)`);
  } else if (bondDiff < -5) {
    suggestions.push(`Decrease bonds by ${Math.abs(bondDiff)}% (sell bond holdings)`);
  }

  if (altDiff > 5) {
    suggestions.push(`Increase alternatives by ${Math.abs(altDiff)}% (buy REITs or commodities)`);
  } else if (altDiff < -5) {
    suggestions.push(`Decrease alternatives by ${Math.abs(altDiff)}% (reduce alternative holdings)`);
  }

  return suggestions;
}
