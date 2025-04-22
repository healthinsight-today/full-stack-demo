import { ApiResponse } from '../../types/Api';
import recommendationsData from '../../data/recommendationsData.json';
import { Recommendation } from '../../types/Recommendation';
import { apiService } from '../apiService';

// Doctor Recommendation Types
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  distance: string;
  availability: string;
  rating: number;
  reviews: number;
  acceptsInsurance: boolean;
  telehealth: boolean;
  image: string;
}

export interface DoctorRecommendation {
  id: string;
  reportId: string;
  specialistType: string;
  reason: string;
  urgency: string;
  timeframe: string;
  specialists: Doctor[];
}

// Get doctor recommendations for a specific report
export const getDoctorRecommendations = async (reportId: string): Promise<ApiResponse<DoctorRecommendation[]>> => {
  try {
    // In development mode, use the mock data
    if (process.env.NODE_ENV === 'development') {
      const filteredRecommendations = recommendationsData.doctorRecommendations.filter(
        rec => rec.reportId === reportId
      );
      
      return {
        success: true,
        data: filteredRecommendations,
        status: 200
      };
    }
    
    // In production, this would call an actual API endpoint
    // return await get<DoctorRecommendation[]>(`/api/reports/${reportId}/doctor-recommendations`);
    
    // Fallback for now
    return {
      success: true,
      data: [],
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

/**
 * Get recommendations for a specific report
 * @param reportId The report ID
 */
export const getReportRecommendations = async (reportId: string): Promise<ApiResponse<Recommendation[]>> => {
  try {
    const response = await apiService.get(`/health/reports/${reportId}/recommendations`);
    
    return {
      success: true,
      data: response.data.recommendations || [],
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching report recommendations:', error);
    return {
      success: false,
      data: [],
      status: error.response?.status || 500,
      error: error instanceof Error ? error.message : 'Failed to fetch recommendations'
    };
  }
};

/**
 * Get a specific recommendation by ID
 * @param recommendationId The recommendation ID
 */
export const getRecommendationById = async (recommendationId: string): Promise<ApiResponse<Recommendation>> => {
  try {
    const response = await apiService.get(`/health/recommendations/${recommendationId}`);
    
    return {
      success: true,
      data: response.data,
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching recommendation details:', error);
    return {
      success: false,
      data: null as unknown as Recommendation,
      status: error.response?.status || 500,
      error: error instanceof Error ? error.message : 'Failed to fetch recommendation'
    };
  }
}; 