import { FC } from 'react';
import { Insight } from '../../types/Insight';

export interface InsightsListProps {
  insights: Insight[];
  isLoading?: boolean;
  error?: string;
  onInsightClick?: (insight: Insight) => void;
}

declare const InsightsList: FC<InsightsListProps>;
export default InsightsList; 