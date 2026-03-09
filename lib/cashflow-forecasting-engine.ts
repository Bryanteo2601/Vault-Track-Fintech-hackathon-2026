/**
 * 12-Month Cashflow Forecasting Engine
 * Projects monthly balance with liquidity warnings
 */

export interface MonthlyTransaction {
  income: number;
  expenses: number;
  loanPayments: number;
  otherInflows: number;
  otherOutflows: number;
}

export interface MonthlyForecast {
  month: number;
  monthName: string;
  date: Date;
  openingBalance: number;
  income: number;
  expenses: number;
  loanPayments: number;
  otherInflows: number;
  otherOutflows: number;
  closingBalance: number;
  netCashFlow: number;
  isLiquidityWarning: boolean;
  isCriticalWarning: boolean;
  warningReason?: string;
}

export interface CashflowForecast {
  startingBalance: number;
  safetyThreshold: number;
  forecastMonths: MonthlyForecast[];
  minimumBalance: number;
  minimumBalanceMonth: number;
  averageMonthlyBalance: number;
  monthsWithWarnings: number;
  monthsWithCriticalWarnings: number;
  projectedEndingBalance: number;
  recommendations: string[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculate safety threshold based on monthly expenses
 * Default: 3 months of average expenses
 */
export function calculateSafetyThreshold(
  monthlyTransactions: MonthlyTransaction[],
  thresholdMonths: number = 3
): number {
  const averageExpenses = monthlyTransactions.reduce((sum, t) => sum + t.expenses, 0) / monthlyTransactions.length;
  return averageExpenses * thresholdMonths;
}

/**
 * Project monthly balance
 * balance[t] = previous_balance + income - expenses - loan_payments + other_inflows - other_outflows
 */
export function projectMonthlyBalance(
  previousBalance: number,
  transaction: MonthlyTransaction
): number {
  return previousBalance + transaction.income - transaction.expenses - transaction.loanPayments + transaction.otherInflows - transaction.otherOutflows;
}

/**
 * Check if balance is below safety threshold
 */
export function isLiquidityWarning(
  balance: number,
  safetyThreshold: number
): { isWarning: boolean; isCritical: boolean } {
  const criticalThreshold = safetyThreshold * 0.5; // 50% of safety threshold
  const warningThreshold = safetyThreshold;

  return {
    isWarning: balance < warningThreshold,
    isCritical: balance < criticalThreshold,
  };
}

/**
 * Generate liquidity warning message
 */
export function generateLiquidityWarning(
  balance: number,
  safetyThreshold: number,
  monthName: string
): string | undefined {
  const criticalThreshold = safetyThreshold * 0.5;

  if (balance < criticalThreshold) {
    return `CRITICAL: ${monthName} balance (SGD ${balance.toLocaleString('en', { maximumFractionDigits: 0 })}) is critically low. Immediate action needed.`;
  }

  if (balance < safetyThreshold) {
    const shortfall = safetyThreshold - balance;
    return `WARNING: ${monthName} balance (SGD ${balance.toLocaleString('en', { maximumFractionDigits: 0 })}) is below safety threshold by SGD ${shortfall.toLocaleString('en', { maximumFractionDigits: 0 })}.`;
  }

  return undefined;
}

/**
 * Generate cashflow forecast for 12 months
 */
export function generateCashflowForecast(
  startingBalance: number,
  monthlyTransactions: MonthlyTransaction[],
  safetyThreshold?: number
): CashflowForecast {
  // Validate input
  if (monthlyTransactions.length === 0) {
    return {
      startingBalance,
      safetyThreshold: 0,
      forecastMonths: [],
      minimumBalance: startingBalance,
      minimumBalanceMonth: 0,
      averageMonthlyBalance: startingBalance,
      monthsWithWarnings: 0,
      monthsWithCriticalWarnings: 0,
      projectedEndingBalance: startingBalance,
      recommendations: ['No transaction data available for forecasting.'],
    };
  }

  // Use provided safety threshold or calculate it
  const threshold = safetyThreshold ?? calculateSafetyThreshold(monthlyTransactions);

  const forecastMonths: MonthlyForecast[] = [];
  let currentBalance = startingBalance;
  let minimumBalance = startingBalance;
  let minimumBalanceMonth = 0;
  let monthsWithWarnings = 0;
  let monthsWithCriticalWarnings = 0;
  const balances: number[] = [startingBalance];

  const currentDate = new Date();

  monthlyTransactions.slice(0, 12).forEach((transaction, index) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + index, 1);
    const monthName = MONTH_NAMES[monthDate.getMonth()];
    const monthNumber = monthDate.getMonth() + 1;

    const netCashFlow = transaction.income - transaction.expenses - transaction.loanPayments + transaction.otherInflows - transaction.otherOutflows;
    const closingBalance = projectMonthlyBalance(currentBalance, transaction);

    const { isWarning, isCritical } = isLiquidityWarning(closingBalance, threshold);
    const warningReason = generateLiquidityWarning(closingBalance, threshold, monthName);

    if (isWarning) monthsWithWarnings++;
    if (isCritical) monthsWithCriticalWarnings++;

    if (closingBalance < minimumBalance) {
      minimumBalance = closingBalance;
      minimumBalanceMonth = monthNumber;
    }

    forecastMonths.push({
      month: monthNumber,
      monthName,
      date: monthDate,
      openingBalance: currentBalance,
      income: transaction.income,
      expenses: transaction.expenses,
      loanPayments: transaction.loanPayments,
      otherInflows: transaction.otherInflows,
      otherOutflows: transaction.otherOutflows,
      closingBalance,
      netCashFlow,
      isLiquidityWarning: isWarning,
      isCriticalWarning: isCritical,
      warningReason,
    });

    balances.push(closingBalance);
    currentBalance = closingBalance;
  });

  // Calculate recommendations
  const recommendations = generateCashflowRecommendations(
    minimumBalance,
    threshold,
    monthsWithCriticalWarnings,
    monthsWithWarnings,
    forecastMonths
  );

  const averageMonthlyBalance = balances.reduce((sum, b) => sum + b, 0) / balances.length;

  return {
    startingBalance,
    safetyThreshold: threshold,
    forecastMonths,
    minimumBalance,
    minimumBalanceMonth,
    averageMonthlyBalance,
    monthsWithWarnings,
    monthsWithCriticalWarnings,
    projectedEndingBalance: currentBalance,
    recommendations,
  };
}

/**
 * Generate cashflow recommendations
 */
export function generateCashflowRecommendations(
  minimumBalance: number,
  safetyThreshold: number,
  monthsWithCritical: number,
  monthsWithWarnings: number,
  forecastMonths: MonthlyForecast[]
): string[] {
  const recommendations: string[] = [];

  if (monthsWithCritical > 0) {
    recommendations.push(`⚠️ CRITICAL: ${monthsWithCritical} month(s) with critically low balance. Build emergency fund immediately.`);
  }

  if (monthsWithWarnings > 0) {
    recommendations.push(`${monthsWithWarnings} month(s) projected below safety threshold. Review expense patterns and consider cost reduction.`);
  }

  if (minimumBalance < 0) {
    recommendations.push('Your forecast shows negative balance. You need immediate income increase or expense reduction.');
  } else if (minimumBalance < safetyThreshold * 0.5) {
    recommendations.push('Minimum balance is critically low. Build emergency reserves to 3-6 months of expenses.');
  }

  // Check for consistent negative cash flow
  const negativeMonths = forecastMonths.filter((m) => m.netCashFlow < 0).length;
  if (negativeMonths > 6) {
    recommendations.push(`${negativeMonths} months show negative cash flow. Your expenses exceed income. Urgent action needed.`);
  }

  // Check for seasonal patterns
  const highExpenseMonths = forecastMonths.filter((m) => m.expenses > forecastMonths[0].expenses * 1.5);
  if (highExpenseMonths.length > 0) {
    const monthNames = highExpenseMonths.map((m) => m.monthName).join(', ');
    recommendations.push(`High expenses detected in: ${monthNames}. Plan ahead for these months.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Your cashflow forecast looks healthy. Maintain current spending patterns.');
  }

  return recommendations;
}

/**
 * Calculate average monthly expenses from forecast
 */
export function calculateAverageMonthlyExpenses(monthlyTransactions: MonthlyTransaction[]): number {
  if (monthlyTransactions.length === 0) return 0;
  const totalExpenses = monthlyTransactions.reduce((sum, t) => sum + t.expenses, 0);
  return totalExpenses / monthlyTransactions.length;
}

/**
 * Calculate average monthly income from forecast
 */
export function calculateAverageMonthlyIncome(monthlyTransactions: MonthlyTransaction[]): number {
  if (monthlyTransactions.length === 0) return 0;
  const totalIncome = monthlyTransactions.reduce((sum, t) => sum + t.income, 0);
  return totalIncome / monthlyTransactions.length;
}

/**
 * Find months with highest and lowest balance
 */
export function findBalanceExtremes(forecastMonths: MonthlyForecast[]): {
  highestBalance: number;
  highestBalanceMonth: string;
  lowestBalance: number;
  lowestBalanceMonth: string;
} {
  if (forecastMonths.length === 0) {
    return {
      highestBalance: 0,
      highestBalanceMonth: 'N/A',
      lowestBalance: 0,
      lowestBalanceMonth: 'N/A',
    };
  }

  let highest = forecastMonths[0];
  let lowest = forecastMonths[0];

  forecastMonths.forEach((month) => {
    if (month.closingBalance > highest.closingBalance) highest = month;
    if (month.closingBalance < lowest.closingBalance) lowest = month;
  });

  return {
    highestBalance: highest.closingBalance,
    highestBalanceMonth: highest.monthName,
    lowestBalance: lowest.closingBalance,
    lowestBalanceMonth: lowest.monthName,
  };
}

/**
 * Calculate total inflows and outflows for the forecast period
 */
export function calculateForecastTotals(monthlyTransactions: MonthlyTransaction[]): {
  totalIncome: number;
  totalExpenses: number;
  totalLoanPayments: number;
  totalOtherInflows: number;
  totalOtherOutflows: number;
  netCashFlow: number;
} {
  const totals = monthlyTransactions.reduce(
    (acc, t) => ({
      totalIncome: acc.totalIncome + t.income,
      totalExpenses: acc.totalExpenses + t.expenses,
      totalLoanPayments: acc.totalLoanPayments + t.loanPayments,
      totalOtherInflows: acc.totalOtherInflows + t.otherInflows,
      totalOtherOutflows: acc.totalOtherOutflows + t.otherOutflows,
    }),
    {
      totalIncome: 0,
      totalExpenses: 0,
      totalLoanPayments: 0,
      totalOtherInflows: 0,
      totalOtherOutflows: 0,
    }
  );

  return {
    ...totals,
    netCashFlow: totals.totalIncome - totals.totalExpenses - totals.totalLoanPayments + totals.totalOtherInflows - totals.totalOtherOutflows,
  };
}
