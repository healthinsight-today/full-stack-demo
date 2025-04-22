import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import UploadReport from '../components/dashboard/UploadReport';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

const ReportUploadPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useUser();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <PageContainer 
      title="Upload Report" 
      description="Upload and process your lab test reports"
    >
      <div className="max-w-3xl mx-auto">
        <UploadReport />
      </div>
    </PageContainer>
  );
};

export default ReportUploadPage;
