import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { XMarkIcon as XIcon, Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, isAuthenticated, logout } = useUser();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 shadow-sm z-40">
      <div className="h-full px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-full">
          {/* Logo and mobile menu button */}
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
              <span className="text-lg sm:text-xl font-bold">
                <span className="text-primary dark:text-white">HealthInsight</span>
                <span className="text-neutral-800 dark:text-neutral-200">Today</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/reports" className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary-light rounded-md transition-colors">
              Reports
            </Link>
            <Link to="/insights" className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary-light rounded-md transition-colors">
              Insights
            </Link>
            <Link to="/recommendations" className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary-light rounded-md transition-colors">
              Recommendations
            </Link>
            <Link to="/history" className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary-light rounded-md transition-colors">
              History
            </Link>
          </nav>

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button 
              onClick={handleThemeToggle}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Profile or Login Button */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                  aria-label="User menu"
                  aria-expanded={profileMenuOpen}
                  onClick={toggleProfileMenu}
                >
                  <img 
                    src={user?.profile?.avatar || "/assets/images/default-profile.svg"} 
                    alt="User profile" 
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/default-profile.svg';
                    }}
                  />
                  <span className="ml-2 text-neutral-700 dark:text-neutral-200 hidden md:block">{user?.name || 'John Doe'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-neutral-500 hidden md:block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                Sign in
              </Link>
            )}

            {/* Mobile top nav menu button (not sidebar) */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10" onClick={toggleMobileMenu}>
          <div 
            className="fixed top-16 inset-x-0 bg-white dark:bg-neutral-800 shadow-lg z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-1 px-2 pt-2 pb-3">
              <Link 
                to="/reports" 
                className="px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/insights" 
                className="px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Insights
              </Link>
              <Link 
                to="/recommendations" 
                className="px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recommendations
              </Link>
              <Link 
                to="/history" 
                className="px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link 
                to="/settings" 
                className="px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
