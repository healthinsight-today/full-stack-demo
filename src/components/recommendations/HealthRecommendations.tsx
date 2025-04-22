import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiService } from '../../services/apiService';

interface Recommendation {
  type: string;
  text: string;
  priority: string;
}

interface Insight {
  condition: string;
  confidence: number;
  parameters: string[];
  description: string;
  severity: string;
  recommendations: Recommendation[];
}

interface TestData {
  report_info: {
    report_id: string;
    report_date: string;
  };
  patient_info: {
    name: string;
  };
  insights: Insight[];
}

interface HealthRecommendationsProps {
  reportId: string;
}

export const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({ reportId }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching insights for report: ${reportId}`);
        
        // Get test data
        const testDataResponse = await apiService.get('/testdata');
        const testData: TestData = testDataResponse.data;
        setTestData(testData);
        
        console.log('Test data:', testData);
        
        if (testData.insights && testData.insights.length > 0) {
          setInsights(testData.insights);
          setSelectedInsightIndex(0);
        } else {
          console.log('No insights available');
          setInsights([]);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load health insights. Please try again later.');
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (reportId) {
      fetchInsights();
    } else {
      setIsLoading(false);
      setError('No report ID provided');
      setInsights([]);
    }
  }, [reportId]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical':
        return (
          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'dietary':
        return (
          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'lifestyle':
        return (
          <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'testing':
        return (
          <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Recommendations</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <Button onClick={() => location.reload()}>Try Again</Button>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Recommendations</h3>
        <p className="text-gray-600 dark:text-gray-300">
          There are no health recommendations available for this report yet.
        </p>
      </Card>
    );
  }

  const selectedInsight = insights[selectedInsightIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Health Conditions List */}
      <div className="lg:col-span-1">
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Conditions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Based on your test results from {testData?.report_info.report_date}
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {insights.map((insight, index) => (
              <button
                key={index}
                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedInsightIndex === index ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
                onClick={() => setSelectedInsightIndex(index)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-3 h-3 rounded-full ${selectedInsightIndex === index ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{insight.condition}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {insight.description.substring(0, 100)}...
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                        {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Note:</span> These recommendations are based on your test results and should be discussed with your healthcare provider.
            </p>
          </div>
        </Card>
      </div>

      {/* Right Column - Selected Insight Details */}
      <div className="lg:col-span-2">
        <Card>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedInsight.condition}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedInsight.severity)}`}>
                    {selectedInsight.severity.charAt(0).toUpperCase() + selectedInsight.severity.slice(1)} Severity
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {(selectedInsight.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Button variant="primary">Print Information</Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedInsight.description}</p>
              </div>

              {/* Related Parameters */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Related Test Parameters</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.parameters.map((param, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded">
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
                <ul className="space-y-3">
                  {selectedInsight.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      {getRecommendationIcon(rec.type)}
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="mr-2 text-gray-700 dark:text-gray-300">{rec.text}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} priority
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{rec.type} recommendation</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                <strong>Important:</strong> These recommendations do not constitute medical advice. Always consult with your healthcare provider before making any changes to your health regimen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Information
                </Button>
                <Button variant="outline">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Information
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 