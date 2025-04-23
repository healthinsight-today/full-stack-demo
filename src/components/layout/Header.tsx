import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  BellIcon, 
  XMarkIcon as XIcon, 
  Bars3Icon as MenuIcon 
} from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, isAuthenticated, logout } = useUser();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-[var(--z-index-header)]">
      <div className="h-full px-4 flex justify-between items-center">
        {/* Left: Logo and mobile menu button */}
        <div className="flex items-center gap-2">
          {/* Mobile sidebar toggle */}
          <button 
            className="md:hidden p-2 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-lg font-bold text-brand-purple">
              HealthInsightToday
            </span>
          </Link>
        </div>

        {/* Right: User Controls */}
        <div className="flex items-center">
          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative mr-2" ref={notificationsRef}>
              <button
                className="p-2 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none relative"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-md shadow-md py-1 z-[var(--z-index-dropdown)]">
                  <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-md font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200">New insights available for your latest report</p>
                      <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                    </div>
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200">Your lab results have been analyzed</p>
                      <p className="text-xs text-neutral-500 mt-1">Yesterday</p>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200">Weekly health summary updated</p>
                      <p className="text-xs text-neutral-500 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Badge */}
          {isAuthenticated ? (
            <div className="flex items-center" ref={profileMenuRef}>
              <div className="flex items-center">
                <div className="mr-1 text-right">
                  <div className="text-sm text-right font-bold">
                    {user?.initials || 'JS'}
                  </div>
                  <div className="text-xs">
                    {user?.name || 'John Smith'}
                  </div>
                </div>
                <button 
                  className="h-8 w-8 flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 rounded-md text-neutral-800 font-medium"
                  onClick={toggleProfileMenu}
                >
                  {user?.initials || 'JS'}
                </button>
              </div>
              
              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-16 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-md py-1 z-[var(--z-index-dropdown)]">
                  <Link 
                    to="/profile" 
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link 
                    to="/logout"
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 text-sm bg-brand-purple text-white rounded-md hover:bg-brand-purple-dark transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
