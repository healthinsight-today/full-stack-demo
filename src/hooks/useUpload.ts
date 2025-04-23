import { useState } from 'react';
import { post } from '../services/api/client';
import { Report } from '../types/Report';
import { ApiResponse } from '../types/Api';
import { apiService } from '../services/apiService';

interface UseUploadOptions {
  endpoint?: string;
  onUploadProgress?: (percentage: number) => void;
  onSuccess?: (response: ApiResponse<Report>) => void;
  onError?: (error: string) => void;
}

interface UseUploadResult {
  uploadFile: (file: File) => Promise<void>;
  cancelUpload: () => void;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export const useUpload = (options: UseUploadOptions = {}): UseUploadResult => {
  const {
    endpoint = '/reports/upload',
    onUploadProgress,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const uploadFile = async (file: File): Promise<void> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    const newController = new AbortController();
    setController(newController);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Set up real progress tracking
      const uploadProgressCallback = (progressEvent: any) => {
        if (progressEvent.lengthComputable) {
          const progressPercent = (progressEvent.loaded / progressEvent.total) * 100;
          setProgress(progressPercent);
          if (onUploadProgress) {
            onUploadProgress(progressPercent);
          }
        }
      };

      // Use the apiService's upload method directly
      const response = await apiService.upload(
        endpoint,
        file,
        uploadProgressCallback
      );

      // Set full progress when done
      setProgress(100);
      if (onUploadProgress) {
        onUploadProgress(100);
      }

      // Format response to match ApiResponse<Report>
      const formattedResponse: ApiResponse<Report> = {
        success: true,
        data: response.data,
        status: response.status
      };

      if (onSuccess) {
        onSuccess(formattedResponse);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsUploading(false);
      setController(null);
    }
  };

  const cancelUpload = (): void => {
    if (controller) {
      controller.abort();
      setIsUploading(false);
      setProgress(0);
      setError('Upload cancelled');
    }
  };

  return {
    uploadFile,
    cancelUpload,
    isUploading,
    progress,
    error,
  };
}; 