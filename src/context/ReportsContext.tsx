import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Report, getAllReports } from '../services/api/reportsService';
import { Recommendation } from '../types/Recommendation';
import { FilterOptions } from '../types/Filter';

interface ReportsContextProps {
  reports: Report[];
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  getReportById: (id: string) => Report | undefined;
  fetchReports: () => Promise<void>;
  addReport: (report: Report) => void;
}

const ReportsContext = createContext<ReportsContextProps | undefined>(undefined);

interface ReportsProviderProps {
  children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    dateRange: undefined,
    reportTypes: undefined,
    abnormalOnly: false,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Fetch reports from backend API
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllReports();
      
      if (data) {
        setReports(data);
        
        // Extract recommendations from the reports
        const allRecommendations: Recommendation[] = [];
        data.forEach((report) => {
          if (report.recommendations && report.recommendations.length > 0) {
            allRecommendations.push(...report.recommendations);
          }
        });
        
        setRecommendations(allRecommendations);
      }
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get report by ID
  const getReportById = (id: string) => {
    return reports.find(report => report.id === id);
  };
  
  // Add a new report
  const addReport = (report: Report) => {
    setReports(prevReports => [report, ...prevReports]);
    
    if (report.recommendations && report.recommendations.length > 0) {
      setRecommendations(prevRecommendations => [
        ...report.recommendations!,
        ...prevRecommendations
      ]);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  const value = {
    reports,
    recommendations,
    isLoading,
    error,
    filterOptions,
    setFilterOptions,
    getReportById,
    fetchReports,
    addReport
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};

export const useReports = (): ReportsContextProps => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}; 