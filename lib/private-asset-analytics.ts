import { PrivateAsset } from './types';

export interface TimeSeriesPoint {
  date: string;
  value: number;
  assetCount: number;
}

export interface GrowthMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  gainLossPercent: number;
  cagr: number;
  annualGrowthRate: number; // Full precision internal rate
  methodology: 'historical' | 'cost-basis' | 'insufficient';
  confidence: 'high' | 'medium' | 'low';
  projections: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  projectionGains: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  timeSeriesData: TimeSeriesPoint[];
  earliestDate: string | null;
  latestDate: string | null;
  yearsElapsed: number;
  methodologyLabel: string;
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * CAGR = (endValue / startValue)^(1 / yearsElapsed) - 1
 * 
 * Per spec:
 * - endValue = latest total private assets value
 * - beginningValue = earliest comparable total private assets value
 * - yearsElapsed = time difference in years
 */
function calculateCAGR(startValue: number, endValue: number, yearsElapsed: number): number {
  // Never divide by zero
  if (startValue <= 0 || yearsElapsed <= 0) return 0;
  if (endValue <= 0) return -1; // Total loss
  
  const cagr = Math.pow(endValue / startValue, 1 / yearsElapsed) - 1;
  return isFinite(cagr) ? cagr : 0;
}

/**
 * Calculate implied annual growth from cost basis
 * impliedGrowth = (currentValue / totalCostBasis)^(1 / weightedYearsHeld) - 1
 */
function calculateImpliedGrowthFromCostBasis(
  currentValue: number,
  totalCostBasis: number,
  weightedYearsHeld: number
): number {
  if (totalCostBasis <= 0 || weightedYearsHeld <= 0) return 0;
  if (currentValue <= 0) return -1;
  
  const implied = Math.pow(currentValue / totalCostBasis, 1 / weightedYearsHeld) - 1;
  return isFinite(implied) ? implied : 0;
}

/**
 * Calculate weighted average holding period
 * weightedYearsHeld = sum(assetWeight * yearsHeld)
 * where assetWeight is based on current value share
 */
function calculateWeightedYearsHeld(assets: PrivateAsset[]): number {
  if (assets.length === 0) return 0;
  
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentEstimatedValue, 0);
  if (totalCurrentValue <= 0) return 0;
  
  const today = new Date();
  let weightedSum = 0;
  
  assets.forEach(asset => {
    const purchaseDate = new Date(asset.createdAt); // Use createdAt as purchase date
    const yearsHeld = Math.max(
      (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
      0.25 // Minimum threshold to avoid absurd rates
    );
    
    const weight = asset.currentEstimatedValue / totalCurrentValue;
    weightedSum += weight * yearsHeld;
  });
  
  return weightedSum;
}

/**
 * Project future value using consistent annual growth rate
 * futureValue(years) = currentValue * (1 + annualGrowthRate)^years
 * 
 * Uses full precision internally, only rounds for display
 */
function projectValue(currentValue: number, annualGrowthRate: number, years: number): number {
  if (currentValue <= 0) return 0;
  const projected = currentValue * Math.pow(1 + annualGrowthRate, years);
  return isFinite(projected) ? projected : currentValue;
}

/**
 * Generate time series data from all private assets
 */
function generateTimeSeries(assets: PrivateAsset[]): TimeSeriesPoint[] {
  const timeSeriesMap = new Map<string, number>();
  
  // Collect all valuation points
  assets.forEach(asset => {
    if (asset.historicalValuations && asset.historicalValuations.length > 0) {
      asset.historicalValuations.forEach(valuation => {
        const date = valuation.date;
        const currentValue = timeSeriesMap.get(date) || 0;
        timeSeriesMap.set(date, currentValue + valuation.estimatedValue);
      });
    }
    
    // Add current valuation
    if (asset.currentEstimatedValue > 0) {
      const date = asset.updatedAt.split('T')[0]; // Get date part only
      const currentValue = timeSeriesMap.get(date) || 0;
      timeSeriesMap.set(date, currentValue + asset.currentEstimatedValue);
    }
  });
  
  // Sort by date and convert to array
  const sortedDates = Array.from(timeSeriesMap.keys()).sort();
  return sortedDates.map(date => ({
    date,
    value: timeSeriesMap.get(date) || 0,
    assetCount: assets.length,
  }));
}

/**
 * Calculate comprehensive growth metrics for private assets
 * Following the backend specification exactly
 */
export function calculatePrivateAssetMetrics(assets: PrivateAsset[]): GrowthMetrics {
  if (assets.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      gainLossPercent: 0,
      cagr: 0,
      annualGrowthRate: 0,
      methodology: 'insufficient',
      confidence: 'low',
      projections: { oneYear: 0, threeYear: 0, fiveYear: 0 },
      projectionGains: { oneYear: 0, threeYear: 0, fiveYear: 0 },
      timeSeriesData: [],
      earliestDate: null,
      latestDate: null,
      yearsElapsed: 0,
      methodologyLabel: 'No private assets to analyze.',
    };
  }

  // PART 1: Define the correct base
  // currentPrivateAssetsValue = sum of currentEstimatedValue across all private assets
  const currentPrivateAssetsValue = assets.reduce((sum, a) => sum + a.currentEstimatedValue, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalGainLoss = currentPrivateAssetsValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Generate time series
  const timeSeries = generateTimeSeries(assets);
  
  // PART 2: Calculate annualized growth using priority methodology
  let annualGrowthRate = 0;
  let yearsElapsed = 0;
  let methodology: 'historical' | 'cost-basis' | 'insufficient' = 'insufficient';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let methodologyLabel = 'Add more valuation history to improve projection accuracy.';

  // Method A: Historical Portfolio CAGR
  if (timeSeries.length >= 2) {
    const startValue = timeSeries[0].value;
    const endValue = timeSeries[timeSeries.length - 1].value;
    
    const startDate = new Date(timeSeries[0].date);
    const endDate = new Date(timeSeries[timeSeries.length - 1].date);
    
    yearsElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsElapsed > 0 && startValue > 0) {
      annualGrowthRate = calculateCAGR(startValue, endValue, yearsElapsed);
      methodology = 'historical';
      confidence = 'high';
      methodologyLabel = 'Projections are based on historical private asset valuation growth.';
    }
  }

  // Method B: Cost-Basis Implied CAGR (fallback)
  if (methodology === 'insufficient' && totalCost > 0 && currentPrivateAssetsValue > 0) {
    const weightedYearsHeld = calculateWeightedYearsHeld(assets);
    if (weightedYearsHeld > 0) {
      annualGrowthRate = calculateImpliedGrowthFromCostBasis(
        currentPrivateAssetsValue,
        totalCost,
        weightedYearsHeld
      );
      yearsElapsed = weightedYearsHeld;
      methodology = 'cost-basis';
      confidence = 'medium';
      methodologyLabel = 'Projections are estimated from purchase cost, current value, and holding period.';
    }
  }

  // PART 3: Fix future projections
  // All projections must use the exact same annual growth rate
  const projections = {
    oneYear: projectValue(currentPrivateAssetsValue, annualGrowthRate, 1),
    threeYear: projectValue(currentPrivateAssetsValue, annualGrowthRate, 3),
    fiveYear: projectValue(currentPrivateAssetsValue, annualGrowthRate, 5),
  };

  // PART 4: Calculate projected gains
  const projectionGains = {
    oneYear: projections.oneYear - currentPrivateAssetsValue,
    threeYear: projections.threeYear - currentPrivateAssetsValue,
    fiveYear: projections.fiveYear - currentPrivateAssetsValue,
  };

  // CAGR for display (same as annualGrowthRate, just for backward compatibility)
  const cagr = annualGrowthRate;

  return {
    totalValue: currentPrivateAssetsValue,
    totalCost,
    totalGainLoss,
    gainLossPercent,
    cagr,
    annualGrowthRate, // Full precision internal rate
    methodology,
    confidence,
    projections,
    projectionGains,
    timeSeriesData: timeSeries,
    earliestDate: timeSeries.length > 0 ? timeSeries[0].date : null,
    latestDate: timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].date : null,
    yearsElapsed,
    methodologyLabel,
  };
}

/**
 * Format CAGR as percentage string
 * Uses full precision internally, rounds only for display
 */
export function formatCAGR(cagr: number): string {
  if (!isFinite(cagr)) return 'N/A';
  return `${(cagr * 100).toFixed(2)}%`;
}

/**
 * Get growth status based on CAGR
 * NEW LOGIC: Green if positive, Red if not positive
 * Removed "Slow Growth" and "Poor" categories
 */
export function getGrowthStatus(cagr: number): 'positive' | 'negative' {
  return cagr > 0 ? 'positive' : 'negative';
}
