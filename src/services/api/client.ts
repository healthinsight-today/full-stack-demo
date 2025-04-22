import { ApiResponse } from '../../types/Api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.healthinsighttoday.com';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

// Helper function to build URL with query parameters
const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

// Generic API client function
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', headers = {}, body, params } = options;
  
  try {
    const url = buildUrl(endpoint, params);
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Include cookies for authentication
    };
    
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // For development/demo, simulate network delay
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: null as T,
        error: data.message || 'An error occurred',
        status: response.status,
      };
    }
    
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
    };
  }
};

// Export convenience methods
export const get = <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> => {
  return apiClient<T>(endpoint, { method: 'GET', params });
};

export const post = <T>(endpoint: string, body: any, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> => {
  return apiClient<T>(endpoint, { method: 'POST', body, params });
};

export const put = <T>(endpoint: string, body: any, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> => {
  return apiClient<T>(endpoint, { method: 'PUT', body, params });
};

export const del = <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> => {
  return apiClient<T>(endpoint, { method: 'DELETE', params });
}; 