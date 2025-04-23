import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../../types/Api';
import { apiService } from '../apiService';

// Get the pre-configured API instance
const api = apiService.getInstance();

/**
 * Generic GET request wrapper
 * 
 * @param endpoint - API endpoint path
 * @param params - Query parameters
 * @returns Promise with typed response
 */
export async function get<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse = await api.get(endpoint, { params });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    // Error is already handled by interceptor but we need to format it
    return {
      success: false,
      data: null as T,
      error: error.message || 'An unknown error occurred',
      status: error.response?.status || 500
    };
  }
}

/**
 * Generic POST request wrapper
 * 
 * @param endpoint - API endpoint path
 * @param data - Request payload
 * @returns Promise with typed response
 */
export async function post<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse = await api.post(endpoint, data);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as T,
      error: error.message || 'An unknown error occurred',
      status: error.response?.status || 500
    };
  }
}

/**
 * Generic PUT request wrapper
 * 
 * @param endpoint - API endpoint path
 * @param data - Request payload
 * @returns Promise with typed response
 */
export async function put<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse = await api.put(endpoint, data);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as T,
      error: error.message || 'An unknown error occurred',
      status: error.response?.status || 500
    };
  }
}

/**
 * Generic PATCH request wrapper
 * 
 * @param endpoint - API endpoint path
 * @param data - Request payload
 * @returns Promise with typed response
 */
export async function patch<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse = await api.patch(endpoint, data);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as T,
      error: error.message || 'An unknown error occurred',
      status: error.response?.status || 500
    };
  }
}

/**
 * Generic DELETE request wrapper
 * 
 * @param endpoint - API endpoint path
 * @returns Promise with typed response
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse = await api.delete(endpoint);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as T,
      error: error.message || 'An unknown error occurred',
      status: error.response?.status || 500
    };
  }
}

// Export delete as 'del' to avoid keyword conflict
export { del as delete }; 