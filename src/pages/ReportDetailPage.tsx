import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportsContext';
import { ReportDetail, getReportById as getReportByIdService } from '../services/api/reportsService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReportById } = useReports();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        // Try to get from context first
        const cachedReport = getReportById(id);
        
        if (cachedReport) {
          // If we have a detailed report in context, use it
          setReport(cachedReport as ReportDetail);
        } else {
          // Otherwise fetch from API
          const fetchedReport = await getReportByIdService(id);
          setReport(fetchedReport);
        }
      } catch (err) {
        setError('Failed to fetch report details');
        console.error('Error fetching report details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id, getReportById]);

  const handleBack = () => {
    navigate('/reports');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
        <Button onClick={handleBack} variant="secondary" className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium">Report Not Found</h3>
        <p>The requested report could not be found.</p>
        <Button onClick={handleBack} variant="secondary" className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Report Details</h1>
        <Button onClick={handleBack} variant="secondary">
          Back to Reports
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-medium">{report.status}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Created At</p>
            <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          {report.description && (
            <div className="col-span-2">
              <p className="text-gray-600 dark:text-gray-400">Description</p>
              <p className="font-medium">{report.description}</p>
            </div>
          )}
        </div>
      </div>

      {report.report_info && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Medical Report Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Report Type</p>
              <p className="font-medium">{report.report_info.report_type}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Lab Name</p>
              <p className="font-medium">{report.report_info.lab_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Report Date</p>
              <p className="font-medium">{new Date(report.report_info.report_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {report.patient_info && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-medium">{report.patient_info.name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Patient ID</p>
              <p className="font-medium">{report.patient_info.patient_id}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Age</p>
              <p className="font-medium">{report.patient_info.age}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Gender</p>
              <p className="font-medium">{report.patient_info.gender}</p>
            </div>
            {report.patient_info.blood_group && (
              <div>
                <p className="text-gray-600 dark:text-gray-400">Blood Group</p>
                <p className="font-medium">{report.patient_info.blood_group}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {report.insights && report.insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Insights</h2>
          <div className="space-y-4">
            {report.insights.map((insight) => (
              <div key={insight.id} className={`p-4 border-l-4 rounded ${
                insight.severity === 'severe' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                insight.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-green-500 bg-green-50 dark:bg-green-900/10'
              }`}>
                <h3 className="text-lg font-medium mb-2">{insight.title}</h3>
                <p className="mb-2">{insight.description}</p>
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mt-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {report.test_sections && report.test_sections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {report.test_sections.map((section) => (
            <div key={section.section_id} className="mb-6 last:mb-0">
              <h3 className="text-lg font-medium mb-3">{section.section_name}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parameter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {section.parameters.map((parameter) => (
                      <tr key={parameter.name} className={parameter.is_abnormal ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{parameter.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{parameter.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{parameter.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{parameter.reference_range}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {parameter.is_abnormal ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {parameter.direction === 'high' ? 'High' : parameter.direction === 'low' ? 'Low' : 'Abnormal'}
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
