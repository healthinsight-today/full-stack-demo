import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

interface Specialist {
  specialty: string;
  reason: string;
  urgency: string;
  timeframe: string;
}

interface Food {
  name: string;
  reason: string;
  frequency?: string;
  alternative?: string;
}

interface MealSuggestion {
  meal_type: string;
  description: string;
  benefits: string[];
}

interface RecommendationsProps {
  specialists: Array<{
    specialty: string;
    reason: string;
    urgency: string;
    timeframe: string;
  }>;
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

const Recommendations: React.FC<RecommendationsProps> = ({
  specialists,
  dietRecommendations
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Specialist Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recommended Specialists</h3>
        <div className="space-y-4">
          {specialists.map((specialist, index) => (
            <div key={index} className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-neutral-900 dark:text-white">{specialist.specialty}</h4>
                <Badge className={getUrgencyColor(specialist.urgency)}>
                  {specialist.urgency.toUpperCase()}
                </Badge>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">{specialist.reason}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Timeframe: {specialist.timeframe}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Diet Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Dietary Recommendations</h3>
        
        {/* Foods to Increase */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Foods to Increase</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {dietRecommendations.foods_to_increase.map((food, index) => (
              <div key={index} className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <h5 className="font-medium text-green-900 dark:text-green-200 mb-2">{food.name}</h5>
                <p className="text-sm text-green-800 dark:text-green-300 mb-2">{food.reason}</p>
                {food.frequency && (
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Frequency: {food.frequency}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Foods to Limit */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Foods to Limit</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {dietRecommendations.foods_to_limit.map((food, index) => (
              <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <h5 className="font-medium text-red-900 dark:text-red-200 mb-2">{food.name}</h5>
                <p className="text-sm text-red-800 dark:text-red-300 mb-2">{food.reason}</p>
                {food.alternative && (
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Try instead: {food.alternative}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meal Plan Suggestions */}
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Meal Plan Suggestions</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {dietRecommendations.meal_plan_suggestions.map((meal, index) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">{meal.meal_type}</h5>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">{meal.description}</p>
                <div className="space-y-1">
                  {meal.benefits.map((benefit, benefitIndex) => (
                    <p key={benefitIndex} className="text-sm text-blue-700 dark:text-blue-400">
                      • {benefit}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Recommendations; 