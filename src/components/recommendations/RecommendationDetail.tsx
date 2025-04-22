import React from 'react';
import { Recommendation } from '../../types/Recommendation';

interface RecommendationDetailProps {
  recommendation?: Recommendation;
  relatedRecommendations?: Recommendation[];
  isLoading?: boolean;
  error?: string;
  onViewRelatedRecommendation?: (relatedRecommendationId: string) => void;
}

const RecommendationDetail: React.FC<RecommendationDetailProps> = ({
  recommendation,
  relatedRecommendations = [],
  isLoading = false,
  error,
  onViewRelatedRecommendation
}) => {
  if (isLoading) {
    return <div className="py-8 text-center">Loading recommendation details...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600 dark:text-red-400">Error loading recommendation: {error}</div>;
  }

  if (!recommendation) {
    return <div className="py-8 text-center">Recommendation not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{recommendation.title}</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{recommendation.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {recommendation.category}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            {recommendation.priority} Priority
          </span>
        </div>
        
        {recommendation.steps && recommendation.steps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Action Steps</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recommendation.steps.map((step: string, index: number) => (
                <li key={index} className="text-neutral-700 dark:text-neutral-300">{step}</li>
              ))}
            </ul>
          </div>
        )}
        
        {recommendation.benefits && recommendation.benefits.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recommendation.benefits.map((benefit: string, index: number) => (
                <li key={index} className="text-neutral-700 dark:text-neutral-300">{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related recommendations section */}
      {relatedRecommendations.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 sm:p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Related Recommendations</h3>
          <div className="space-y-3">
            {relatedRecommendations.map(related => (
              <div 
                key={related.id}
                className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => onViewRelatedRecommendation && onViewRelatedRecommendation(related.id)}
              >
                <h4 className="font-medium">{related.title}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{related.short_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationDetail; 