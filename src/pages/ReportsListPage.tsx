import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import ReportsList from '../components/dashboard/ReportsList';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

const ReportsListPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useUser();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <PageContainer 
      title="Lab Reports" 
      description="View and manage your lab reports"
    >
      <div className="space-y-6">
        <ReportsList />
      </div>
    </PageContainer>
  );
};

export default ReportsListPage;
