import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils/formatters/dateFormatter';

const HistoryPage: React.FC = () => {
  const { reports, isLoading, error } = useReports();
  const navigate = useNavigate();
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [parameters, setParameters] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Extract unique parameters from all reports
  useEffect(() => {
    if (reports.length > 0) {
      const uniqueParams = new Set<string>();
      
      reports.forEach(report => {
        report.test_sections.forEach(section => {
          section.parameters.forEach(param => {
            uniqueParams.add(param.name);
          });
        });
      });
      
      const paramsList = Array.from(uniqueParams).sort();
      setParameters(paramsList);
      
      // Set default selected parameter
      if (paramsList.length > 0 && !selectedParameter) {
        setSelectedParameter(paramsList[0]);
      }
    }
  }, [reports, selectedParameter]);

  // Generate trend data for selected parameter
  useEffect(() => {
    if (!selectedParameter || reports.length === 0) {
      setTrendData([]);
      return;
    }
    
    // Sort reports by date (oldest first)
    const sortedReports = [...reports].sort((a, b) => {
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
            // Convert value to number
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
  }, [selectedParameter, reports]);

  return (
    <PageContainer
      title="Health History"
      description="Track your health parameters over time"
      isLoading={isLoading}
      error={error}
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
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">No History Available</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Upload blood test reports to start tracking your health parameters over time.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/upload')}
          >
            Upload Your First Report
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
                  Parameter History
                </h3>
                
                <div className="w-full md:w-64">
                  <select
                    value={selectedParameter}
                    onChange={(e) => setSelectedParameter(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    aria-label="Select parameter to view history"
                  >
                    {parameters.map(param => (
                      <option key={param} value={param}>{param}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {trendData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#93C5FD" 
                        activeDot={{ r: 8 }}
                      />
                      {trendData[0]?.referenceMin !== null && (
                        <Area 
                          type="monotone" 
                          dataKey="referenceMin" 
                          stroke="#10B981" 
                          fill="transparent" 
                          strokeDasharray="5 5"
                        />
                      )}
                      {trendData[0]?.referenceMax !== null && (
                        <Area 
                          type="monotone" 
                          dataKey="referenceMax" 
                          stroke="#EF4444" 
                          fill="transparent" 
                          strokeDasharray="5 5"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No data available for the selected parameter.
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
                Report History
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Report Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Lab
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Abnormal Parameters
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {reports.map((report) => (
                      <tr 
                        key={report.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-white">
                          {formatDate(report.report_info.report_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-white">
                          {report.report_info.report_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                          {report.report_info.lab_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                          {report.abnormal_parameters.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/reports/${report.id}`);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default HistoryPage;
