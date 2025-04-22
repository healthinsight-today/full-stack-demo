import { Report } from '../../types/Report';
import { Insight } from '../../types/Insights';
import { Recommendation } from '../../types/Recommendation';

// Create empty mock data with proper types
export const mockReport: Report = {
    id: 'mock-report-1',
    user_id: 'mock-user-1',
    filename: 'mock-report.pdf',
    description: 'Mock Report',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'completed',
    report_info: {
        report_id: 'mock-report-1',
        report_type: 'Blood Test',
        report_date: new Date().toISOString(),
        lab_name: 'Mock Lab',
        processing_timestamp: new Date().toISOString()
    },
    patient_info: {
        name: 'John Doe',
        patient_id: 'P12345',
        age: 30,
        gender: 'Male'
    },
    test_sections: [],
    abnormal_parameters: [],
    insights: [],
    recommendations: [],
    processing: {
        status: 'completed',
        ocr_confidence: 0.95,
        processing_time: 1.5
    },
    file: {
        original_filename: 'mock-report.pdf',
        storage_path: '/uploads/user/reports/mock-report-1.pdf',
        mime_type: 'application/pdf',
        size: 1024 * 1024 // 1MB mock size
    }
};

export const mockReports: Report[] = [mockReport];

export const mockInsights: Insight[] = [];

export const mockRecommendations: Recommendation[] = []; 