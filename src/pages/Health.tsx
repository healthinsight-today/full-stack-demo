import React from 'react';
import Tabs from '../components/common/Tabs';
import { HealthRecommendations } from '../components/recommendations';
import { useState, useEffect } from 'react';

const Health = () => {
  const [latestReportId, setLatestReportId] = useState('latest');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulating fetching the latest report ID
  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, just using a placeholder value
    setLatestReportId('latest');
  }, []);
  
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Health Summary</h2>
            <p>Your health data overview will appear here.</p>
          </div>
        </div>
      )
    },
    {
      id: 'insights',
      label: 'Insights',
      content: (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Insights</h2>
          <p>Your personalized health insights will appear here.</p>
        </div>
      )
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      content: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
          
          <div className="grid grid-cols-1 gap-8">
            <div>
              <HealthRecommendations reportId={latestReportId} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      content: (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Reports</h2>
          <p>Your health reports history will appear here.</p>
        </div>
      )
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Health Dashboard</h1>
      
      <Tabs tabs={tabs} defaultTabId={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Health; 