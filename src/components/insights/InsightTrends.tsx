import React, { useState, useEffect } from 'react';
import { Report } from '../../types/Report';
import { Insight } from '../../types/Insight';
import Card from '../common/Card';
import Tabs from '../common/Tabs';
import Dropdown from '../common/Dropdown';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../../utils/formatters/dateFormatter';
import { Select } from '../common/Select';

interface InsightTrendsProps {
  insights: Insight[];
  reports: Report[];
  className?: string;
}

const InsightTrends: React.FC<InsightTrendsProps> = ({
  insights,
  reports,
  className = '',
}) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('6m');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get unique parameters from all reports
  const getUniqueParameters = () => {
    const parameters = new Set<string>();
    reports.forEach(report => {
      if (report.test_sections) {
        report.test_sections.forEach(section => {
          section.parameters.forEach(param => {
            parameters.add(param.name);
          });
        });
      }
    });
    return Array.from(parameters);
  };

  // Time range options
  const timeRangeOptions = [
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'Last Year', value: '1year' },
    { label: 'All Time', value: 'all' },
  ];

  // Filter reports by time range
  const filterReportsByTimeRange = (timeRange: string): Report[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '3months':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6months':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return [...reports];
    }
    
    return reports.filter(report => {
      const reportDate = new Date(report.report_info.report_date);
      return reportDate >= cutoffDate;
    });
  };

  // Generate trend data for selected parameter
  useEffect(() => {
    if (!selectedParameter || reports.length === 0) {
      setTrendData([]);
      return;
    }
    
    const filteredReports = filterReportsByTimeRange(selectedTimeRange);
    
    // Sort reports by date (oldest first)
    const sortedReports = [...filteredReports].sort((a, b) => {
      return new Date(a.report_info.report_date).getTime() - new Date(b.report_info.report_date).getTime();
    });
    
    // Extract parameter values from each report
    const data = sortedReports.map(report => {
      let paramValue: number | null = null;
      let referenceMin: number | null = null;
      let referenceMax: number | null = null;
      
      // Find the parameter in the report
      report.test_sections.forEach(section => {
        section.parameters.forEach(param => {
          if (param.name === selectedParameter) {
            // Convert value to number if it's a string
            paramValue = typeof param.value === 'string' ? parseFloat(param.value) : param.value;
            
            // Extract reference range min and max
            if (param.reference_range) {
              const rangeMatch = param.reference_range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
              if (rangeMatch) {
                referenceMin = parseFloat(rangeMatch[1]);
                referenceMax = parseFloat(rangeMatch[2]);
              }
            }
          }
        });
      });
      
      return {
        date: formatDate(report.report_info.report_date),
        value: paramValue,
        referenceMin,
        referenceMax,
        isAbnormal: report.abnormal_parameters.some(param => param.name === selectedParameter),
      };
    }).filter(item => item.value !== null);
    
    setTrendData(data);
  }, [selectedParameter, selectedTimeRange, reports]);

  // Get insights related to selected parameter
  const getRelatedInsights = (): Insight[] => {
    if (!selectedParameter) return [];
    
    return insights.filter(insight => 
      insight.related_parameters && 
      insight.related_parameters.some(param => 
        typeof param === 'string' ? param === selectedParameter : selectedParameter
      )
    );
  };

  // Calculate statistics for selected parameter
  const calculateStats = () => {
    if (trendData.length === 0) return null;
    
    const values = trendData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];
    
    // Calculate trend (percentage change from first to last)
    const first = values[0];
    const percentChange = ((latest - first) / first) * 100;
    
    return {
      min,
      max,
      avg: avg.toFixed(2),
      latest,
      trend: percentChange.toFixed(2),
      improving: percentChange < 0, // Assuming lower is better, adjust based on parameter
    };
  };

  const stats = calculateStats();
  const relatedInsights = getRelatedInsights();
  const uniqueParameters = getUniqueParameters();

  return (
    <div className={className}>
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">
              Health Parameter Trends
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Dropdown
                items={uniqueParameters.map(param => ({
                  label: param,
                  value: param,
                }))}
                value={selectedParameter}
                onChange={setSelectedParameter}
                placeholder="Select Parameter"
                className="w-full sm:w-64"
              />
              
              <Dropdown
                items={timeRangeOptions}
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                className="w-full sm:w-48"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading trend data..." />
            </div>
          ) : error ? (
            <ErrorMessage
              message={error}
              title="Error loading trend data"
            />
          ) : !selectedParameter ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                Select a Parameter to View Trends
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Choose a health parameter from the dropdown to see how it has changed over time.
              </p>
            </div>
          ) : trendData.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                No Trend Data Available
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                There is no data available for {selectedParameter} in the selected time range.
              </p>
            </div>
          ) : (
            <div>
              {/* Stats summary */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Latest Value</p>
                    <p className="text-xl font-semibold text-neutral-800 dark:text-white">{stats.latest}</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Average</p>
                    <p className="text-xl font-semibold text-neutral-800 dark:text-white">{stats.avg}</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Range</p>
                    <p className="text-xl font-semibold text-neutral-800 dark:text-white">{stats.min} - {stats.max}</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Trend</p>
                    <div className="flex items-center">
                      <p className={`text-xl font-semibold ${parseFloat(stats.trend) > 0 ? 'text-error' : 'text-success'}`}>
                        {stats.trend}%
                      </p>
                      {parseFloat(stats.trend) !== 0 && (
                        <svg 
                          className={`w-5 h-5 ml-1 ${parseFloat(stats.trend) > 0 ? 'text-error' : 'text-success'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d={parseFloat(stats.trend) > 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                          ></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
                  {selectedParameter} Over Time
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name={selectedParameter}
                        stroke="#3B82F6" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      {trendData[0]?.referenceMin !== null && (
                        <Line 
                          type="monotone" 
                          dataKey="referenceMin" 
                          name="Min Reference" 
                          stroke="#10B981" 
                          strokeDasharray="5 5"
                          strokeWidth={1}
                        />
                      )}
                      {trendData[0]?.referenceMax !== null && (
                        <Line 
                          type="monotone" 
                          dataKey="referenceMax" 
                          name="Max Reference" 
                          stroke="#EF4444" 
                          strokeDasharray="5 5"
                          strokeWidth={1}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Related insights */}
              {relatedInsights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
                    Related Insights
                  </h3>
                  <div className="space-y-3">
                    {relatedInsights.map(insight => (
                      <div key={insight.id} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                        <h4 className="font-medium text-neutral-800 dark:text-white">{insight.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InsightTrends;
