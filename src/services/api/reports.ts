import { get, post } from './client';
import { Report } from '../../types/Report';
import { ApiResponse, PaginatedResponse, UploadResponse } from '../../types/Api';
import { FilterOptions } from '../../types/Filter';
import { mockReports, mockReport } from './mockData';
import { realReport, getRealReports, getRealReport } from './realData';
import { apiService } from '../apiService';

// Get all reports with optional filtering
export const getReports = async (
  filterOptions?: FilterOptions
): Promise<ApiResponse<Report[]>> => {
  // In a real app, we would pass filterOptions to the API
  // For mock implementation, we'll filter locally
  
  if (process.env.NODE_ENV === 'development') {
    // Use real test data instead of mock data
    return getRealReports();
    
    // Commenting out mock data implementation
    /* 
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredReports = [...mockReports];
    
    if (filterOptions) {
      // Apply filters
      if (filterOptions.dateRange) {
        const { startDate, endDate } = filterOptions.dateRange;
        filteredReports = filteredReports.filter(report => {
          const reportDate = new Date(report.report_info.report_date);
          return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
        });
      }
      
      if (filterOptions.reportTypes && filterOptions.reportTypes.length > 0) {
        filteredReports = filteredReports.filter(report => 
          filterOptions.reportTypes?.includes(report.report_info.report_type)
        );
      }
      
      if (filterOptions.abnormalOnly) {
        filteredReports = filteredReports.filter(report => 
          report.abnormal_parameters.length > 0
        );
      }
      
      if (filterOptions.searchTerm) {
        const searchTerm = filterOptions.searchTerm.toLowerCase();
        filteredReports = filteredReports.filter(report => 
          report.patient_info.name.toLowerCase().includes(searchTerm) ||
          report.report_info.lab_name.toLowerCase().includes(searchTerm) ||
          report.report_info.report_type.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (filterOptions.sortBy) {
        filteredReports.sort((a, b) => {
          switch (filterOptions.sortBy) {
            case 'date':
              return new Date(a.report_info.report_date).getTime() - new Date(b.report_info.report_date).getTime();
            case 'name':
              return a.patient_info.name.localeCompare(b.patient_info.name);
            case 'abnormalities':
              return a.abnormal_parameters.length - b.abnormal_parameters.length;
            default:
              return 0;
          }
        });
        
        // Apply sort order
        if (filterOptions.sortOrder === 'desc') {
          filteredReports.reverse();
        }
      }
    }
    
    return {
      success: true,
      data: filteredReports,
      status: 200
    };
    */
  }
  
  // Real API call for production
  return get<Report[]>('/health/reports', filterOptions as Record<string, string | number | boolean | undefined>);
};

// Get paginated reports
export const getPaginatedReports = async (
  page: number = 1,
  limit: number = 10,
  filterOptions: {
    dateRange?: { startDate: string; endDate: string };
    reportTypes?: string[];
    abnormalOnly?: boolean;
    searchTerm?: string;
    sortBy?: 'name' | 'date' | 'abnormalities';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<PaginatedResponse<Report>>> => {
  if (process.env.NODE_ENV === 'development') {
    // Use real test data instead of mock data
    const response = await getRealReports();
    // Ensure reports is always an array with at least one item
    const reports = response.data || [realReport]; 
    
    return {
      success: true,
      data: {
        items: reports,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: reports.length,
          per_page: reports.length
        }
      },
      status: 200
    };
    
    // Commenting out mock data implementation
    /*
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Apply filters
    let filteredReports = [...mockReports];
    
    // Date range filter
    if (filterOptions.dateRange) {
      const { startDate, endDate } = filterOptions.dateRange;
      filteredReports = filteredReports.filter(report => {
        const reportDate = new Date(report.report_info.report_date);
        return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
      });
    }
    
    // Report type filter
    if (filterOptions.reportTypes && filterOptions.reportTypes.length > 0) {
      filteredReports = filteredReports.filter(report =>
        filterOptions.reportTypes?.includes(report.report_info.report_type)
      );
    }
    
    // Abnormal only filter
    if (filterOptions.abnormalOnly) {
      filteredReports = filteredReports.filter(report =>
        report.abnormal_parameters.length > 0
      );
    }
    
    // Search term filter
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      filteredReports = filteredReports.filter(report =>
        report.report_info.report_type.toLowerCase().includes(searchTerm) ||
        report.report_info.lab_name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    if (filterOptions.sortBy) {
      filteredReports.sort((a, b) => {
        switch (filterOptions.sortBy) {
          case 'date':
            return new Date(a.report_info.report_date).getTime() - new Date(b.report_info.report_date).getTime();
          case 'name':
            return a.report_info.report_type.localeCompare(b.report_info.report_type);
          case 'abnormalities':
            return a.abnormal_parameters.length - b.abnormal_parameters.length;
          default:
            return 0;
        }
      });
      
      // Apply sort order
      if (filterOptions.sortOrder === 'desc') {
        filteredReports.reverse();
      }
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredReports.length / limit);
    
    return {
      success: true,
      data: {
        items: paginatedReports,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: filteredReports.length,
          per_page: limit
        }
      },
      status: 200
    };
    */
  }
  
  // Real API call for production
  const queryParams: Record<string, string | number | boolean> = {
    page,
    limit
  };
  
  // Convert filter options to query params
  if (filterOptions.dateRange) {
    queryParams.startDate = filterOptions.dateRange.startDate;
    queryParams.endDate = filterOptions.dateRange.endDate;
  }
  
  if (filterOptions.reportTypes) {
    queryParams.reportTypes = filterOptions.reportTypes.join(',');
  }
  
  if (filterOptions.abnormalOnly !== undefined) {
    queryParams.abnormalOnly = filterOptions.abnormalOnly;
  }
  
  if (filterOptions.searchTerm) {
    queryParams.search = filterOptions.searchTerm;
  }
  
  if (filterOptions.sortBy) {
    queryParams.sortBy = filterOptions.sortBy;
  }
  
  if (filterOptions.sortOrder) {
    queryParams.sortOrder = filterOptions.sortOrder;
  }
  
  return get<PaginatedResponse<Report>>('/reports', queryParams);
};

// Get a single report by ID
export const getReportById = async (id: string): Promise<ApiResponse<Report>> => {
  try {
    // Use the actual backend endpoint
    const response = await apiService.get(`/health/reports/${id}`);
    
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    console.error('Error fetching report details:', error);
    
    // Fallback to development data in case of error
    if (process.env.NODE_ENV === 'development') {
      // Use real test data instead of mock data
      return getRealReport();
    }
    
    return {
      success: false,
      data: null as unknown as Report,
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to fetch report'
    };
  }
};

// Upload report function
export const uploadReport = async (file: File, description: string): Promise<ApiResponse<UploadResponse>> => {
  try {
    // First, upload the document
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiService.upload('/documents/upload', file);
    
    if (!uploadResponse.data || !uploadResponse.data.id) {
      throw new Error('Failed to upload document');
    }
    
    // Then, analyze the document using MCP
    const analyzeFormData = new FormData();
    analyzeFormData.append('file', file); // The endpoint requires the file directly
    analyzeFormData.append('provider', 'claude'); // Using Claude as the default provider
    analyzeFormData.append('model', 'claude-3-7-sonnet-20250219'); // Using Sonnet model
    
    const analysisResponse = await apiService.post('/health/analyze-report-with-mcp', analyzeFormData);
    
    if (!analysisResponse.data || !analysisResponse.data.run_id) {
      throw new Error('Failed to analyze document');
    }
    
    // Return the response
    return {
      success: true,
      data: {
        report_id: analysisResponse.data.run_id,
        status: 'processing',
        message: 'Report uploaded and analysis started'
      },
      status: 200
    };
  } catch (error) {
    console.error('Error uploading and analyzing report:', error);
    return {
      success: false,
      data: {
        report_id: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Upload failed'
      },
      status: 500
    };
  }
};

// Check report processing status
export const checkReportStatus = async (reportId: string): Promise<ApiResponse<{ status: string; progress?: number }>> => {
  try {
    // Use the actual backend endpoint for checking status
    const response = await apiService.get(`/health/reports/${reportId}/status`);
    
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    console.error('Error checking report status:', error);
    
    // Fallback to mock data in case of error or for development
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: false,
      data: {
        status: randomStatus,
        progress: randomStatus === 'processing' ? Math.floor(Math.random() * 100) : undefined
      },
      status: 500
    };
  }
};

// Delete a report
export const deleteReport = async (reportId: string): Promise<ApiResponse<void>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: undefined,
      status: 204
    };
  } catch (error) {
    return {
      success: false,
      data: undefined,
      status: 500
    };
  }
};
