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
  projections: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  timeSeriesData: TimeSeriesPoint[];
  earliestDate: string | null;
  latestDate: string | null;
  yearsElapsed: number;
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * CAGR = (endValue / startValue)^(1 / yearsElapsed) - 1
 */
function calculateCAGR(startValue: number, endValue: number, yearsElapsed: number): number {
  if (startValue <= 0 || yearsElapsed <= 0) return 0;
  if (endValue <= 0) return -1; // Total loss
  
  const cagr = Math.pow(endValue / startValue, 1 / yearsElapsed) - 1;
  return isFinite(cagr) ? cagr : 0;
}

/**
 * Project future value using CAGR
 * FutureValue = currentValue * (1 + CAGR)^years
 */
function projectValue(currentValue: number, cagr: number, years: number): number {
  if (currentValue <= 0) return 0;
  const projected = currentValue * Math.pow(1 + cagr, years);
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
 */
export function calculatePrivateAssetMetrics(assets: PrivateAsset[]): GrowthMetrics {
  if (assets.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      gainLossPercent: 0,
      cagr: 0,
      projections: { oneYear: 0, threeYear: 0, fiveYear: 0 },
      timeSeriesData: [],
      earliestDate: null,
      latestDate: null,
      yearsElapsed: 0,
    };
  }

  // Calculate totals
  const totalValue = assets.reduce((sum, a) => sum + a.currentEstimatedValue, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalGainLoss = totalValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Generate time series
  const timeSeries = generateTimeSeries(assets);
  
  // Calculate CAGR and projections
  let cagr = 0;
  let yearsElapsed = 0;
  
  if (timeSeries.length >= 2) {
    const startValue = timeSeries[0].value;
    const endValue = timeSeries[timeSeries.length - 1].value;
    
    const startDate = new Date(timeSeries[0].date);
    const endDate = new Date(timeSeries[timeSeries.length - 1].date);
    
    yearsElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsElapsed > 0) {
      cagr = calculateCAGR(startValue, endValue, yearsElapsed);
    }
  }

  // Calculate projections
  const projections = {
    oneYear: projectValue(totalValue, cagr, 1),
    threeYear: projectValue(totalValue, cagr, 3),
    fiveYear: projectValue(totalValue, cagr, 5),
  };

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    gainLossPercent,
    cagr,
    projections,
    timeSeriesData: timeSeries,
    earliestDate: timeSeries.length > 0 ? timeSeries[0].date : null,
    latestDate: timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].date : null,
    yearsElapsed,
  };
}

/**
 * Format CAGR as percentage string
 */
export function formatCAGR(cagr: number): string {
  if (!isFinite(cagr)) return 'N/A';
  return `${(cagr * 100).toFixed(2)}%`;
}

/**
 * Get growth status based on CAGR
 */
export function getGrowthStatus(cagr: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'negative' {
  if (cagr >= 0.20) return 'excellent'; // 20%+
  if (cagr >= 0.10) return 'good'; // 10-20%
  if (cagr >= 0.05) return 'moderate'; // 5-10%
  if (cagr >= 0) return 'poor'; // 0-5%
  return 'negative'; // Negative
}
