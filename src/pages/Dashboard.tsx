import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import UserDashboard from '../components/dashboard/UserDashboard';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useUser();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <PageContainer 
      title="Dashboard" 
      description="View your health summary and recent lab reports"
    >
      <div className="space-y-6">
        <UserDashboard />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
