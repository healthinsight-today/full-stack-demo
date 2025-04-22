import React from 'react';
import Card from '../common/Card';
import { Recommendation } from '../../types/Recommendation';

interface RecommendationsListProps {
  recommendations?: Recommendation[];
  isLoading?: boolean;
  error?: string;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations = [],
  isLoading = false,
  error,
  onRecommendationClick
}) => {
  if (isLoading) {
    return <div className="py-8 text-center">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600 dark:text-red-400">Error loading recommendations: {error}</div>;
  }

  if (recommendations.length === 0) {
    return <div className="py-8 text-center">No recommendations available.</div>;
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card 
          key={recommendation.id} 
          className={onRecommendationClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
          onClick={onRecommendationClick ? () => onRecommendationClick(recommendation) : undefined}
        >
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="mb-3 sm:mb-0 sm:flex-1">
                <h3 className="font-medium text-lg mb-1 line-clamp-2">{recommendation.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">{recommendation.short_description}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {recommendation.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {recommendation.priority}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RecommendationsList; 