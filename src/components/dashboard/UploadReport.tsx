import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useReports } from '../../context/ReportsContext';
import { Report, AbnormalParameter } from '../../types/Report';

const UploadReport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();
  const { addReport } = useReports();
  const navigate = useNavigate();
  
  const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (selectedFile: File) => {
    if (!allowedFileTypes.includes(selectedFile.type)) {
      addToast('Invalid file type. Please upload a PDF, JPEG, or PNG file.', 'error');
      return;
    }
    
    if (selectedFile.size > maxFileSize) {
      addToast('File is too large. Maximum file size is 10MB.', 'error');
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleUpload = async () => {
    if (!file) {
      addToast('Please select a file to upload', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a random report ID
      const reportId = `report-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Sample abnormal parameters
      const cholesterol: AbnormalParameter = {
        name: 'Cholesterol',
        code: 'CHOL',
        value: 240,
        unit: 'mg/dL',
        reference_range: '0 - 200 mg/dL',
        reference_min: 0,
        reference_max: 200,
        is_abnormal: true,
        direction: 'high',
        severity: 'moderate',
        category: 'Lipids',
        section: 'Lipid Panel',
        percent_deviation: 20,
        potential_causes: ['Diet high in saturated fats', 'Genetic factors']
      };
      
      const glucose: AbnormalParameter = {
        name: 'Glucose',
        code: 'GLUC',
        value: 118,
        unit: 'mg/dL',
        reference_range: '70 - 100 mg/dL',
        reference_min: 70,
        reference_max: 100,
        is_abnormal: true,
        direction: 'high',
        severity: 'mild',
        category: 'Metabolic',
        section: 'Basic Metabolic Panel',
        percent_deviation: 20,
        potential_causes: ['Insulin resistance', 'Prediabetes']
      };
      
      // Create a report that matches the Report interface
      const newReport: Report = {
        id: reportId,
        user_id: 'user-123',
        filename: file.name,
        description: file.name,
        status: 'completed',
        report_info: {
          report_id: reportId,
          report_type: 'Blood Test',
          report_date: timestamp,
          lab_name: 'Quest Diagnostics',
          processing_timestamp: timestamp
        },
        patient_info: {
          name: 'John Doe',
          patient_id: 'P12345',
          age: 35,
          gender: 'Male',
          height: 180,
          weight: 80,
          blood_group: 'O+'
        },
        test_sections: [
          {
            section_id: 'lipid-panel',
            section_name: 'Lipid Panel',
            parameters: [
              cholesterol,
              {
                name: 'HDL',
                code: 'HDL',
                value: 40,
                unit: 'mg/dL',
                reference_range: '> 40 mg/dL',
                reference_min: 40,
                reference_max: null,
                is_abnormal: false,
                direction: null,
                severity: null,
                category: 'Lipids'
              }
            ]
          },
          {
            section_id: 'metabolic-panel',
            section_name: 'Basic Metabolic Panel',
            parameters: [
              glucose,
              {
                name: 'Creatinine',
                code: 'CRE',
                value: 0.9,
                unit: 'mg/dL',
                reference_range: '0.6 - 1.2 mg/dL',
                reference_min: 0.6,
                reference_max: 1.2,
                is_abnormal: false,
                direction: null,
                severity: null,
                category: 'Metabolic'
              }
            ]
          }
        ],
        abnormal_parameters: [cholesterol, glucose],
        insights: [
          {
            id: `insight-${Date.now()}-1`,
            report_id: reportId,
            title: 'Elevated Cholesterol',
            description: 'Your cholesterol level is above the recommended range, which may increase your risk of heart disease.',
            severity: 'moderate',
            category: 'Cardiovascular',
            related_parameters: ['Cholesterol'],
            details: 'Elevated cholesterol can lead to plaque buildup in your arteries, increasing your risk of heart attack and stroke.',
            recommendations: ['Consider a diet lower in saturated fats', 'Increase physical activity', 'Consult with a healthcare provider'],
            possible_causes: ['Diet high in saturated fats', 'Genetic factors', 'Sedentary lifestyle'],
            action_required: true,
            created_at: timestamp,
            updated_at: timestamp
          }
        ],
        recommendations: [
          {
            id: `rec-${Date.now()}-1`,
            report_id: reportId,
            title: 'Reduce Saturated Fat Intake',
            description: 'Lower your intake of saturated fats to help reduce cholesterol levels.',
            short_description: 'Lower your intake of saturated fats.',
            category: 'diet',
            priority: 'high',
            related_parameters: ['Cholesterol'],
            steps: ['Limit red meat to once per week', 'Choose low-fat dairy products', 'Avoid fried foods and processed snacks'],
            benefits: ['Lower cholesterol levels', 'Reduced risk of heart disease'],
            created_at: timestamp,
            updated_at: timestamp
          }
        ],
        processing: {
          status: 'completed',
          ocr_confidence: 0.95,
          processing_time: 1.5
        },
        file: {
          original_filename: file.name,
          storage_path: `/uploads/${reportId}.pdf`,
          mime_type: file.type,
          size: file.size
        },
        created_at: timestamp,
        updated_at: timestamp
      };
      
      // Add the report to context
      addReport(newReport);
      
      addToast('Report uploaded successfully', 'success');
      navigate(`/reports/${reportId}`);
    } catch (error) {
      addToast('Failed to upload report', 'error');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Lab Report</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload your lab report to analyze and track your health metrics
        </p>
      </div>
      
      <div className="px-6 py-6">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            
            <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400 justify-center">
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
                onClick={triggerFileInput}
              >
                Upload a file
              </button>
              <p className="pl-1">or drag and drop</p>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              PDF, PNG, JPG up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 mr-4">
                {file.type.includes('pdf') ? (
                  <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {isLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : 'Upload Report'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Supported File Types:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>PDF lab reports (scanned or digital)</li>
          <li>Images of lab reports (JPG, PNG)</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadReport; 