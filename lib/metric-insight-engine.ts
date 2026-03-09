import { AppData } from './types';
import {
  MetricAnalysisData,
  DebtItem,
  MetricBreakdown,
  ChartDataPoint,
  TrendDataPoint,
  FinancialInsight,
  RecommendedAction,
} from './metric-analysis-types';

/**
 * Generate comprehensive debt analysis with insights and recommendations
 */
export function generateDebtAnalysis(data: AppData): MetricAnalysisData {
  const debtItems = buildDebtItems(data);
  const breakdown = calculateDebtBreakdown(debtItems);
  const totalAssets = calculateTotalAssets(data);
  const debtRatio = totalAssets > 0 ? (breakdown.total / totalAssets) * 100 : 0;

  const chartData = debtItems.map(item => ({
    label: item.name,
    value: item.outstandingAmount,
    percentage: (item.outstandingAmount / breakdown.total) * 100,
    color: getCategoryColor(item.category),
  }));

  const trendData = generateDebtTrend(breakdown.total);
  const insights = generateDebtInsights(debtRatio, breakdown, data);
  const recommendations = generateDebtRecommendations(debtRatio, breakdown, data);
  const status = debtRatio > 300 ? 'critical' : debtRatio > 150 ? 'warning' : 'healthy';

  return {
    metricType: 'debt-ratio',
    metricName: 'Debt-to-Asset Ratio',
    currentValue: debtRatio,
    targetValue: 50,
    unit: '%',
    status,
    breakdown,
    chartData,
    trendData,
    insights,
    recommendations,
    lastUpdated: new Date(),
  };
}

/**
 * Generate liquidity analysis
 */
export function generateLiquidityAnalysis(data: AppData): MetricAnalysisData {
  const liquidAssets = data.bankAccounts
    .filter(acc => ['savings', 'daily'].includes(acc.accountType))
    .reduce((sum, acc) => sum + acc.balance, 0);

  const monthlyDebt = data.loans.reduce((sum, loan) => sum + loan.monthlyInstalment, 0);
  const liquidityMonths = monthlyDebt > 0 ? liquidAssets / monthlyDebt : 99;

  const chartData: ChartDataPoint[] = [
    {
      label: 'Liquid Assets',
      value: liquidAssets,
      color: '#00C896',
    },
    {
      label: 'Monthly Obligations',
      value: monthlyDebt * 6,
      color: '#F59E0B',
    },
  ];

  const trendData = generateLiquidityTrend(liquidAssets);
  const insights = generateLiquidityInsights(liquidityMonths, liquidAssets, monthlyDebt);
  const recommendations = generateLiquidityRecommendations(liquidityMonths, liquidAssets);
  const status = liquidityMonths >= 6 ? 'healthy' : liquidityMonths >= 3 ? 'warning' : 'critical';

  return {
    metricType: 'liquidity',
    metricName: 'Emergency Fund Coverage',
    currentValue: liquidityMonths,
    targetValue: 6,
    unit: 'months',
    status,
    breakdown: {
      items: [],
      total: liquidAssets,
      totalMonthlyPayment: monthlyDebt,
    },
    chartData,
    trendData,
    insights,
    recommendations,
    lastUpdated: new Date(),
  };
}

/**
 * Generate diversification analysis
 */
export function generateDiversificationAnalysis(data: AppData): MetricAnalysisData {
  const portfolioByClass = calculatePortfolioByAssetClass(data.holdings);
  const totalInvestments = Object.values(portfolioByClass).reduce((sum: number, val: number) => sum + val, 0);

  const chartData: ChartDataPoint[] = Object.entries(portfolioByClass).map(([assetClass, value]) => ({
    label: assetClass,
    value: value as number,
    percentage: totalInvestments > 0 ? ((value as number) / totalInvestments) * 100 : 0,
    color: getAssetClassColor(assetClass),
  }));

  const trendData = generateDiversificationTrend();
  const assetClassCount = Object.keys(portfolioByClass).length;
  const insights = generateDiversificationInsights(assetClassCount, portfolioByClass);
  const recommendations = generateDiversificationRecommendations(assetClassCount, portfolioByClass);
  const status = assetClassCount >= 4 ? 'healthy' : assetClassCount >= 2 ? 'warning' : 'critical';

  return {
    metricType: 'diversification',
    metricName: 'Portfolio Diversification',
    currentValue: assetClassCount,
    targetValue: 4,
    unit: 'asset classes',
    status,
    breakdown: {
      items: [],
      total: totalInvestments,
      totalMonthlyPayment: 0,
    },
    chartData,
    trendData,
    insights,
    recommendations,
    lastUpdated: new Date(),
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function buildDebtItems(data: AppData): DebtItem[] {
  const items: DebtItem[] = [];

  data.loans.forEach((loan, idx) => {
    const isMortgage = loan.loanType === 'mortgage';
    items.push({
      id: `loan-${idx}`,
      category: isMortgage ? 'mortgage' : 'personal-loan',
      name: loan.bankName || (isMortgage ? 'Mortgage' : 'Loan'),
      outstandingAmount: loan.outstandingBalance,
      monthlyPayment: loan.monthlyInstalment,
      interestRate: loan.interestRate,
      icon: isMortgage ? '🏠' : '💰',
    });
  });

  return items;
}

function calculateDebtBreakdown(items: DebtItem[]): MetricBreakdown {
  const total = items.reduce((sum, item) => sum + item.outstandingAmount, 0);
  const totalMonthlyPayment = items.reduce((sum, item) => sum + item.monthlyPayment, 0);
  const itemsWithRate = items.filter(item => item.interestRate);
  const avgInterestRate =
    itemsWithRate.length > 0
      ? itemsWithRate.reduce((sum, item) => sum + (item.interestRate || 0), 0) / itemsWithRate.length
      : undefined;

  return {
    items,
    total,
    totalMonthlyPayment,
    averageInterestRate: avgInterestRate,
  };
}

function calculateTotalAssets(data: AppData): number {
  const bankBalance = data.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const investmentValue = data.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  return bankBalance + investmentValue;
}

function calculatePortfolioByAssetClass(holdings: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  holdings.forEach(holding => {
    const assetClass = holding.assetClass || 'Other';
    result[assetClass] = (result[assetClass] || 0) + holding.quantity * holding.currentPrice;
  });
  return result;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    mortgage: '#1A3C5E',
    'personal-loan': '#F59E0B',
    'credit-card': '#EF5350',
    other: '#9CA3AF',
  };
  return colors[category] || '#9CA3AF';
}

function getAssetClassColor(assetClass: string): string {
  const colors: Record<string, string> = {
    Stocks: '#00C896',
    Bonds: '#3B82F6',
    'Real Estate': '#8B5CF6',
    Commodities: '#F59E0B',
    Crypto: '#EC4899',
    Other: '#9CA3AF',
  };
  return colors[assetClass] || '#9CA3AF';
}

function generateDebtTrend(totalDebt: number): TrendDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, idx) => ({
    month,
    value: totalDebt * (1 - idx * 0.05),
  }));
}

function generateLiquidityTrend(liquidAssets: number): TrendDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, idx) => ({
    month,
    value: liquidAssets * (0.95 + Math.random() * 0.1),
  }));
}

function generateDiversificationTrend(): TrendDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    value: 3 + Math.random() * 2,
  }));
}

function generateDebtInsights(debtRatio: number, breakdown: MetricBreakdown, data: AppData): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (debtRatio > 300) {
    insights.push({
      id: 'high-debt-warning',
      type: 'warning',
      title: 'High Debt-to-Asset Ratio',
      description: `Your debt-to-asset ratio is ${debtRatio.toFixed(0)}%. This exceeds safe thresholds and may affect long-term financial resilience and creditworthiness.`,
      severity: 'high',
      icon: '⚠️',
    });
  } else if (debtRatio > 150) {
    insights.push({
      id: 'moderate-debt-warning',
      type: 'info',
      title: 'Moderate Debt Levels',
      description: `Your debt-to-asset ratio is ${debtRatio.toFixed(0)}%. While manageable, consider strategies to reduce debt and improve financial flexibility.`,
      severity: 'medium',
      icon: 'ℹ️',
    });
  } else {
    insights.push({
      id: 'healthy-debt',
      type: 'success',
      title: 'Healthy Debt Levels',
      description: `Your debt-to-asset ratio is ${debtRatio.toFixed(0)}%. This is within healthy ranges and indicates good financial management.`,
      severity: 'low',
      icon: '✅',
    });
  }

  if (breakdown.averageInterestRate && breakdown.averageInterestRate > 5) {
    insights.push({
      id: 'high-interest-debt',
      type: 'warning',
      title: 'High Interest Rates',
      description: `Your average interest rate is ${breakdown.averageInterestRate.toFixed(1)}%. Consider refinancing opportunities to reduce interest costs.`,
      severity: 'medium',
      icon: '📈',
    });
  }

  return insights;
}

function generateLiquidityInsights(liquidityMonths: number, liquidAssets: number, monthlyDebt: number): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (liquidityMonths < 3) {
    insights.push({
      id: 'low-liquidity-warning',
      type: 'warning',
      title: 'Low Emergency Fund',
      description: `Your liquid assets cover only ${liquidityMonths.toFixed(1)} months of obligations. Aim for 6 months to protect against income disruptions.`,
      severity: 'high',
      icon: '💧',
    });
  } else if (liquidityMonths < 6) {
    insights.push({
      id: 'moderate-liquidity',
      type: 'info',
      title: 'Building Emergency Fund',
      description: `Your liquid assets cover ${liquidityMonths.toFixed(1)} months of obligations. Continue building toward a 6-month emergency fund.`,
      severity: 'medium',
      icon: 'ℹ️',
    });
  } else {
    insights.push({
      id: 'healthy-liquidity',
      type: 'success',
      title: 'Strong Emergency Fund',
      description: `Your liquid assets cover ${liquidityMonths.toFixed(1)} months of obligations. You have a solid financial cushion.`,
      severity: 'low',
      icon: '✅',
    });
  }

  return insights;
}

function generateDiversificationInsights(assetClassCount: number, portfolioByClass: Record<string, number>): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (assetClassCount < 2) {
    insights.push({
      id: 'low-diversification',
      type: 'warning',
      title: 'Low Portfolio Diversification',
      description: `You hold only ${assetClassCount} asset class. Diversification reduces risk and improves long-term returns.`,
      severity: 'high',
      icon: '⚠️',
    });
  } else if (assetClassCount < 4) {
    insights.push({
      id: 'moderate-diversification',
      type: 'info',
      title: 'Moderate Diversification',
      description: `You hold ${assetClassCount} asset classes. Consider adding more classes like bonds or REITs for better risk management.`,
      severity: 'medium',
      icon: 'ℹ️',
    });
  } else {
    insights.push({
      id: 'good-diversification',
      type: 'success',
      title: 'Well-Diversified Portfolio',
      description: `You hold ${assetClassCount} asset classes. Your portfolio is well-diversified across different investment types.`,
      severity: 'low',
      icon: '✅',
    });
  }

  return insights;
}

function generateDebtRecommendations(debtRatio: number, breakdown: MetricBreakdown, data: AppData): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];

  if (breakdown.averageInterestRate && breakdown.averageInterestRate > 4) {
    recommendations.push({
      id: 'refinance-debt',
      priority: 'high',
      title: 'Refinance High-Interest Debt',
      description: `Refinancing your debt from ${breakdown.averageInterestRate.toFixed(1)}% to 3.5% could reduce your monthly payments by approximately SGD ${(breakdown.total * 0.01).toFixed(0)}.`,
      estimatedImpact: `Save SGD ${(breakdown.totalMonthlyPayment * 0.15).toFixed(0)}/month`,
      timeframe: '3-6 months',
      icon: '💰',
    });
  }

  if (debtRatio > 150) {
    recommendations.push({
      id: 'accelerate-payments',
      priority: 'medium',
      title: 'Increase Monthly Payments',
      description: `Increasing your monthly debt payments by 20% could reduce your debt-to-asset ratio from ${debtRatio.toFixed(0)}% to ${(debtRatio * 0.8).toFixed(0)}% within 2 years.`,
      estimatedImpact: `Reduce debt ratio by ${(debtRatio * 0.2).toFixed(0)}%`,
      timeframe: '24 months',
      icon: '📈',
    });
  }

  return recommendations;
}

function generateLiquidityRecommendations(liquidityMonths: number, liquidAssets: number): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];

  if (liquidityMonths < 6) {
    recommendations.push({
      id: 'build-emergency-fund',
      priority: 'high',
      title: 'Build Emergency Fund',
      description: `Increase your liquid savings to cover 6 months of expenses. Start by saving SGD ${(liquidAssets * 0.2).toFixed(0)} monthly.`,
      estimatedImpact: `Reach 6-month emergency fund`,
      timeframe: `${Math.ceil((6 - liquidityMonths) * 12)} months`,
      icon: '💾',
    });
  }

  return recommendations;
}

function generateDiversificationRecommendations(assetClassCount: number, portfolioByClass: Record<string, number>): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];

  if (assetClassCount < 4) {
    recommendations.push({
      id: 'add-bonds',
      priority: 'medium',
      title: 'Add Bond Allocation',
      description: 'Allocate 20-30% of your portfolio to bonds for stability and income generation.',
      estimatedImpact: `Reduce portfolio volatility by 15-20%`,
      timeframe: 'Immediate',
      icon: '📊',
    });
  }

  return recommendations;
}
