import { get } from './client';
import { ApiResponse } from '../../types/Api';
import { Food, FoodRecommendation, FoodLimitation } from '../../types/Report';
import { DietRecommendations } from '../../types/Diet';
import { mockReport } from './mockData';
import { realReport } from './realData';

// Interface for diet recommendations
interface DietRecommendation {
  id: string;
  title: string;
  description: string;
  foods: {
    name: string;
    benefits: string;
    servingSize: string;
    image?: string;
  }[];
  mealPlan?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
}

// Interface for meal plan suggestion from test data
interface MealPlanSuggestion {
  meal_type: string;
  description: string;
  benefits: string[];
}

// Get diet recommendations for a specific report
export const getDietRecommendations = async (reportId: string): Promise<ApiResponse<DietRecommendation[]>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with real data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use real data from our realReport
    const dietRecs: DietRecommendation[] = [];
    
    // Generate recommendations based on foods to increase
    const foodsToIncrease = realReport.diet_recommendations?.foods_to_increase ?? [];
    if (foodsToIncrease.length > 0) {
      // Group foods by reason/benefit
      const benefitsMap = new Map<string, {foods: string[], frequency: string}>();
      
      foodsToIncrease.forEach(food => {
        const key = food.reason.toLowerCase();
        const existing = benefitsMap.get(key);
        
        if (existing) {
          existing.foods.push(food.name);
        } else {
          benefitsMap.set(key, {
            foods: [food.name],
            frequency: food.frequency || 'daily' // Provide default value
          });
        }
      });
      
      // Create recommendations from grouped foods
      Array.from(benefitsMap.entries()).forEach(([benefit, data], index) => {
        // Extract a title from the benefit text
        const benefitWords = benefit.split(' ');
        const title = benefitWords.length > 3 
          ? `Foods for ${benefitWords.slice(0, 3).join(' ')}...`
          : `Foods for ${benefit}`;
          
        dietRecs.push({
          id: `diet-inc-${index + 1}`,
          title,
          description: `Include these foods in your diet ${data.frequency.toLowerCase()} to ${benefit}`,
          foods: data.foods.map(foodName => ({
            name: foodName,
            benefits: benefit,
            servingSize: data.frequency
          }))
        });
      });
    }
    
    // Access meal plan suggestions from the raw JSON data to avoid type issues
    const rawData = (realReport as any)._rawData;
    const mealPlanSuggestions = rawData?.diet_recommendations?.meal_plan_suggestions as MealPlanSuggestion[] | undefined;
    
    // Generate meal plan recommendation if we have meal plan suggestions
    if (mealPlanSuggestions && mealPlanSuggestions.length > 0) {      
      // Create a breakfast, lunch, dinner plan
      const breakfast = mealPlanSuggestions.find((meal: MealPlanSuggestion) => meal.meal_type === 'Breakfast');
      const lunch = mealPlanSuggestions.find((meal: MealPlanSuggestion) => meal.meal_type === 'Lunch');
      const dinner = mealPlanSuggestions.find((meal: MealPlanSuggestion) => meal.meal_type === 'Dinner');
      const snack = mealPlanSuggestions.find((meal: MealPlanSuggestion) => meal.meal_type === 'Snack');
      
      if (breakfast || lunch || dinner) {
        dietRecs.push({
          id: 'diet-meal-plan',
          title: 'Suggested Healthy Meal Plan',
          description: 'A balanced meal plan based on your health profile',
          foods: [],
          mealPlan: {
            breakfast: breakfast?.description || 'Oatmeal with fruits and nuts',
            lunch: lunch?.description || 'Mixed vegetable salad with lean protein',
            dinner: dinner?.description || 'Grilled fish with steamed vegetables',
            snacks: snack ? [snack.description] : ['Fresh fruit', 'Nuts and seeds']
          }
        });
      }
    }
    
    // If we don't have any recommendations yet, create some generic ones
    if (dietRecs.length === 0) {
      // Create a recommendation based on abnormal parameters
      const abnormalParams = realReport.abnormal_parameters;
      const targetedFoods: {name: string, benefit: string}[] = [];
      
      // Add targeted recommendations based on abnormal parameters
      abnormalParams.forEach(param => {
        if (param.name.includes('Cholesterol') && param.direction === 'high') {
          targetedFoods.push(
            {name: 'Oats', benefit: 'Contains soluble fiber that helps lower cholesterol'},
            {name: 'Fatty fish (salmon, mackerel)', benefit: 'Rich in omega-3 fatty acids that help reduce LDL cholesterol'}
          );
        } else if (param.name.includes('Vitamin D') && param.direction === 'low') {
          targetedFoods.push(
            {name: 'Fatty fish', benefit: 'High in vitamin D'},
            {name: 'Fortified dairy products', benefit: 'Good source of vitamin D and calcium'}
          );
        } else if (param.name.includes('Iron') && param.direction === 'low') {
          targetedFoods.push(
            {name: 'Lean red meat', benefit: 'Excellent source of heme iron'},
            {name: 'Leafy greens', benefit: 'Contains non-heme iron and folate'}
          );
        }
      });
      
      // Create a recommendation if we found targeted foods
      if (targetedFoods.length > 0) {
        dietRecs.push({
          id: 'diet-targeted',
          title: 'Foods to Address Your Health Needs',
          description: 'These foods can help address specific findings in your test results',
          foods: targetedFoods.map(item => ({
            name: item.name,
            benefits: item.benefit,
            servingSize: '2-3 times per week'
          }))
        });
      }
      
      // Add a general healthy eating recommendation
      dietRecs.push({
        id: 'diet-general',
        title: 'General Healthy Eating Recommendations',
        description: 'A balanced diet to support overall health',
        foods: [
          {
            name: 'Colorful vegetables and fruits',
            benefits: 'Rich in antioxidants, vitamins, and minerals',
            servingSize: '5+ servings daily'
          },
          {
            name: 'Whole grains',
            benefits: 'Provides fiber and B vitamins',
            servingSize: '3-4 servings daily'
          },
          {
            name: 'Lean proteins',
            benefits: 'Supports muscle health and satiety',
            servingSize: '2-3 servings daily'
          }
        ],
        mealPlan: {
          breakfast: 'Whole grain toast with avocado and egg',
          lunch: 'Quinoa bowl with roasted vegetables and chickpeas',
          dinner: 'Baked salmon with sweet potato and steamed broccoli',
          snacks: ['Greek yogurt with berries', 'Apple with almond butter']
        }
      });
    }
    
    return {
      success: true,
      data: dietRecs,
      status: 200
    };
  }
  
  // Real API call for production
  return get<DietRecommendation[]>(`/reports/${reportId}/diet-recommendations`);
};

// Get foods to limit based on report data
export const getFoodsToLimit = async (reportId: string): Promise<ApiResponse<FoodLimitation[]>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with real data
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Use real data
    const foodsToLimit = realReport.diet_recommendations?.foods_to_limit || [];
    
    return {
      success: true,
      data: foodsToLimit,
      status: 200
    };
  }
  
  // Real API call for production
  return get<FoodLimitation[]>(`/reports/${reportId}/foods-to-limit`);
};

// Get foods to increase based on report data
export const getFoodsToIncrease = async (reportId: string): Promise<ApiResponse<FoodRecommendation[]>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with real data
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Use real data
    const foodsToIncrease = realReport.diet_recommendations?.foods_to_increase || [];
    
    return {
      success: true,
      data: foodsToIncrease,
      status: 200
    };
  }
  
  // Real API call for production
  return get<FoodRecommendation[]>(`/reports/${reportId}/foods-to-increase`);
};

// Get local dietitians based on user location
export const getLocalDietitians = async (
  zipCode: string,
  specialization?: string
): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  title: string;
  specialization: string[];
  address: string;
  phone: string;
  email: string;
  acceptingNewPatients: boolean;
  telehealth: boolean;
  insuranceAccepted: string[];
  rating: number;
  distance: number;
}>>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock dietitians data
    const dietitians = [
      {
        id: "d-1",
        name: "Dr. Sarah Johnson",
        title: "Registered Dietitian, PhD",
        specialization: ["Diabetes Management", "Heart Health", "Weight Management"],
        address: "123 Health St, Wellness City, CA 90210",
        phone: "(555) 123-4567",
        email: "sarah.johnson@example.com",
        acceptingNewPatients: true,
        telehealth: true,
        insuranceAccepted: ["Aetna", "Blue Cross", "Cigna", "Medicare"],
        rating: 4.8,
        distance: 2.3
      },
      {
        id: "d-2",
        name: "Michael Chen, RD",
        title: "Registered Dietitian",
        specialization: ["Sports Nutrition", "Metabolic Health", "Plant-based Diets"],
        address: "456 Nutrition Ave, Wellness City, CA 90210",
        phone: "(555) 234-5678",
        email: "michael.chen@example.com",
        acceptingNewPatients: true,
        telehealth: true,
        insuranceAccepted: ["Blue Cross", "United Healthcare", "Kaiser"],
        rating: 4.6,
        distance: 3.5
      },
      {
        id: "d-3",
        name: "Emily Rodriguez, MS, RD",
        title: "Registered Dietitian",
        specialization: ["Digestive Health", "Food Allergies", "Prenatal Nutrition"],
        address: "789 Wellness Blvd, Wellness City, CA 90210",
        phone: "(555) 345-6789",
        email: "emily.rodriguez@example.com",
        acceptingNewPatients: false,
        telehealth: true,
        insuranceAccepted: ["Aetna", "Cigna", "Humana"],
        rating: 4.9,
        distance: 5.1
      }
    ];
    
    // Filter by specialization if provided
    let filteredDietitians = dietitians;
    if (specialization) {
      filteredDietitians = dietitians.filter(d => 
        d.specialization.some(s => 
          s.toLowerCase().includes(specialization.toLowerCase())
        )
      );
    }
    
    return {
      success: true,
      data: filteredDietitians,
      status: 200
    };
  }
  
  // Real API call for production
  return get<Array<{
    id: string;
    name: string;
    title: string;
    specialization: string[];
    address: string;
    phone: string;
    email: string;
    acceptingNewPatients: boolean;
    telehealth: boolean;
    insuranceAccepted: string[];
    rating: number;
    distance: number;
  }>>('/diet/dietitians', { zipCode, specialization });
};
