/**
 * Net Worth Timeline
 * Track and visualize net worth over time with historical data
 */

export interface NetWorthDataPoint {
  date: Date;
  year: number;
  month: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: Record<string, number>;
  liabilityBreakdown: Record<string, number>;
}

export interface TimelineMetrics {
  currentNetWorth: number;
  previousNetWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  averageMonthlyGrowth: number;
  projectedNetWorth1Year: number;
  projectedNetWorth5Years: number;
  yearsToFinancialGoal: number;
  financialGoal: number;
}

export interface YearlyNetWorth {
  year: number;
  startNetWorth: number;
  endNetWorth: number;
  yearlyGrowth: number;
  yearlyGrowthPercent: number;
  highestMonth: number;
  lowestMonth: number;
  averageMonth: number;
}

export interface NetWorthTrend {
  period: 'month' | 'quarter' | 'year';
  dataPoints: NetWorthDataPoint[];
  metrics: TimelineMetrics;
  yearlyBreakdown: YearlyNetWorth[];
}

/**
 * Generate sample net worth data for 2022-2025
 */
export function generateSampleNetWorthData(): NetWorthDataPoint[] {
  const data: NetWorthDataPoint[] = [];
  const startDate = new Date(2022, 0, 1);

  // Base values and growth rates
  const baseAssets = 200000;
  const baseLiabilities = 150000;
  const monthlyGrowthRate = 0.015; // 1.5% monthly growth

  for (let month = 0; month <= 36; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month);

    // Calculate net worth with compound growth
    const growthFactor = Math.pow(1 + monthlyGrowthRate, month);
    const totalAssets = baseAssets * growthFactor + (Math.random() * 20000 - 10000); // Add some variance
    const totalLiabilities = Math.max(50000, baseLiabilities * (0.98 ** (month / 12))); // Liabilities decrease over time

    const netWorth = totalAssets - totalLiabilities;

    data.push({
      date: currentDate,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth),
      assetBreakdown: {
        'Stocks': totalAssets * 0.35,
        'Real Estate': totalAssets * 0.30,
        'Bonds': totalAssets * 0.15,
        'Cash': totalAssets * 0.10,
        'Crypto': totalAssets * 0.10,
      },
      liabilityBreakdown: {
        'Mortgage': totalLiabilities * 0.70,
        'Personal Loans': totalLiabilities * 0.20,
        'Credit Cards': totalLiabilities * 0.10,
      },
    });
  }

  return data;
}

/**
 * Calculate timeline metrics
 */
export function calculateTimelineMetrics(data: NetWorthDataPoint[], financialGoal: number = 1000000): TimelineMetrics {
  if (data.length === 0) {
    return {
      currentNetWorth: 0,
      previousNetWorth: 0,
      netWorthChange: 0,
      netWorthChangePercent: 0,
      averageMonthlyGrowth: 0,
      projectedNetWorth1Year: 0,
      projectedNetWorth5Years: 0,
      yearsToFinancialGoal: 0,
      financialGoal,
    };
  }

  const currentNetWorth = data[data.length - 1].netWorth;
  const previousNetWorth = data[Math.max(0, data.length - 13)].netWorth; // 12 months ago
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercent = previousNetWorth > 0 ? (netWorthChange / previousNetWorth) * 100 : 0;

  // Calculate average monthly growth
  const monthlyGrowths = [];
  for (let i = 1; i < data.length; i++) {
    const growth = (data[i].netWorth - data[i - 1].netWorth) / Math.max(1, data[i - 1].netWorth);
    monthlyGrowths.push(growth);
  }
  const averageMonthlyGrowth = monthlyGrowths.length > 0 ? monthlyGrowths.reduce((a, b) => a + b, 0) / monthlyGrowths.length : 0;

  // Project future net worth
  const projectedNetWorth1Year = currentNetWorth * Math.pow(1 + averageMonthlyGrowth, 12);
  const projectedNetWorth5Years = currentNetWorth * Math.pow(1 + averageMonthlyGrowth, 60);

  // Calculate years to financial goal
  let yearsToGoal = 0;
  if (averageMonthlyGrowth > 0) {
    yearsToGoal = Math.log(financialGoal / Math.max(1, currentNetWorth)) / Math.log(1 + averageMonthlyGrowth) / 12;
  }

  return {
    currentNetWorth,
    previousNetWorth,
    netWorthChange,
    netWorthChangePercent,
    averageMonthlyGrowth,
    projectedNetWorth1Year: Math.round(projectedNetWorth1Year),
    projectedNetWorth5Years: Math.round(projectedNetWorth5Years),
    yearsToFinancialGoal: Math.max(0, Math.round(yearsToGoal * 10) / 10),
    financialGoal,
  };
}

/**
 * Generate yearly breakdown
 */
export function generateYearlyBreakdown(data: NetWorthDataPoint[]): YearlyNetWorth[] {
  const yearlyData: Record<number, NetWorthDataPoint[]> = {};

  // Group data by year
  data.forEach(point => {
    if (!yearlyData[point.year]) {
      yearlyData[point.year] = [];
    }
    yearlyData[point.year].push(point);
  });

  // Calculate yearly metrics
  return Object.entries(yearlyData)
    .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
    .map(([year, yearPoints]) => {
      const startNetWorth = yearPoints[0].netWorth;
      const endNetWorth = yearPoints[yearPoints.length - 1].netWorth;
      const yearlyGrowth = endNetWorth - startNetWorth;
      const yearlyGrowthPercent = startNetWorth > 0 ? (yearlyGrowth / startNetWorth) * 100 : 0;

      const netWorths = yearPoints.map(p => p.netWorth);
      const highestMonth = Math.max(...netWorths);
      const lowestMonth = Math.min(...netWorths);
      const averageMonth = netWorths.reduce((a, b) => a + b, 0) / netWorths.length;

      return {
        year: Number(year),
        startNetWorth: Math.round(startNetWorth),
        endNetWorth: Math.round(endNetWorth),
        yearlyGrowth: Math.round(yearlyGrowth),
        yearlyGrowthPercent: Math.round(yearlyGrowthPercent * 100) / 100,
        highestMonth: Math.round(highestMonth),
        lowestMonth: Math.round(lowestMonth),
        averageMonth: Math.round(averageMonth),
      };
    });
}

/**
 * Get data for specific time range
 */
export function getTimelineData(data: NetWorthDataPoint[], period: 'month' | 'quarter' | 'year'): NetWorthTrend {
  let filteredData = data;

  if (period === 'year') {
    // Keep only year-end data
    const yearEndData: Record<number, NetWorthDataPoint> = {};
    data.forEach(point => {
      if (point.month === 12 || point === data[data.length - 1]) {
        yearEndData[point.year] = point;
      }
    });
    filteredData = Object.values(yearEndData).sort((a, b) => a.date.getTime() - b.date.getTime());
  } else if (period === 'quarter') {
    // Keep only quarter-end data
    filteredData = data.filter(point => [3, 6, 9, 12].includes(point.month) || point === data[data.length - 1]);
  }

  const metrics = calculateTimelineMetrics(filteredData);
  const yearlyBreakdown = generateYearlyBreakdown(data);

  return {
    period,
    dataPoints: filteredData,
    metrics,
    yearlyBreakdown,
  };
}
