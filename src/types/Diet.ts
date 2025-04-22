import { Food as ReportFood } from './Report';

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

export interface DietRecommendation {
  title: string;
  description: string;
  foods: Food[];
}

export interface DietRecommendations {
  foods_to_increase: FoodRecommendation[];
  foods_to_limit: FoodLimitation[];
  meal_plan_suggestions: MealSuggestion[];
} 