import React from 'react';
import { useReports } from '../../context/ReportsContext';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface UploadProgressProps {
  reportId: string;
  onComplete?: () => void;
  className?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  reportId,
  onComplete,
  className = '',
}) => {
  const [status, setStatus] = React.useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Import the checkReportStatus function from the reports service
  const { checkReportStatus } = require('../../services/api/reports');

  // Poll for status updates
  React.useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await checkReportStatus(reportId);
        
        if (response.success && response.data) {
          setStatus(response.data.status as any);
          
          if (response.data.progress) {
            setProgress(response.data.progress);
          }
          
          // If processing is complete or failed, stop polling
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            
            if (response.data.status === 'completed' && onComplete) {
              onComplete();
            }
            
            if (response.data.status === 'failed') {
              setError('Processing failed. Please try uploading again.');
            }
          }
        } else {
          setError(response.error || 'Failed to check processing status');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };
    
    // Poll immediately and then every 3 seconds
    pollStatus();
    intervalRef.current = setInterval(pollStatus, 3000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reportId, onComplete, checkReportStatus]);

  // Status-specific content
  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Preparing Your Report',
          description: 'Your report is in the queue and will be processed shortly.',
          icon: (
            <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
        };
      case 'processing':
        return {
          title: 'Processing Your Report',
          description: 'We are extracting and analyzing the data from your report.',
          icon: (
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          ),
        };
      case 'completed':
        return {
          title: 'Processing Complete',
          description: 'Your report has been successfully processed and is ready to view.',
          icon: (
            <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
        };
      case 'failed':
        return {
          title: 'Processing Failed',
          description: 'We encountered an issue while processing your report. Please try uploading again.',
          icon: (
            <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
        };
      default:
        return {
          title: 'Checking Status',
          description: 'Please wait while we check the status of your report.',
          icon: <LoadingSpinner size="lg" />,
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <Card className={className}>
      <div className="p-6">
        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {statusContent.icon}
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
              {statusContent.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              {statusContent.description}
            </p>
            
            {status === 'processing' && (
              <div className="w-full max-w-md mt-2">
                <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
              <p>Report ID: {reportId}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UploadProgress;
