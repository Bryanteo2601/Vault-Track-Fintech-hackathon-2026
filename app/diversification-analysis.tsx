import React, { useMemo } from 'react';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { generateDiversificationAnalysis } from '@/lib/metric-insight-engine';
import { MetricDrillDown } from '@/components/metric-drill-down';

export default function DiversificationAnalysisScreen() {
  const colors = useAppColors();
  const { data } = useAppData();

  const analysis = useMemo(() => generateDiversificationAnalysis(data), [data]);

  return <MetricDrillDown metric={analysis} />;
}
