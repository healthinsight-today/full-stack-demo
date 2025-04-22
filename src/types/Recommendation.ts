export interface Recommendation {
  id: string;
  report_id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  priority: string;
  related_parameters: string[];
  steps: string[];
  benefits: string[];
  type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecommendationPayload {
  type: Recommendation['type'];
  title: string;
  description: string;
  priority: Recommendation['priority'];
  timeframe?: string;
}

export interface UpdateRecommendationPayload {
  id: string;
  title?: string;
  description?: string;
  priority?: Recommendation['priority'];
  timeframe?: string;
  status?: Recommendation['status'];
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data: Recommendation;
}

export interface RecommendationListResponse {
  success: boolean;
  message: string;
  data: Recommendation[];
}

export interface SpecialistRecommendation {
  specialty: string;
  reason: string;
  urgency: 'urgent' | 'soon' | 'routine';
  timeframe: string;
}

export interface DietRecommendations {
  foods_to_increase: FoodRecommendation[];
  foods_to_limit: FoodLimitation[];
}

export interface FoodRecommendation {
  name: string;
  reason: string;
  frequency: string;
}

export interface FoodLimitation {
  name: string;
  reason: string;
  alternative: string;
}

// Extended recommendation interfaces
export interface RecommendationDetail extends Recommendation {
  id: string;
  title: string;
  long_description: string;
  steps: string[];
  related_parameters: string[];
  related_conditions: string[];
  evidence_level: 'strong' | 'moderate' | 'limited';
  sources: string[];
  timeframe: string;
  expected_outcome: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationCategory {
  id: string;
  name: string;
  description: string;
  recommendations: RecommendationDetail[];
  icon: string;
  color: string;
}

export interface UserRecommendationInteraction {
  recommendation_id: string;
  status: 'viewed' | 'saved' | 'completed' | 'dismissed';
  notes: string;
  date_actioned: string;
}

export interface ExerciseRecommendation {
  id: string;
  title: string;
  description: string;
  frequency: string;
  duration: string;
  intensity: 'low' | 'moderate' | 'high';
  target_parameters: string[];
  contraindications: string[];
  instructions: string[];
  images: string[];
}
