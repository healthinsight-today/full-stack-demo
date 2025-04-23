import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../services/api/reportsService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Tabs from '../common/Tabs';
import { formatDate } from '../../utils/formatters/dateFormatter';
import TestInfoTooltip from '../common/TestInfoTooltip';
import ParameterInfoTooltip from '../common/ParameterInfoTooltip';
import { safeArrayLength, safeObjectAccess, hasItems } from '../../utils/typeUtils';

interface ReportPreviewProps {
  report: Report;
  className?: string;
  onViewDetails?: () => void;
  onViewInsights?: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  report,
  className = '',
  onViewDetails,
  onViewInsights,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Format date using utility function
  const formattedDate = formatDate(report.report_info.report_date);

  // Count parameters by status safely
  const totalParameters = safeObjectAccess(
    report,
    'test_sections',
    (sections) => sections.reduce((sum, section) => sum + section.parameters.length, 0),
    0
  );
  
  const abnormalCount = safeArrayLength(report.abnormal_parameters);
  const normalCount = totalParameters - abnormalCount;

  // Get processing status safely
  const processingStatus = safeObjectAccess(
    report.processing,
    'status',
    (status) => status,
    'pending'
  );

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

  // Get abnormality color
  const getAbnormalityColor = (direction: 'high' | 'low' | null, severity: 'mild' | 'moderate' | 'severe' | null) => {
    if (!direction) return 'text-gray-800 dark:text-gray-200';
    
    if (direction === 'high') {
      switch (severity) {
        case 'severe':
          return 'text-red-700 dark:text-red-400';
        case 'moderate':
          return 'text-orange-600 dark:text-orange-400';
        case 'mild':
          return 'text-amber-600 dark:text-amber-400';
        default:
          return 'text-red-600 dark:text-red-400';
      }
    } else {
      switch (severity) {
        case 'severe':
          return 'text-blue-700 dark:text-blue-400';
        case 'moderate':
          return 'text-indigo-600 dark:text-indigo-400';
        case 'mild':
          return 'text-sky-600 dark:text-sky-400';
        default:
          return 'text-blue-600 dark:text-blue-400';
      }
    }
  };

  // Get abnormality icon
  const getAbnormalityIcon = (direction: 'high' | 'low' | null) => {
    if (!direction) return null;
    
    return direction === 'high' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    );
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle view details button click
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/reports/${report.id}`);
    }
  };

  // Handle view insights button click
  const handleViewInsights = () => {
    if (onViewInsights) {
      onViewInsights();
    } else {
      navigate(`/insights/${report.id}`);
    }
  };

  return (
    <>
      <Card className={`${className}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">
                {report.report_info.report_type}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {formattedDate} • {report.report_info.lab_name}
              </p>
            </div>
            <span 
              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(processingStatus)}`}
            >
              {processingStatus.charAt(0).toUpperCase() + processingStatus.slice(1)}
            </span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Patient Information
              </span>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Name</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-white">{report.patient_info.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">ID</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-white">{report.patient_info.patient_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Age</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-white">{report.patient_info.age}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Gender</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-white">{report.patient_info.gender}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Health Parameters Summary
              </span>
              <button 
                className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:text-primary-300 px-2 py-1 rounded-md transition-colors"
                onClick={openModal}
              >
                View All
              </button>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Normal</span>
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-white">{normalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Abnormal</span>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">{abnormalCount}</span>
              </div>
            </div>
          </div>
          
          {abnormalCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Top Abnormal Parameters
                </span>
              </div>
              <div className="space-y-2">
                {report.abnormal_parameters.slice(0, 3).map((param) => (
                  <div 
                    key={param.name} 
                    className={`${param.direction === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-600' : 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-600'} rounded-md p-3 flex items-center justify-between`}
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-white">{param.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{param.section}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getAbnormalityColor(param.direction ?? null, param.severity ?? null)}`}>
                        {param.value} {param.unit}
                      </span>
                      <span className={`ml-1 ${param.direction === 'high' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                        {getAbnormalityIcon(param.direction ?? null)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleViewDetails}
              fullWidth
            >
              View Details
            </Button>
            <Button
              variant="primary"
              onClick={handleViewInsights}
              fullWidth
            >
              View Insights
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Modal for viewing all parameters */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Report Parameters"
        size="lg"
      >
        <Tabs
          tabs={report.test_sections.map(section => ({
            id: section.section_id,
            label: (
              <TestInfoTooltip sectionName={section.section_name}>
                {section.section_name}
              </TestInfoTooltip>
            ),
            content: (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 border-collapse">
                  <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-1/3">
                        Parameter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-1/6">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-1/4">
                        Reference Range
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-1/6">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {section.parameters.map((param) => (
                      <tr 
                        key={param.name} 
                        className={param.is_abnormal 
                          ? param.direction === 'high' 
                            ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-600' 
                            : 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-600'
                          : ''
                        }
                      >
                        <td className="px-4 py-3 text-sm font-medium text-neutral-800 dark:text-white">
                          <ParameterInfoTooltip parameter={param}>
                            {param.name}
                          </ParameterInfoTooltip>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <span className={param.is_abnormal ? getAbnormalityColor(param.direction ?? null, param.severity ?? null) : 'text-neutral-800 dark:text-white'}>
                            {param.value} {param.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                          {param.reference_range}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {param.is_abnormal ? (
                            <div className="flex items-center">
                              <span className={`font-medium ${getAbnormalityColor(param.direction ?? null, param.severity ?? null)}`}>
                                {param.direction === 'high' ? 'High' : 'Low'}
                              </span>
                              <span className={`ml-1 ${param.direction === 'high' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                {getAbnormalityIcon(param.direction ?? null)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-medium">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          }))}
          variant="custom"
          tabsContainerClassName="flex flex-wrap gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600"
          tabClassName="px-4 py-2 text-sm font-medium rounded-t-lg text-neutral-600 dark:text-neutral-400 border-t border-l border-r border-transparent hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
          activeTabClassName="bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 border-t border-l border-r border-neutral-200 dark:border-neutral-700"
          contentClassName="py-4"
        />
        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={() => {
              closeModal();
              handleViewDetails();
            }}
          >
            View Full Report Details
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ReportPreview;
