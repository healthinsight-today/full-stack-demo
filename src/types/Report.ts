import { DietRecommendations } from './Diet';
import { Insight } from './Insights';
import { Recommendation } from './Recommendation';

export interface Report {
    id: string;  // Keep as id
    user_id: string;
    filename?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    file_content?: Buffer;
    
    // Extended properties
    report_info: ReportInfo;  // Make required
    patient_info: PatientInfo;  // Make required
    test_sections?: TestSection[];  // Make optional
    abnormal_parameters?: AbnormalParameter[];  // Make optional
    insights?: Insight[];  // Make optional
    recommendations?: Recommendation[];  // Make optional
    diet_recommendations?: DietRecommendations;
    processing?: ProcessingInfo;  // Make optional
    file?: FileInfo;  // Make optional
}

export interface CreateReportPayload {
    file: File;
    description: string;
}

export interface UpdateReportPayload {
    id: string;
    description?: string;
    status?: Report['status'];
}

export interface ReportResponse {
    success: boolean;
    message: string;
    data: Report;
}

export interface ReportListResponse {
    success: boolean;
    message: string;
    data: Report[];
}

// Detailed report information interfaces
export interface ReportDetail extends Report {
    report_info: ReportInfo;
    patient_info: PatientInfo;
    test_sections?: TestSection[];
    abnormal_parameters?: AbnormalParameter[];
    insights?: Insight[];
    diet_recommendations?: DietRecommendations;
    processing?: ProcessingInfo;
    file?: FileInfo;
}

export interface ReportInfo {
    report_id: string;
    report_type: string;
    report_date: string;
    lab_name: string;
    processing_timestamp: string;
}

export interface PatientInfo {
    name: string;
    patient_id: string;
    age: number;
    gender: string;
    height?: number;
    weight?: number;
    blood_group?: string;
}

export interface TestSection {
    section_id: string;
    section_name: string;
    parameters: Parameter[];
}

export interface Parameter {
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
}

export interface AbnormalParameter extends Parameter {
    section: string;
    percent_deviation?: number;
    potential_causes?: string[];
}

export interface Specialist {
    specialty: string;
    reason: string;
    urgency: string;
    timeframe: string;
}

export interface Food {
    name: string;
    reason: string;
    frequency?: string;
    alternative?: string;
}

export type FoodRecommendation = Food;
export type FoodLimitation = Food;

export interface MealSuggestion {
    meal_type: string;
    description: string;
    benefits: string[];
}

export interface ProcessingInfo {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    ocr_confidence?: number;
    llm_model?: string;
    processing_time?: number;
}

export interface FileInfo {
    original_filename: string;
    storage_path: string;
    mime_type: string;
    size: number;
}
  