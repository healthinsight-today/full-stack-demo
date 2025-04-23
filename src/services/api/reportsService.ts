import { apiService } from '../apiService';
import { Recommendation } from '../../types/Recommendation';

// Types
export interface Report {
  id: string;
  user_id: string;
  report_info: {
    report_id: string;
    report_type: string;
    report_date: string;
    lab_name: string;
    processing_timestamp: string;
  };
  patient_info: {
    name: string;
    patient_id: string;
    age: number;
    gender: string;
    height?: number;
    weight?: number;
    blood_group?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  description?: string;
  insights?: Array<{
    id: string;
    report_id: string;
    title: string;
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    category: string;
    related_parameters: string[];
    details: string;
    recommendations: string[];
    possible_causes: string[];
    action_required: boolean;
    created_at: string;
    updated_at: string;
  }>;
  recommendations?: Recommendation[];
  test_sections?: Array<{
    section_id: string;
    section_name: string;
    parameters: Array<{
      name: string;
      code?: string;
      value: number;
      unit: string;
      reference_range: string;
      reference_min?: number | null;
      reference_max?: number | null;
      is_abnormal: boolean;
      direction?: 'high' | 'low' | null;
      severity?: 'mild' | 'moderate' | 'severe' | null;
      category: string;
    }>;
  }>;
  abnormal_parameters?: Array<{
    name: string;
    code?: string;
    value: number;
    unit: string;
    reference_range: string;
    reference_min?: number | null;
    reference_max?: number | null;
    is_abnormal: boolean;
    direction?: 'high' | 'low' | null;
    severity?: 'mild' | 'moderate' | 'severe' | null;
    category: string;
    section: string;
    percent_deviation?: number;
    potential_causes?: string[];
  }>;
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    ocr_confidence?: number;
    llm_model?: string;
    processing_time?: number;
  };
}

export interface ReportDetail extends Report {
  insights: Array<{
    id: string;
    report_id: string;
    title: string;
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    category: string;
    related_parameters: string[];
    details: string;
    recommendations: string[];
    possible_causes: string[];
    action_required: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

/**
 * Get all reports for the current user
 */
export const getAllReports = async (): Promise<Report[]> => {
  try {
    const response = await apiService.get('/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get a specific report by ID
 */
export const getReportById = async (reportId: string): Promise<ReportDetail> => {
  try {
    const response = await apiService.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Upload a new report
 */
export const uploadReport = async (file: File): Promise<Report> => {
  try {
    const response = await apiService.upload('/reports/upload', file);
    return response.data;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    await apiService.delete(`/reports/${reportId}`);
  } catch (error) {
    console.error(`Error deleting report ${reportId}:`, error);
    throw error;
  }
}; 