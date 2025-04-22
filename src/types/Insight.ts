import { Parameter } from './Report';

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical' | 'mild' | 'moderate' | 'severe';

export interface InsightDetail {
  title?: string;
  description: string;
  risk_level?: string;
}

export interface Insight {
  id: string;
  _id?: string; // For MongoDB compatibility
  reportId?: string;
  report_id?: string; // For backward compatibility
  title: string;
  description: string;
  severity: InsightSeverity;
  category: string;
  details?: string | InsightDetail[];
  recommendations?: string[];
  possible_causes?: string[];
  action_required?: boolean | string;
  related_parameters?: (string | Parameter)[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // For MongoDB compatibility
  updatedAt?: string; // For MongoDB compatibility
  detailed_analysis?: string;
}

export interface InsightCategory {
  id: string;
  name: string;
  description: string;
  insights: Insight[];
  icon: string;
  color: string;
}

export interface InsightResponse {
  success: boolean;
  message: string;
  data: Insight;
}

export interface CreateInsightPayload {
  report_id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
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

export interface InsightListResponse {
  success: boolean;
  message: string;
  data: Insight[];
}
