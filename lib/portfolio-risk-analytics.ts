import { Holding } from './types';

/**
 * Portfolio Risk Analytics Engine
 * Calculates portfolio return, volatility, and Sharpe ratio for risk assessment
 */

export interface PortfolioRiskMetrics {
  portfolioReturn: number; // Percentage
  volatility: number; // Percentage (standard deviation)
  sharpeRatio: number; // Risk-adjusted return
  riskClassification: 'Low' | 'Moderate' | 'Strong';
  totalCostBasis: number; // SGD
  totalCurrentValue: number; // SGD
  totalGainLoss: number; // SGD
  totalGainLossPct: number; // Percentage
  holdingCount: number;
}

const RISK_FREE_RATE = 0.03; // 3% annual risk-free rate

/**
 * Calculate portfolio return
 * Formula: (current_value - cost_basis) / cost_basis
 */
function calculatePortfolioReturn(holdings: Holding[]): {
  totalReturn: number;
  totalCostBasis: number;
  totalCurrentValue: number;
} {
  let totalCostBasis = 0;
  let totalCurrentValue = 0;

  holdings.forEach(holding => {
    const costBasis = holding.quantity * holding.avgCost;
    const currentValue = holding.quantity * holding.currentPrice;
    
    totalCostBasis += costBasis;
    totalCurrentValue += currentValue;
  });

  // Avoid division by zero
  if (totalCostBasis === 0) {
    return {
      totalReturn: 0,
      totalCostBasis: 0,
      totalCurrentValue: 0,
    };
  }

  const totalReturn = (totalCurrentValue - totalCostBasis) / totalCostBasis;

  return {
    totalReturn,
    totalCostBasis,
    totalCurrentValue,
  };
}

/**
 * Calculate portfolio volatility
 * Volatility = standard deviation of asset returns
 * 
 * For simplicity, we estimate volatility using:
 * 1. Individual asset P&L percentages
 * 2. Calculate standard deviation across all holdings
 */
function calculatePortfolioVolatility(holdings: Holding[]): number {
  if (holdings.length === 0) return 0;

  // Calculate individual asset returns
  const assetReturns = holdings.map(holding => {
    const costBasis = holding.quantity * holding.avgCost;
    if (costBasis === 0) return 0;
    
    const currentValue = holding.quantity * holding.currentPrice;
    return (currentValue - costBasis) / costBasis;
  });

  // Calculate mean return
  const meanReturn = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;

  // Calculate variance
  const variance = assetReturns.reduce((sum, r) => {
    return sum + Math.pow(r - meanReturn, 2);
  }, 0) / assetReturns.length;

  // Standard deviation (volatility)
  const volatility = Math.sqrt(variance);

  return volatility;
}

/**
 * Calculate Sharpe Ratio
 * Formula: (portfolio_return - risk_free_rate) / volatility
 * 
 * Sharpe Ratio measures risk-adjusted returns
 * Higher Sharpe ratio = better risk-adjusted performance
 */
function calculateSharpeRatio(portfolioReturn: number, volatility: number): number {
  // Avoid division by zero
  if (volatility === 0) {
    return portfolioReturn > RISK_FREE_RATE ? Infinity : 0;
  }

  const sharpeRatio = (portfolioReturn - RISK_FREE_RATE) / volatility;
  return sharpeRatio;
}

/**
 * Classify risk based on Sharpe Ratio
 * < 0.5 → Low risk-adjusted performance
 * 0.5–1 → Moderate
 * > 1 → Strong performance
 */
function classifyRisk(sharpeRatio: number): 'Low' | 'Moderate' | 'Strong' {
  if (sharpeRatio < 0.5) return 'Low';
  if (sharpeRatio <= 1) return 'Moderate';
  return 'Strong';
}

/**
 * Main function to calculate all portfolio risk metrics
 */
export function calculatePortfolioRiskMetrics(holdings: Holding[]): PortfolioRiskMetrics {
  // Calculate portfolio return
  const { totalReturn, totalCostBasis, totalCurrentValue } = calculatePortfolioReturn(holdings);

  // Calculate volatility
  const volatility = calculatePortfolioVolatility(holdings);

  // Calculate Sharpe Ratio
  const sharpeRatio = calculateSharpeRatio(totalReturn, volatility);

  // Classify risk
  const riskClassification = classifyRisk(sharpeRatio);

  // Calculate gain/loss
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  return {
    portfolioReturn: totalReturn * 100, // Convert to percentage
    volatility: volatility * 100, // Convert to percentage
    sharpeRatio: Math.round(sharpeRatio * 100) / 100, // Round to 2 decimals
    riskClassification,
    totalCostBasis,
    totalCurrentValue,
    totalGainLoss,
    totalGainLossPct,
    holdingCount: holdings.length,
  };
}

/**
 * Get risk classification with description and color
 */
export function getRiskClassificationDetails(classification: 'Low' | 'Moderate' | 'Strong'): {
  label: string;
  description: string;
  color: string;
  icon: string;
} {
  switch (classification) {
    case 'Low':
      return {
        label: 'Low Risk-Adjusted Performance',
        description: 'Sharpe ratio < 0.5. Consider diversifying or reviewing strategy.',
        color: '#EF4444',
        icon: '⚠️',
      };
    case 'Moderate':
      return {
        label: 'Moderate Risk-Adjusted Performance',
        description: 'Sharpe ratio 0.5–1. Balanced risk-return profile.',
        color: '#F59E0B',
        icon: '📊',
      };
    case 'Strong':
      return {
        label: 'Strong Risk-Adjusted Performance',
        description: 'Sharpe ratio > 1. Excellent risk-adjusted returns.',
        color: '#10B981',
        icon: '✨',
      };
  }
}

/**
 * Format metrics for display
 */
export function formatPortfolioMetrics(metrics: PortfolioRiskMetrics) {
  return {
    portfolioReturnDisplay: `${metrics.portfolioReturn >= 0 ? '+' : ''}${metrics.portfolioReturn.toFixed(2)}%`,
    volatilityDisplay: `${metrics.volatility.toFixed(2)}%`,
    sharpeRatioDisplay: metrics.sharpeRatio.toFixed(2),
    totalGainLossDisplay: `${metrics.totalGainLoss >= 0 ? '+' : ''}${metrics.totalGainLoss.toFixed(2)}`,
    totalGainLossPctDisplay: `${metrics.totalGainLossPct >= 0 ? '+' : ''}${metrics.totalGainLossPct.toFixed(2)}%`,
  };
}
