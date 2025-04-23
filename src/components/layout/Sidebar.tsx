import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  LightBulbIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  CakeIcon
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
      name: 'Reports',
      path: '/reports',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      name: 'Specialists',
      path: '/specialists',
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: <LightBulbIcon className="h-5 w-5" />,
    },
    {
      name: 'Diet',
      path: '/diet',
      icon: <CakeIcon className="h-5 w-5" />,
    },
    {
      name: 'Shopping',
      path: '/shopping',
      icon: <ShoppingCartIcon className="h-5 w-5" />,
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-[var(--z-index-sidebar)] h-full w-[var(--sidebar-width)] bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transform transition-transform duration-200 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      style={{ paddingTop: "var(--header-height)" }}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 py-[var(--spacing-md)] overflow-y-auto">
          <ul className="space-y-1">
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
                    `flex items-center px-4 py-3 transition-colors ${
                      isActive 
                        ? 'bg-brand-purple text-white' 
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`
                  }
                  end={item.path === '/dashboard'}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="text-[var(--font-size-md)]">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Help Section */}
        <div className="mt-auto">
          <NavLink 
            to="/help"
            className="flex items-center gap-3 text-neutral-700 dark:text-neutral-200 hover:text-brand-purple dark:hover:text-brand-purple-light p-4"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span className="text-[var(--font-size-md)]">Help</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
