/**
 * Portfolio Stress Testing
 * Simulate various market scenarios and their impact on portfolio
 */

export type StressScenario = 'market-crash' | 'interest-rate-hike' | 'inflation' | 'recession' | 'currency-devaluation' | 'custom';

export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  scenario: StressScenario;
  parameters: {
    stockPriceChange: number; // -50% to +50%
    bondPriceChange: number;
    cryptoPriceChange: number;
    realEstatePriceChange: number;
    interestRateChange: number; // -2% to +5%
    currencyChange: number; // -20% to +20%
  };
  severity: 'low' | 'medium' | 'high' | 'extreme';
  probability: number; // 0-1
}

export interface StressTestResult {
  scenarioId: string;
  scenarioName: string;
  originalPortfolioValue: number;
  stressedPortfolioValue: number;
  percentageChange: number;
  dollarChange: number;
  assetClassImpact: {
    assetClass: string;
    originalValue: number;
    stressedValue: number;
    percentageChange: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  timeToRecover: number; // months
}

export interface PortfolioStressTestReport {
  timestamp: Date;
  scenarios: StressTestResult[];
  worstCaseScenario: StressTestResult;
  bestCaseScenario: StressTestResult;
  averageImpact: number;
  portfolioResilience: number; // 0-100
  recommendations: string[];
}

// Predefined stress test scenarios
export const PREDEFINED_SCENARIOS: Record<StressScenario, Omit<StressTestScenario, 'id'>> = {
  'market-crash': {
    name: 'Market Crash (2008-style)',
    description: 'Severe market correction similar to 2008 financial crisis',
    scenario: 'market-crash',
    parameters: {
      stockPriceChange: -40,
      bondPriceChange: -15,
      cryptoPriceChange: -60,
      realEstatePriceChange: -25,
      interestRateChange: -2,
      currencyChange: 0,
    },
    severity: 'extreme',
    probability: 0.01,
  },
  'interest-rate-hike': {
    name: 'Interest Rate Hike',
    description: 'Central bank raises rates aggressively to combat inflation',
    scenario: 'interest-rate-hike',
    parameters: {
      stockPriceChange: -15,
      bondPriceChange: -20,
      cryptoPriceChange: -30,
      realEstatePriceChange: -10,
      interestRateChange: 3,
      currencyChange: 5,
    },
    severity: 'high',
    probability: 0.15,
  },
  'inflation': {
    name: 'High Inflation',
    description: 'Persistent inflation erodes purchasing power',
    scenario: 'inflation',
    parameters: {
      stockPriceChange: -10,
      bondPriceChange: -15,
      cryptoPriceChange: 20,
      realEstatePriceChange: 15,
      interestRateChange: 2,
      currencyChange: -10,
    },
    severity: 'medium',
    probability: 0.25,
  },
  'recession': {
    name: 'Recession',
    description: 'Economic contraction with rising unemployment',
    scenario: 'recession',
    parameters: {
      stockPriceChange: -25,
      bondPriceChange: -5,
      cryptoPriceChange: -50,
      realEstatePriceChange: -15,
      interestRateChange: -1,
      currencyChange: 0,
    },
    severity: 'high',
    probability: 0.10,
  },
  'currency-devaluation': {
    name: 'Currency Devaluation',
    description: 'Local currency weakens against major currencies',
    scenario: 'currency-devaluation',
    parameters: {
      stockPriceChange: -5,
      bondPriceChange: -8,
      cryptoPriceChange: 10,
      realEstatePriceChange: 5,
      interestRateChange: 1,
      currencyChange: -20,
    },
    severity: 'medium',
    probability: 0.20,
  },
  'custom': {
    name: 'Custom Scenario',
    description: 'User-defined stress test parameters',
    scenario: 'custom',
    parameters: {
      stockPriceChange: 0,
      bondPriceChange: 0,
      cryptoPriceChange: 0,
      realEstatePriceChange: 0,
      interestRateChange: 0,
      currencyChange: 0,
    },
    severity: 'low',
    probability: 0,
  },
};

/**
 * Calculate portfolio stress test result
 */
export function calculateStressTestResult(
  portfolioValue: number,
  assetBreakdown: Record<string, number>,
  scenario: StressTestScenario
): StressTestResult {
  const assetClassImpact = Object.entries(assetBreakdown).map(([assetClass, value]) => {
    let priceChange = 0;

    switch (assetClass.toLowerCase()) {
      case 'stocks':
        priceChange = scenario.parameters.stockPriceChange;
        break;
      case 'bonds':
        priceChange = scenario.parameters.bondPriceChange;
        break;
      case 'crypto':
        priceChange = scenario.parameters.cryptoPriceChange;
        break;
      case 'real estate':
        priceChange = scenario.parameters.realEstatePriceChange;
        break;
      default:
        priceChange = (scenario.parameters.stockPriceChange + scenario.parameters.bondPriceChange) / 2;
    }

    const stressedValue = value * (1 + priceChange / 100);
    return {
      assetClass,
      originalValue: value,
      stressedValue,
      percentageChange: priceChange,
    };
  });

  const stressedPortfolioValue = assetClassImpact.reduce((sum, impact) => sum + impact.stressedValue, 0);
  const percentageChange = ((stressedPortfolioValue - portfolioValue) / portfolioValue) * 100;
  const dollarChange = stressedPortfolioValue - portfolioValue;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (percentageChange < -30) riskLevel = 'critical';
  else if (percentageChange < -20) riskLevel = 'high';
  else if (percentageChange < -10) riskLevel = 'medium';

  // Generate recommendations
  const recommendations: string[] = [];
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Consider increasing emergency fund and reducing risk exposure');
    recommendations.push('Review insurance coverage to protect against major losses');
  }

  if (assetClassImpact.some(a => a.percentageChange < -40)) {
    recommendations.push('Rebalance portfolio to reduce concentration in high-risk assets');
  }

  // Estimate time to recover (simplified)
  const timeToRecover = Math.abs(percentageChange) * 2; // Rough estimate

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    originalPortfolioValue: portfolioValue,
    stressedPortfolioValue,
    percentageChange,
    dollarChange,
    assetClassImpact,
    riskLevel,
    recommendations,
    timeToRecover: Math.round(timeToRecover),
  };
}

/**
 * Generate comprehensive stress test report
 */
export function generateStressTestReport(
  portfolioValue: number,
  assetBreakdown: Record<string, number>,
  scenarios: StressTestScenario[]
): PortfolioStressTestReport {
  const results = scenarios.map(scenario => calculateStressTestResult(portfolioValue, assetBreakdown, scenario));

  const worstCase = results.reduce((worst, current) => (current.percentageChange < worst.percentageChange ? current : worst));
  const bestCase = results.reduce((best, current) => (current.percentageChange > best.percentageChange ? current : best));

  const averageImpact = results.reduce((sum, r) => sum + r.percentageChange, 0) / results.length;

  // Portfolio resilience score (0-100)
  const resilience = Math.max(0, 100 + averageImpact);

  const recommendations: string[] = [];
  if (resilience < 50) {
    recommendations.push('Your portfolio has low resilience to market shocks. Consider diversifying further.');
  }
  if (worstCase.percentageChange < -30) {
    recommendations.push('Worst-case scenario shows significant losses. Review your risk tolerance and asset allocation.');
  }

  return {
    timestamp: new Date(),
    scenarios: results,
    worstCaseScenario: worstCase,
    bestCaseScenario: bestCase,
    averageImpact,
    portfolioResilience: resilience,
    recommendations,
  };
}
