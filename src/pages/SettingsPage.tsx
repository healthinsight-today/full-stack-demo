import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { PrivacySettings } from '../types/User';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(user?.settings?.notification_preferences?.report_ready || false);
  const [dataSharing, setDataSharing] = useState(user?.settings?.privacy_settings?.share_data_with_doctors || false);
  const [units, setUnits] = useState(user?.settings?.preferred_units || 'metric');
  
  // Handle save profile
  const handleSaveProfile = () => {
    if (updateUser && user) {
      // Get the existing privacy settings or create defaults
      const existingPrivacySettings: PrivacySettings = user.settings.privacy_settings || {
        share_data_with_doctors: false,
        allow_anonymous_research: false,
        store_history: false
      };
      
      updateUser({
        ...user,
        name,
        email,
        settings: {
          ...user.settings,
          notification_preferences: {
            ...user.settings.notification_preferences,
            report_ready: notifications
          },
          privacy_settings: {
            // Make sure all required properties are present
            share_data_with_doctors: dataSharing,
            allow_anonymous_research: existingPrivacySettings.allow_anonymous_research,
            store_history: existingPrivacySettings.store_history
          },
          preferred_units: units as 'metric' | 'imperial'
        }
      });
    }
  };
  
  return (
    <PageContainer
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Settings */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Profile Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input w-full"
                  placeholder="Your email address"
                />
              </div>
              
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Preferences */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-neutral-800 dark:text-white">
                    Dark Mode
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-theme"
                    className="absolute w-0 h-0 opacity-0"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <label
                    htmlFor="toggle-theme"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                      theme === 'dark' ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-neutral-800 dark:text-white">
                    Notifications
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive notifications about new insights
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-notifications"
                    className="absolute w-0 h-0 opacity-0"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <label
                    htmlFor="toggle-notifications"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                      notifications ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        notifications ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-neutral-800 dark:text-white">
                    Data Sharing
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Share anonymized data to improve recommendations
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-data-sharing"
                    className="absolute w-0 h-0 opacity-0"
                    checked={dataSharing}
                    onChange={() => setDataSharing(!dataSharing)}
                  />
                  <label
                    htmlFor="toggle-data-sharing"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                      dataSharing ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        dataSharing ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-neutral-800 dark:text-white mb-2">
                  Measurement Units
                </h4>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      name="units"
                      value="metric"
                      checked={units === 'metric'}
                      onChange={() => setUnits('metric')}
                    />
                    <span className="ml-2 text-neutral-700 dark:text-neutral-300">Metric</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      name="units"
                      value="imperial"
                      checked={units === 'imperial'}
                      onChange={() => setUnits('imperial')}
                    />
                    <span className="ml-2 text-neutral-700 dark:text-neutral-300">Imperial</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Account Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Account Actions
            </h3>
            
            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/login')}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                  }
                >
                  Sign Out
                </Button>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  fullWidth
                  className="text-error border-error hover:bg-error hover:bg-opacity-10"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                      navigate('/login');
                    }
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  }
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
