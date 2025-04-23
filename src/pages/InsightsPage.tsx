import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { Insight } from '../types/Insight';
import { Tab } from '@headlessui/react';
import { ChartBarIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Extended interface for our UI needs
interface ExtendedInsight extends Insight {
  status?: 'warning' | 'good' | 'info';
  date?: string;
  summary?: string;
}

const InsightsPage: React.FC = () => {
  const { reports, isLoading, error } = useReports();
  const [insights, setInsights] = useState<ExtendedInsight[]>([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeTimeFilter, setActiveTimeFilter] = useState('30days');
  
  // Extract all insights from reports
  useEffect(() => {
    if (reports && reports.length > 0) {
      const allInsights: ExtendedInsight[] = [];
      reports.forEach(report => {
        if (report.insights && report.insights.length > 0) {
          // Convert report insights to ExtendedInsight type with UI-specific properties
          allInsights.push(...report.insights.map(insight => ({
            ...insight,
            id: insight.id,
            report_id: insight.report_id || '',
            severity: insight.severity as any,
            // Add UI-specific properties
            status: mapSeverityToStatus(insight.severity),
            date: report.report_info?.report_date || report.created_at || new Date().toISOString(),
            summary: insight.description
          })));
        }
      });
      setInsights(allInsights);
    }
  }, [reports]);

  // Map severity to status for UI display
  const mapSeverityToStatus = (severity: string): 'warning' | 'good' | 'info' => {
    switch (severity) {
      case 'critical':
      case 'high':
      case 'severe':
        return 'warning';
      case 'low':
      case 'mild':
        return 'good';
      default:
        return 'info';
    }
  };

  // Handle insight click
  const handleInsightClick = (insight: Insight) => {
    navigate(`/insights/${insight.id}`);
  };

  const renderInsightCard = (insight: ExtendedInsight) => {
    let statusColor;
    
    switch (insight.status) {
      case 'warning':
        statusColor = 'border-l-yellow-500';
        break;
      case 'good':
        statusColor = 'border-l-green-500';
        break;
      case 'info':
        statusColor = 'border-l-blue-500';
        break;
      default:
        statusColor = 'border-l-gray-500';
    }

    return (
      <Card key={insight.id} className={`mb-6 border-l-4 ${statusColor}`}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm text-brand-purple font-medium mb-1">{insight.category}</div>
              <h3 className="text-xl font-semibold">{insight.title}</h3>
            </div>
            <div className="text-sm text-gray-500">
              {insight.date ? new Date(insight.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : ''}
            </div>
          </div>
          <p className="text-neutral-600">{insight.summary || insight.description}</p>
          <div className="flex justify-end mt-4">
            <button 
              className="text-brand-purple hover:text-brand-purple-dark font-medium"
              onClick={() => handleInsightClick(insight)}
            >
              View Details
            </button>
          </div>
        </div>
      </Card>
    );
  };

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
        <div>
          <h1 className="text-2xl font-bold mb-4">Health Insights</h1>
          <p className="text-neutral-600 mb-8">
            Personalized health recommendations based on your reports
          </p>

          {/* Time filter buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { id: '30days', label: 'Last 30 Days' },
              { id: '3months', label: 'Last 3 Months' },
              { id: '6months', label: 'Last 6 Months' },
              { id: 'year', label: 'Last Year' },
              { id: 'alltime', label: 'All Time' }
            ].map(filter => (
              <button
                key={filter.id}
                className={`py-2 px-4 rounded-full text-sm ${
                  activeTimeFilter === filter.id
                    ? 'bg-brand-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTimeFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="mb-8">
            <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
              <Tab.List className="flex space-x-1 border-b border-neutral-200">
                {['Overview', 'Cholesterol', 'Vitamin D', 'Iron', 'Blood Sugar', 'Blood Pressure'].map((category, idx) => (
                  <Tab
                    key={idx}
                    className={({ selected }: { selected: boolean }) =>
                      `py-3 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                        selected
                          ? 'text-brand-purple border-brand-purple'
                          : 'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300'
                      }`
                    }
                  >
                    {category}
                  </Tab>
                ))}
              </Tab.List>
              
              <Tab.Panels className="mt-6">
                <Tab.Panel>
                  <div className="flex items-center justify-center py-16 bg-gray-50 rounded-lg mb-8">
                    <div className="text-center">
                      <div className="inline-block p-4 bg-purple-100 rounded-lg mb-4">
                        <ChartBarIcon className="h-10 w-10 text-brand-purple" />
                      </div>
                      <p className="text-lg text-gray-600">Health trend visualization will be displayed here</p>
                    </div>
                  </div>
                  
                  {insights.map(insight => renderInsightCard(insight))}
                </Tab.Panel>
                
                {/* Other tab panels would follow similar structure */}
                {[1, 2, 3, 4, 5].map(idx => (
                  <Tab.Panel key={idx}>
                    {insights
                      .filter(insight => {
                        const categories = ['Cholesterol', 'Vitamin D', 'Iron', 'Blood Sugar', 'Blood Pressure'];
                        return insight.category === categories[idx - 1];
                      })
                      .map(insight => renderInsightCard(insight))}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default InsightsPage; 