/**
 * Monte Carlo Simulation Engine for Portfolio Analysis
 * Simulates 1000 portfolio paths over 12 months using historical volatility
 */

// Historical annual volatility by asset class (in decimal form)
export const ASSET_CLASS_VOLATILITY: Record<string, number> = {
  'Stocks': 0.18,      // 18% annual volatility
  'Bonds': 0.05,       // 5% annual volatility
  'Crypto': 0.75,      // 75% annual volatility (highly volatile)
  'ETFs': 0.12,        // 12% annual volatility
  'REITs': 0.15,       // 15% annual volatility
  'Commodities': 0.20, // 20% annual volatility
  'Options': 0.80,     // 80% annual volatility (very volatile)
  'Futures': 0.25,     // 25% annual volatility
};

// Historical average annual returns by asset class (in decimal form)
export const ASSET_CLASS_RETURNS: Record<string, number> = {
  'Stocks': 0.10,      // 10% average annual return
  'Bonds': 0.04,       // 4% average annual return
  'Crypto': 0.15,      // 15% average annual return (speculative)
  'ETFs': 0.08,        // 8% average annual return
  'REITs': 0.07,       // 7% average annual return
  'Commodities': 0.03, // 3% average annual return
  'Options': 0.20,     // 20% average annual return (speculative)
  'Futures': 0.05,     // 5% average annual return
};

export interface MonteCarloSimulation {
  finalValues: number[];
  maxDrawdowns: number[];
  expectedReturn: number;
  medianOutcome: number;
  worst5Percent: number;
  best5Percent: number;
  mean: number;
  stdDev: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface SimulationPath {
  monthlyValues: number[];
  finalValue: number;
  maxDrawdown: number;
  totalReturn: number;
}

/**
 * Box-Muller transform to generate normally distributed random numbers
 */
function generateNormalRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0;
}

/**
 * Calculate portfolio volatility based on asset allocation
 */
export function calculatePortfolioVolatility(assets: Record<string, number>, totalValue: number): number {
  if (totalValue === 0) return 0;

  let portfolioVariance = 0;

  Object.entries(assets).forEach(([assetClass, value]) => {
    if (value > 0) {
      const weight = value / totalValue;
      const volatility = ASSET_CLASS_VOLATILITY[assetClass] || 0.15;
      portfolioVariance += Math.pow(weight * volatility, 2);
    }
  });

  return Math.sqrt(portfolioVariance);
}

/**
 * Calculate expected portfolio return based on asset allocation
 */
export function calculateExpectedReturn(assets: Record<string, number>, totalValue: number): number {
  if (totalValue === 0) return 0;

  let expectedReturn = 0;

  Object.entries(assets).forEach(([assetClass, value]) => {
    if (value > 0) {
      const weight = value / totalValue;
      const assetReturn = ASSET_CLASS_RETURNS[assetClass] || 0.08;
      expectedReturn += weight * assetReturn;
    }
  });

  return expectedReturn;
}

/**
 * Simulate a single portfolio path over 12 months
 */
function simulatePath(
  initialValue: number,
  monthlyReturn: number,
  monthlyVolatility: number,
  months: number = 12
): SimulationPath {
  const monthlyValues: number[] = [initialValue];
  let currentValue = initialValue;
  let maxValue = initialValue;
  let minValue = initialValue;

  for (let month = 0; month < months; month++) {
    // Generate random return using normal distribution
    const randomReturn = generateNormalRandom() * monthlyVolatility + monthlyReturn;
    currentValue *= 1 + randomReturn;
    monthlyValues.push(currentValue);

    maxValue = Math.max(maxValue, currentValue);
    minValue = Math.min(minValue, currentValue);
  }

  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let runningMax = initialValue;

  for (const value of monthlyValues) {
    runningMax = Math.max(runningMax, value);
    const drawdown = (runningMax - value) / runningMax;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return {
    monthlyValues,
    finalValue: currentValue,
    maxDrawdown,
    totalReturn: (currentValue - initialValue) / initialValue,
  };
}

/**
 * Run Monte Carlo simulation with 1000 paths
 */
export function runMonteCarloSimulation(
  initialValue: number,
  assets: Record<string, number>,
  numSimulations: number = 1000,
  months: number = 12
): MonteCarloSimulation {
  if (initialValue <= 0) {
    return {
      finalValues: [],
      maxDrawdowns: [],
      expectedReturn: 0,
      medianOutcome: 0,
      worst5Percent: 0,
      best5Percent: 0,
      mean: 0,
      stdDev: 0,
      confidenceInterval: { lower: 0, upper: 0 },
    };
  }

  const portfolioVolatility = calculatePortfolioVolatility(assets, initialValue);
  const expectedAnnualReturn = calculateExpectedReturn(assets, initialValue);

  // Convert annual metrics to monthly
  const monthlyReturn = expectedAnnualReturn / 12;
  const monthlyVolatility = portfolioVolatility / Math.sqrt(12);

  const finalValues: number[] = [];
  const maxDrawdowns: number[] = [];

  // Run simulations
  for (let i = 0; i < numSimulations; i++) {
    const path = simulatePath(initialValue, monthlyReturn, monthlyVolatility, months);
    finalValues.push(path.finalValue);
    maxDrawdowns.push(path.maxDrawdown);
  }

  // Sort for percentile calculations
  finalValues.sort((a, b) => a - b);
  maxDrawdowns.sort((a, b) => a - b);

  // Calculate statistics
  const mean = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
  const variance = finalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / finalValues.length;
  const stdDev = Math.sqrt(variance);

  // Calculate percentiles
  const medianIndex = Math.floor(finalValues.length / 2);
  const worst5Index = Math.floor(finalValues.length * 0.05);
  const best5Index = Math.floor(finalValues.length * 0.95);

  return {
    finalValues,
    maxDrawdowns,
    expectedReturn: expectedAnnualReturn,
    medianOutcome: finalValues[medianIndex],
    worst5Percent: finalValues[worst5Index],
    best5Percent: finalValues[best5Index],
    mean,
    stdDev,
    confidenceInterval: {
      lower: finalValues[worst5Index],
      upper: finalValues[best5Index],
    },
  };
}

/**
 * Generate histogram data for visualization
 */
export function generateHistogramData(
  finalValues: number[],
  bins: number = 20
): { bin: string; count: number; percentage: number }[] {
  if (finalValues.length === 0) return [];

  const min = Math.min(...finalValues);
  const max = Math.max(...finalValues);
  const binWidth = (max - min) / bins;

  const histogram: number[] = new Array(bins).fill(0);

  finalValues.forEach((value) => {
    let binIndex = Math.floor((value - min) / binWidth);
    if (binIndex === bins) binIndex = bins - 1; // Handle edge case
    histogram[binIndex]++;
  });

  return histogram.map((count, index) => {
    const binStart = min + index * binWidth;
    const binEnd = binStart + binWidth;
    return {
      bin: `SGD ${Math.round(binStart / 1000)}k - ${Math.round(binEnd / 1000)}k`,
      count,
      percentage: (count / finalValues.length) * 100,
    };
  });
}

/**
 * Calculate Value at Risk (VaR) at given confidence level
 */
export function calculateVaR(finalValues: number[], confidenceLevel: number = 0.95): number {
  if (finalValues.length === 0) return 0;
  const sorted = [...finalValues].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * (1 - confidenceLevel))));
  return sorted[index];
}

/**
 * Calculate Conditional Value at Risk (CVaR) - average of worst outcomes
 */
export function calculateCVaR(finalValues: number[], confidenceLevel: number = 0.95): number {
  const sorted = [...finalValues].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * (1 - confidenceLevel));
  const worstOutcomes = sorted.slice(0, index + 1);
  return worstOutcomes.reduce((a, b) => a + b, 0) / worstOutcomes.length;
}
