import React, { useMemo } from 'react';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { generateLiquidityAnalysis } from '@/lib/metric-insight-engine';
import { MetricDrillDown } from '@/components/metric-drill-down';

export default function LiquidityAnalysisScreen() {
  const colors = useAppColors();
  const { data } = useAppData();

  const analysis = useMemo(() => generateLiquidityAnalysis(data), [data]);

  return <MetricDrillDown metric={analysis} />;
}
