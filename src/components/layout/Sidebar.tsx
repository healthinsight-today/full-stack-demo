import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  LightBulbIcon, 
  ScaleIcon, 
  ClockIcon, 
  Cog6ToothIcon,
  InformationCircleIcon,
  PhoneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  // Navigation items with icons
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      name: 'Upload Report',
      path: '/upload',
      icon: <ArrowUpTrayIcon className="h-5 w-5" />,
    },
    {
      name: 'My Reports',
      path: '/reports',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: <LightBulbIcon className="h-5 w-5" />,
    },
    {
      name: 'Recommendations',
      path: '/recommendations',
      icon: <ScaleIcon className="h-5 w-5" />,
    },
    {
      name: 'History',
      path: '/history',
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Cog6ToothIcon className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Sidebar component */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 md:w-64 bg-white dark:bg-neutral-800 shadow-lg transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 overflow-y-auto`}
        style={{ paddingTop: "64px" }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-2 md:hidden">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-2">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        toggleSidebar();
                      }
                    }}
                    className={({ isActive }) => 
                      `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`
                    }
                    end={item.path === '/dashboard'}
                  >
                    <span className="mr-2.5">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Sidebar footer - Help section */}
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              <span>Need help?</span>
            </div>
            <a 
              href="/help"
              className="flex items-center text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
