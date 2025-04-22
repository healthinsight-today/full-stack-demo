import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import PageContainer from '../components/layout/PageContainer';
import InsightsList from '../components/insights/InsightsList';
import InsightTrends from '../components/insights/InsightTrends';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import { useNavigate } from 'react-router-dom';
import { Insight } from '../types/Insight';

const InsightsPage: React.FC = () => {
  const { reports, isLoading, error } = useReports();
  const [insights, setInsights] = useState<Insight[]>([]);
  const navigate = useNavigate();
  
  // Extract all insights from reports
  useEffect(() => {
    if (reports && reports.length > 0) {
      const allInsights: Insight[] = [];
      reports.forEach(report => {
        if (report.insights && report.insights.length > 0) {
          // Convert report insights to Insight type
          allInsights.push(...report.insights.map(insight => ({
            ...insight,
            id: insight.id,
            report_id: insight.report_id || '',
            severity: insight.severity as any,
          })));
        }
      });
      setInsights(allInsights);
    }
  }, [reports]);

  // Handle insight click
  const handleInsightClick = (insight: Insight) => {
    navigate(`/insights/${insight.id}`);
  };

  // Create tabs for the insights view
  const insightsTabs = [
    {
      id: 'all',
      label: 'All Insights',
      content: (
        <div className="py-4">
          <InsightsList 
            insights={insights}
            isLoading={isLoading}
            error={error || ''}
            onInsightClick={handleInsightClick}
          />
        </div>
      ),
    },
    {
      id: 'trends',
      label: 'Parameter Trends',
      content: (
        <div className="py-4">
          <InsightTrends 
            insights={insights}
            reports={reports}
            className="py-4"
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Health Insights"
      description="Discover insights from your blood test reports"
      isLoading={isLoading}
      error={error || ''}
      actions={
        <Button
          variant="primary"
          onClick={() => navigate('/upload')}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          }
        >
          Upload New Report
        </Button>
      }
    >
      {insights.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">No Insights Available</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Upload a blood test report to get personalized health insights.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/upload')}
          >
            Upload Report
          </Button>
        </div>
      ) : (
        <Card>
          <Tabs tabs={insightsTabs} />
        </Card>
      )}
    </PageContainer>
  );
};

export default InsightsPage; 