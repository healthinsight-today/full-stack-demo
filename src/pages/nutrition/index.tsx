import React from 'react';
import GroceryRecommendations from '../../components/nutrition/GroceryRecommendations';

export default function NutritionPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="pb-2">
        <h1 className="text-2xl font-bold">Nutrition Recommendations</h1>
        <p className="text-gray-600">Personalized food recommendations based on your health profile</p>
      </div>
      
      <div>
        <div className="flex flex-col gap-6">
          <GroceryRecommendations />
        </div>
      </div>
    </div>
  );
} 