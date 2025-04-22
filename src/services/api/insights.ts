import axios from 'axios';
import { ApiResponse, PaginatedResponse } from '../../types/Api';
import { Insight, InsightResponse, CreateInsightPayload, UpdateInsightPayload } from '../../types/Insights';
import { mockReport, mockInsights } from './mockData';
import { realReport } from './realData';
import { apiService } from '../apiService';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Filter options for insights
interface InsightFilters {
  category?: string;
  severity?: string;
  reportId?: string;
  timeRange?: 'week' | 'month' | 'year';
}

// Sample insights - In a real app, these would come from an API
const getRealInsights = (): Insight[] => {
  // Create insights from the real report data
  return realReport.insights || [];
};

// Get insights for a specific report
export const getReportInsights = async (reportId: string): Promise<ApiResponse<Insight[]>> => {
  try {
    const response = await apiService.get(`/health/reports/${reportId}/insights`);
    
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching report insights:', error);
    return {
      success: false,
      data: [],
      status: error.response?.status || 500,
      error: error instanceof Error ? error.message : 'Failed to fetch insights'
    };
  }
};

// Get all insights with optional filtering
export const getInsights = async (): Promise<InsightResponse> => {
  const response = await axiosInstance.get('/api/insights');
  return response.data;
};

// Get a specific insight by ID
export const getInsightById = async (insightId: string): Promise<ApiResponse<Insight>> => {
  try {
    const response = await apiService.get(`/health/insights/${insightId}`);
    
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching insight details:', error);
    return {
      success: false,
      data: null as unknown as Insight,
      status: error.response?.status || 500,
      error: error instanceof Error ? error.message : 'Failed to fetch insight'
    };
  }
};

// Get related insights for a specific insight
export const getRelatedInsights = async (insightId: string): Promise<ApiResponse<Insight[]>> => {
  try {
    const response = await axiosInstance.get(`/insights/${insightId}/related`);
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
};

// Get insights grouped by severity
export const getInsightsBySeverity = async (): Promise<ApiResponse<Record<string, Insight[]>>> => {
  try {
    const response = await axiosInstance.get('/insights/by-severity');
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    if (error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'status' in error.response && error.response.status === 404) {
      return {
        success: false,
        data: {},
        error: 'No insights found',
        status: 404
      };
    }
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : 'Failed to fetch insights by severity',
      status: 500
    };
  }
};

// Get insights categories with counts
export const getInsightsCategories = async (): Promise<ApiResponse<{ category: string; count: number }[]>> => {
  try {
    const response = await axiosInstance.get('/insights/categories');
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    if (error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'status' in error.response && error.response.status === 404) {
      return {
        success: false,
        data: [],
        error: 'No categories found',
        status: 404
      };
    }
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      status: 500
    };
  }
};

// Get trend data for a specific parameter
export const getParameterTrend = async (
  parameterId: string,
  timeframe: 'month' | 'quarter' | 'year' | 'all' = 'year'
): Promise<ApiResponse<{
  parameter: string;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
  data: Array<{ date: string; value: number }>
}>> => {
  try {
    const response = await axiosInstance.get(`/insights/trends/${parameterId}`, {
      params: { timeframe }
    });
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error) {
    return {
      success: false,
      data: {
        parameter: '',
        unit: '',
        reference_min: null,
        reference_max: null,
        data: []
      },
      error: error instanceof Error ? error.message : 'Failed to fetch parameter trend',
      status: 500
    };
  }
};

const INSIGHTS_ENDPOINT = '/insights';

export const insightsApi = {
  fetchInsights: async (): Promise<Insight[]> => {
    const response = await axiosInstance.get(INSIGHTS_ENDPOINT);
    return response.data;
  },

  createInsight: async (payload: CreateInsightPayload): Promise<Insight> => {
    const response = await axiosInstance.post(INSIGHTS_ENDPOINT, payload);
    return response.data;
  },

  updateInsight: async (payload: UpdateInsightPayload): Promise<Insight> => {
    const response = await axiosInstance.put(`${INSIGHTS_ENDPOINT}/${payload.id}`, payload);
    return response.data;
  },

  deleteInsight: async (insightId: string): Promise<void> => {
    await axiosInstance.delete(`${INSIGHTS_ENDPOINT}/${insightId}`);
  },

  getInsightById: async (insightId: string): Promise<Insight> => {
    const response = await axiosInstance.get(`${INSIGHTS_ENDPOINT}/${insightId}`);
    return response.data;
  }
};
