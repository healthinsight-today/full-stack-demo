import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../services/api/axios';
import { Report, ReportListResponse, CreateReportPayload } from '../types/Report';

interface ReportsContextType {
  reports: Report[];
  loading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  uploadReport: (payload: CreateReportPayload) => Promise<void>;
  getReportById: (id: string) => Report | undefined;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ReportListResponse>('/reports');
      if (response.data.success) {
        setReports(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadReport = async (payload: CreateReportPayload) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('description', payload.description);
      
      const response = await axiosInstance.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        await fetchReports(); // Refresh the reports list
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to upload report');
      console.error('Error uploading report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReportById = useCallback((id: string) => {
    return reports.find(report => report.id === id);
  }, [reports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const value = {
    reports,
    loading,
    error,
    fetchReports,
    uploadReport,
    getReportById,
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}; 