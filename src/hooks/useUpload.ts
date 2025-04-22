import { useState } from 'react';
import { post } from '../services/api/client';
import { Report } from '../types/Report';
import { ApiResponse } from '../types/Api';

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

      // Mock upload progress (since fetch doesn't support progress events easily)
      const simulateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          if (currentProgress >= 90) {
            clearInterval(interval);
            return;
          }
          currentProgress += Math.random() * 10;
          currentProgress = Math.min(currentProgress, 90);
          setProgress(currentProgress);
          if (onUploadProgress) {
            onUploadProgress(currentProgress);
          }
        }, 300);

        return interval;
      };

      const progressInterval = simulateProgress();

      // In a real implementation with XMLHttpRequest:
      // const xhr = new XMLHttpRequest();
      // xhr.upload.onprogress = (event) => {
      //   if (event.lengthComputable) {
      //     const progressPercent = (event.loaded / event.total) * 100;
      //     setProgress(progressPercent);
      //     if (onUploadProgress) {
      //       onUploadProgress(progressPercent);
      //     }
      //   }
      // };

      // Make API call
      const response = await post<Report>(
        endpoint,
        formData,
        undefined,
        // In a real implementation, pass the controller signal
        // { signal: newController.signal }
      );

      // Clear the progress interval
      clearInterval(progressInterval);

      // Set full progress when done
      setProgress(100);
      if (onUploadProgress) {
        onUploadProgress(100);
      }

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        const errorMsg = response.error || 'Upload failed';
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
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