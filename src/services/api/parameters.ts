import { AbnormalParameter } from '../../types/Report';
import { ApiResponse } from '../../types/Api';
import { apiService } from '../apiService';

/**
 * Get abnormal parameters for a specific report
 * @param reportId The report ID
 */
export const getAbnormalParameters = async (reportId: string): Promise<ApiResponse<AbnormalParameter[]>> => {
  try {
    const response = await apiService.get(`/health/reports/${reportId}/parameters/abnormal`);
    
    return {
      success: true,
      data: response.data.parameters || [],
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching abnormal parameters:', error);
    return {
      success: false,
      data: [],
      status: error.response?.status || 500,
      error: error instanceof Error ? error.message : 'Failed to fetch abnormal parameters'
    };
  }
}; 