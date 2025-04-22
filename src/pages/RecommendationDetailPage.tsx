import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportsContext';
import PageContainer from '../components/layout/PageContainer';
import RecommendationDetail from '../components/recommendations/RecommendationDetail';
import Button from '../components/common/Button';
import { Recommendation } from '../types/Recommendation';

const RecommendationDetailPage: React.FC = () => {
  const { recommendationId } = useParams<{ recommendationId: string }>();
  const { recommendations, isLoading, error } = useReports();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [relatedRecommendations, setRelatedRecommendations] = useState<Recommendation[]>([]);
  const navigate = useNavigate();

  // Fetch recommendation data
  useEffect(() => {
    if (recommendationId && recommendations.length > 0) {
      const currentRecommendation = recommendations.find(r => r.id === recommendationId);
      if (currentRecommendation) {
        setRecommendation(currentRecommendation);
        
        // Find related recommendations (same category or related parameters)
        const related = recommendations.filter((r: Recommendation) => 
          r.id !== recommendationId && (
            r.category === currentRecommendation.category ||
            (r.related_parameters && currentRecommendation.related_parameters && 
             r.related_parameters.some((param: string) => currentRecommendation.related_parameters?.includes(param)))
          )
        );
        setRelatedRecommendations(related.slice(0, 3)); // Limit to 3 related recommendations
      }
    }
  }, [recommendationId, recommendations]);

  // Handle back to recommendations
  const handleBackToRecommendations = () => {
    navigate('/recommendations');
  };

  // Handle view related recommendation
  const handleViewRelatedRecommendation = (relatedRecommendationId: string) => {
    navigate(`/recommendations/${relatedRecommendationId}`);
  };

  return (
    <PageContainer
      title={recommendation ? recommendation.title : 'Recommendation Details'}
      description={recommendation ? `${recommendation.category || 'Health'} • ${recommendation.priority || 'Medium'} Priority` : 'Loading recommendation details...'}
      isLoading={isLoading}
      error={error}
      actions={
        <Button
          variant="outline"
          onClick={handleBackToRecommendations}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          }
        >
          Back to Recommendations
        </Button>
      }
    >
      {recommendation ? (
        <RecommendationDetail
          recommendation={recommendation}
          relatedRecommendations={relatedRecommendations}
          onViewRelatedRecommendation={handleViewRelatedRecommendation}
        />
      ) : !isLoading && !error ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">Recommendation Not Found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The recommendation you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="primary"
            onClick={handleBackToRecommendations}
          >
            Go to Recommendations
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
};

export default RecommendationDetailPage;
