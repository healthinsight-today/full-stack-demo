import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import { mockInsights } from '../services/api/mockData';

// Type definition that matches the actual mock data structure
type SampleInsight = {
  id: string;
  report_id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  related_parameters: string[];
  detailed_analysis?: string;
};

const InsightDetail: React.FC = () => {
  const { insightId } = useParams<{ insightId: string }>();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<SampleInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Load insight details
    setIsLoading(true);
    
    // Get the insight from mock data
    const getInsight = () => {
      // Access mockInsights directly as it's an array of Insight objects
      for (const insight of mockInsights) {
        if (insight.id === insightId) {
          return insight as unknown as SampleInsight;
        }
      }
      return null;
    };
    
    const foundInsight = getInsight();
    setInsight(foundInsight);
    setIsLoading(false);
  }, [insightId]);

  // Handle back to insights
  const handleBackToInsights = () => {
    navigate('/insights');
  };

  // Handle view report
  const handleViewReport = () => {
    if (insight && insight.report_id) {
      navigate(`/reports/${insight.report_id}`);
    }
  };

  return (
    <PageContainer
      title={insight ? insight.title : 'Insight Details'}
      description={insight ? `${insight.category} • ${insight.severity} Severity` : 'Loading insight details...'}
      isLoading={isLoading}
      error={''}
      actions={
        <Button
          variant="outline"
          onClick={handleBackToInsights}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          }
        >
          Back to Insights
        </Button>
      }
    >
      {insight ? (
        <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mr-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">{insight.title}</h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{insight.category}</span>
                <span className="mx-2">•</span>
                <span className="text-sm bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                  {insight.severity} Severity
                </span>
              </div>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            <h3>Description</h3>
            <p>{insight.description}</p>
            
            {insight.detailed_analysis && (
              <>
                <h3>Detailed Analysis</h3>
                <p>{insight.detailed_analysis}</p>
              </>
            )}
            
            {insight.related_parameters && insight.related_parameters.length > 0 && (
              <>
                <h3>Related Parameters</h3>
                <ul>
                  {insight.related_parameters.map((param, i) => (
                    <li key={i}>{param}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button variant="primary" onClick={handleViewReport}>
              View Source Report
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">Insight Not Found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The insight you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="primary"
            onClick={handleBackToInsights}
          >
            Go to Insights
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default InsightDetail;
