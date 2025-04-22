// This file contains global type declarations

declare module '@components/insights/InsightsList' {
  import { FC } from 'react';
  import { Insight } from '../Insight';
  
  interface InsightsListProps {
    insights: Insight[];
    isLoading?: boolean;
    error?: string;
    onInsightClick?: (insight: Insight) => void;
  }
  
  const InsightsList: FC<InsightsListProps>;
  export default InsightsList;
}

// Allow importing JSON files
declare module '*.json' {
  const value: any;
  export default value;
} 