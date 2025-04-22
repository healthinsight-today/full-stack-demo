import React from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

const InsightDetailPage: React.FC = () => {
  const { insightId } = useParams<{ insightId: string }>();

  return (
    <PageContainer
      title="Insight Details"
      description={`Details for insight ${insightId}`}
    >
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Insight ID: {insightId}</h2>
        <p>Detailed insight information will be displayed here.</p>
      </div>
    </PageContainer>
  );
};

export default InsightDetailPage; 