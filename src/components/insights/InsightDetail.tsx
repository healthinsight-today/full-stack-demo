import React, { useState } from 'react';
import { Report } from '../../types/Report';
import { Insight } from '../../types/Insight';
import { Recommendation } from '../../types/Recommendation';
import Card from '../common/Card';
import Button from '../common/Button';
import Tabs from '../common/Tabs';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/formatters/dateFormatter';

interface InsightDetailProps {
  insight: Insight;
  report?: Report;
  relatedInsights?: Insight[];
  recommendations?: Recommendation[];
  className?: string;
  onViewReport?: () => void;
  onViewRelatedInsight?: (insightId: string) => void;
  onBack?: () => void;
}

const InsightDetail: React.FC<InsightDetailProps> = ({
  insight,
  report,
  relatedInsights = [],
  recommendations = [],
  className = '',
  onViewReport,
  onViewRelatedInsight,
  onBack,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'medium':
      case 'warning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'low':
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string = '') => {
    switch (category.toLowerCase()) {
      case 'cardiovascular':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        );
      case 'metabolic':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  // Open recommendation modal
  const openRecommendationModal = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  // Close recommendation modal
  const closeRecommendationModal = () => {
    setIsModalOpen(false);
    setSelectedRecommendation(null);
  };

  return (
    <>
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className={`p-3 rounded-full ${getSeverityColor(insight.severity)} mr-4`}>
              {getCategoryIcon(insight.category)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {insight.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {insight.category && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.category}
                  </span>
                )}
                <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${getSeverityColor(insight.severity)}`}>
                  {insight.severity} Severity
                </span>
                {report && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    From: {report.report_info.report_type} ({formatDate(report.report_info.report_date)})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {insight.description}
            </p>
          </div>
          
          {/* Render details if it's a string */}
          {typeof insight.details === 'string' && insight.details && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Details
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {insight.details}
              </p>
            </div>
          )}
          
          {/* Render details if it's an array */}
          {Array.isArray(insight.details) && insight.details.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Details
              </h3>
              <div className="space-y-3">
                {insight.details.map((detail, index) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-4">
                    {detail.title && <h4 className="font-medium text-gray-800 dark:text-white mb-1">{detail.title}</h4>}
                    <p className="text-gray-700 dark:text-gray-300">{detail.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Render recommendations */}
          {insight.recommendations && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Recommendations
              </h3>
              <div className="space-y-2">
                {typeof insight.recommendations === 'string' ? (
                  <p className="text-gray-700 dark:text-gray-300">{insight.recommendations}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {/* Render related parameters */}
          {insight.related_parameters && insight.related_parameters.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Related Parameters
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insight.related_parameters.map((param, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-800 dark:text-white">
                        {typeof param === 'string' ? param : param.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Recommendations from context */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((recommendation) => (
                  <div 
                    key={recommendation.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => openRecommendationModal(recommendation)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {recommendation.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {recommendation.short_description || recommendation.description?.substring(0, 100)}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* View report button */}
          {report && onViewReport && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={onViewReport}
              >
                View Source Report
              </Button>
            </div>
          )}
          
          {/* Back button */}
          {onBack && (
            <div className="mt-4">
              <Button
                variant="text"
                onClick={onBack}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Recommendation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeRecommendationModal}
        title={selectedRecommendation?.title || 'Recommendation'}
        size="lg"
      >
        {selectedRecommendation && (
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedRecommendation.description}
            </p>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={closeRecommendationModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InsightDetail;
