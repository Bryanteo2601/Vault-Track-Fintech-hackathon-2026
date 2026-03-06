/**
 * Reusable types for drill-down financial analysis feature
 */

export type MetricType = 'debt-ratio' | 'liquidity' | 'diversification' | 'credit-score';

export interface DebtItem {
  id: string;
  category: 'mortgage' | 'personal-loan' | 'credit-card' | 'other';
  name: string;
  outstandingAmount: number;
  monthlyPayment: number;
  interestRate?: number;
  totalAmount?: number;
  dueDate?: string;
  icon: string;
}

export interface MetricBreakdown {
  items: DebtItem[];
  total: number;
  totalMonthlyPayment: number;
  averageInterestRate?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface TrendDataPoint {
  month: string;
  value: number;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'info' | 'opportunity' | 'success';
  title: string;
  description: string;
  severity?: 'high' | 'medium' | 'low';
  icon: string;
}

export interface RecommendedAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact?: string;
  timeframe?: string;
  icon: string;
}

export interface MetricAnalysisData {
  metricType: MetricType;
  metricName: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  breakdown: MetricBreakdown;
  chartData: ChartDataPoint[];
  trendData: TrendDataPoint[];
  insights: FinancialInsight[];
  recommendations: RecommendedAction[];
  lastUpdated: Date;
}

export interface AnalysisScreenProps {
  metric: MetricAnalysisData;
  onClose?: () => void;
}
