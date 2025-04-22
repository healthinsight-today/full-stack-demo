import React from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../../types/Report';
import Card from '../common/Card';
import Button from '../common/Button';

interface ReportCardProps {
  report: Report;
  className?: string;
  onClick?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  className = '',
  onClick,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'processing':
        return 'bg-secondary text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'failed':
        return 'bg-error text-white';
      default:
        return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };

  // Count abnormal parameters
  const abnormalCount = report.abnormal_parameters.length;

  return (
    <Card 
      className={`h-full transition-all duration-200 hover:shadow-lg ${className}`}
      hoverable
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
              {report.report_info.report_type}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {formatDate(report.report_info.report_date)}
            </p>
          </div>
          <span 
            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(report.processing.status)}`}
          >
            {report.processing.status.charAt(0).toUpperCase() + report.processing.status.slice(1)}
          </span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">Lab:</span> {report.report_info.lab_name}
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">Patient:</span> {report.patient_info.name}
          </p>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2">
                Health Parameters:
              </span>
              <div className="flex items-center">
                <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-1">
                  {report.test_sections.reduce((total, section) => total + section.parameters.length, 0)}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">total</span>
              </div>
            </div>
            
            {abnormalCount > 0 && (
              <div className="mt-1 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-error mr-2"></span>
                <span className="text-sm text-error font-medium mr-1">{abnormalCount}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">abnormal</span>
              </div>
            )}
          </div>
          
          {report.insights.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {report.insights.length} Insights
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Link 
            to={`/reports/${report.id}`}
            className="text-primary hover:text-primary-dark text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
          
          <Link 
            to={`/insights/${report.id}`}
            className="text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              variant="outline" 
              size="sm"
            >
              View Insights
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
