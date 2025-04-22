import { AbnormalParameter } from './Report';
import { InsightSeverity } from './Insight';

export interface Insight {
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
}

export interface CreateInsightPayload {
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
}

export interface UpdateInsightPayload extends Partial<CreateInsightPayload> {
    id: string;
}

export interface InsightResponse {
    success: boolean;
    message: string;
    data: Insight;
}

export interface InsightListResponse {
    success: boolean;
    message: string;
    data: Insight[];
} 