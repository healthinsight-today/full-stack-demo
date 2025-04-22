import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReports } from '../contexts/ReportsContext';
import { Report, ReportDetail } from '../types/Report';
import axiosInstance from '../services/api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
        const response = await axiosInstance.get(`/reports/${id}/details`);
        if (response.data.success) {
          setReport(response.data.data);
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch report details');
        console.error('Error fetching report details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!report) {
    return <ErrorMessage message="Report not found" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{report.filename}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium">{report.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Created At</p>
            <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Description</p>
            <p className="font-medium">{report.description}</p>
          </div>
        </div>
      </div>

      {report.report_info && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Medical Report Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Report Type</p>
              <p className="font-medium">{report.report_info.report_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Lab Name</p>
              <p className="font-medium">{report.report_info.lab_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Report Date</p>
              <p className="font-medium">{report.report_info.report_date}</p>
            </div>
          </div>
        </div>
      )}

      {report.patient_info && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{report.patient_info.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Patient ID</p>
              <p className="font-medium">{report.patient_info.patient_id}</p>
            </div>
            <div>
              <p className="text-gray-600">Age</p>
              <p className="font-medium">{report.patient_info.age}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-medium">{report.patient_info.gender}</p>
            </div>
            {report.patient_info.blood_group && (
              <div>
                <p className="text-gray-600">Blood Group</p>
                <p className="font-medium">{report.patient_info.blood_group}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {report.test_sections && report.test_sections.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {report.test_sections.map((section) => (
            <div key={section.section_id} className="mb-6 last:mb-0">
              <h3 className="text-lg font-medium mb-3">{section.section_name}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {section.parameters.map((parameter) => (
                      <tr key={parameter.name} className={parameter.is_abnormal ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parameter.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parameter.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parameter.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parameter.reference_range}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parameter.is_abnormal ? (
                            <span className="text-red-600 font-medium">
                              {parameter.direction === 'high' ? 'High' : parameter.direction === 'low' ? 'Low' : 'Abnormal'}
                            </span>
                          ) : (
                            <span className="text-green-600">Normal</span>
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
