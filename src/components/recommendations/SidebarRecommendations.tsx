import React from 'react';
import Card from '../common/Card';

interface SidebarRecommendationsProps {
  dietRecommendations: {
    foods_to_increase: Array<{
      name: string;
      reason: string;
      frequency?: string;
    }>;
    foods_to_limit: Array<{
      name: string;
      reason: string;
      alternative?: string;
    }>;
    meal_plan_suggestions: Array<{
      meal_type: string;
      description: string;
      benefits: string[];
    }>;
  };
}

const SidebarRecommendations: React.FC<SidebarRecommendationsProps> = ({
  dietRecommendations
}) => {
  return (
    <div className="w-80 flex-shrink-0 border-l border-neutral-200 dark:border-neutral-700 sticky top-0 h-screen overflow-auto">
      <Card className="m-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">
            Quick Diet Guide
          </h3>
          
          {/* Foods to Increase */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Foods to Increase
            </h4>
            <div className="space-y-3">
              {dietRecommendations.foods_to_increase.map((food, index) => (
                <div key={index} className="text-sm bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">{food.name}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">{food.reason}</p>
                  {food.frequency && (
                    <p className="text-neutral-500 dark:text-neutral-500 text-xs mt-0.5 italic">
                      {food.frequency}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Foods to Limit */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Foods to Limit
            </h4>
            <div className="space-y-3">
              {dietRecommendations.foods_to_limit.map((food, index) => (
                <div key={index} className="text-sm bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">{food.name}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">{food.reason}</p>
                  {food.alternative && (
                    <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">
                      Try: {food.alternative}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Meal Plan */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Daily Meal Plan
            </h4>
            <div className="space-y-3">
              {dietRecommendations.meal_plan_suggestions.map((meal, index) => (
                <div key={index} className="text-sm bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">{meal.meal_type}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">{meal.description}</p>
                  <div className="mt-1 space-y-0.5">
                    {meal.benefits.map((benefit, benefitIndex) => (
                      <p key={benefitIndex} className="text-blue-600 dark:text-blue-400 text-xs">
                        • {benefit}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SidebarRecommendations; 