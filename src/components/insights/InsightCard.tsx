import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters/dateFormatter';

// Define a new interface instead of extending Insight
interface InsightCardProps {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  created_at: string;
  related_parameters?: Array<string | { name: string }>;
  onClick?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = (props) => {
  const { 
    id, 
    title, 
    description, 
    severity, 
    category = '',
    related_parameters = [],
    onClick 
  } = props;

  // Determine background color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'severe':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
      case 'moderate':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'mild':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'positive':
      case 'low':
      case 'minimal':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700';
    }
  };

  // Determine badge color based on severity
  const getSeverityBadgeColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'positive':
      case 'low':
      case 'minimal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Format severity text
  const formatSeverity = (severity: string): string => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lipid':
      case 'cholesterol':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        );
      case 'metabolic':
      case 'glucose':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
      case 'hematology':
      case 'blood':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  return (
    <Card onClick={onClick} className={`cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(severity)}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getSeverityBadgeColor(severity)}`}>
              {formatSeverity(severity)}
            </span>
            {category && (
              <div className="flex items-center text-neutral-600 dark:text-neutral-400 text-sm">
                <div className="mr-1">{getCategoryIcon(category)}</div>
                {category}
              </div>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 text-neutral-800 dark:text-white">
          {title}
        </h3>
        
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
          {description}
        </p>
        
        {related_parameters && related_parameters.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Related Parameters:</p>
            <div className="flex flex-wrap gap-1">
              {related_parameters.map((param: string | { name: string }, index: number) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {typeof param === 'string' ? param : param.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InsightCard;
