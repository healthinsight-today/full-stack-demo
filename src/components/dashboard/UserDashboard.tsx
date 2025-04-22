import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useReports } from '../../context/ReportsContext';

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const { reports } = useReports();
  
  // Get the most recent reports (up to 3)
  const recentReports = reports?.slice(0, 3) || [];
  
  if (!user) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-gray-600">Please login to view your dashboard</h3>
      </div>
    );
  }

  // Check if profile is empty
  const isNewProfile = !user.profile.age && !user.profile.gender && !user.profile.blood_group;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-indigo-50 dark:bg-indigo-900 border-b border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-col md:flex-row items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold mr-4">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/upload" 
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Upload New Report
            </Link>
            <Link 
              to="/settings" 
              className="py-2 px-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white text-sm font-medium rounded-lg transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {isNewProfile ? (
          <div className="mb-6 text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Welcome to HealthInsight!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Complete your profile to get personalized health insights</p>
            <Link 
              to="/settings" 
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Complete Your Profile
            </Link>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Health Summary</h3>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Age</p>
                <p className="text-xl font-semibold">{user.profile.age || '--'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                <p className="text-xl font-semibold">{user.profile.gender || '--'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Blood Group</p>
                <p className="text-xl font-semibold">{user.profile.blood_group || '--'}</p>
              </div>
            </div>
          </>
        )}
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Reports</h3>
            {recentReports.length > 0 && (
              <Link to="/reports" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </Link>
            )}
          </div>
          
          {recentReports.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recentReports.map((report) => (
                <div key={report.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{report.report_info.lab_name || 'Lab Report'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.report_info.report_date).toLocaleDateString()} ({report.abnormal_parameters?.length || 0} abnormal results)
                      </p>
                    </div>
                    <Link 
                      to={`/reports/${report.id}`}
                      className="py-1 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium rounded-md transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">No Reports Yet</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first lab report to get started with health tracking</p>
              <Link 
                to="/upload" 
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upload Your First Report
              </Link>
            </div>
          )}
        </div>
        
        {user.profile.health_conditions && user.profile.health_conditions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Health Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {user.profile.health_conditions.map((condition, index) => (
                <span key={index} className="py-1 px-3 bg-red-100 text-red-700 text-sm rounded-full">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/upload" 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h4 className="font-medium mb-1">Upload Report</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload and analyze your lab reports</p>
            </Link>
            
            <Link 
              to="/settings" 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h4 className="font-medium mb-1">Profile Settings</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
            </Link>
            
            <Link 
              to="/help" 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h4 className="font-medium mb-1">Help & Support</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Learn how to use HealthInsight</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 