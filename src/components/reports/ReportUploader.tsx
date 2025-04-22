import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { uploadReport } from '../../services/api/reports';

interface ReportUploaderProps {
  onUploadSuccess?: (reportId: string) => void;
  className?: string;
}

const ReportUploader: React.FC<ReportUploaderProps> = ({
  onUploadSuccess,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Accepted file types
  const acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
  ];

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  // Validate file type and size
  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Check file type
    if (!acceptedFileTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF or image file (JPEG, PNG, TIFF).');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum file size is 10MB.');
      return;
    }
    
    setFile(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    // Use empty string as default description
    const description = '';
    
    try {
      const response = await uploadReport(file, description);
      
      if (response.success && response.data) {
        addToast('Report uploaded successfully and is being processed.', 'success');
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.report_id);
        }
      } else {
        setError(response.error || 'Failed to upload report. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">Upload Blood Test Report</h2>
        
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
            onRetry={handleReset}
          />
        )}
        
        {/* File upload area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary bg-opacity-5' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}
            ${file ? 'bg-neutral-50 dark:bg-neutral-900' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={0}
          aria-label="Upload file area"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center">
            <svg 
              className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            
            {file ? (
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Selected file:</p>
                <p className="text-primary font-medium">{file.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                  Drag and drop your file here or click to browse
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Supported formats: PDF, JPEG, PNG, TIFF (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Upload progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          {file && !isUploading && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              aria-label="Reset selection"
            >
              Reset
            </Button>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={!file || isUploading}
            isLoading={isUploading}
            aria-label="Upload file"
          >
            Upload Report
          </Button>
        </div>
        
        {/* Help text */}
        <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            <strong>Note:</strong> Your report will be processed automatically to extract health data.
            This may take a few minutes depending on the file size and complexity.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReportUploader;
