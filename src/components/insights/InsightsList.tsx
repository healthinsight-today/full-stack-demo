import React from 'react';
import { Insight } from '../../types/Insight';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

interface InsightsListProps {
  insights: Insight[];
  isLoading?: boolean;
  error?: string;
  onInsightClick?: (insight: Insight) => void;
}

const InsightsList: React.FC<InsightsListProps> = ({ 
  insights = [], 
  isLoading = false,
  error,
  onInsightClick
}) => {
  // Get color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'text-red-600';
      case 'medium':
      case 'warning':
        return 'text-orange-500';
      case 'low':
        return 'text-blue-500';
      case 'info':
        return 'text-blue-500';
      case 'positive':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (insights.length === 0) {
    return <div className="p-4 text-center">No insights available.</div>;
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card 
          key={insight.id}
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onInsightClick && onInsightClick(insight)}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="mr-3 p-2 rounded-full bg-blue-100">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{insight.title}</h3>
                <div className="flex items-center mb-2">
                  {insight.category && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{insight.category}</span>
                  )}
                  <span className="mx-2">•</span>
                  <span className={`text-sm ${getSeverityColor(insight.severity)} font-medium`}>
                    {insight.severity} Severity
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{insight.description}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InsightsList; 