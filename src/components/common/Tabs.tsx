import React, { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string | ReactNode;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'custom';
  className?: string;
  tabsContainerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  onChange,
  variant = 'default',
  className = '',
  tabsContainerClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  contentClassName = '',
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  // Variant-specific classes
  const getTabClasses = (tab: Tab) => {
    const isActive = tab.id === activeTabId;
    const isDisabled = tab.disabled;
    
    // Return custom classes when using the 'custom' variant
    if (variant === 'custom') {
      if (isDisabled) {
        return 'cursor-not-allowed opacity-50';
      }
      return isActive 
        ? `${tabClassName} ${activeTabClassName}` 
        : tabClassName;
    }
    
    const baseClasses = 'flex items-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary';
    
    if (isDisabled) {
      return `${baseClasses} cursor-not-allowed text-neutral-400 dark:text-neutral-500`;
    }
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-full ${
          isActive 
            ? 'bg-primary text-white' 
            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive 
            ? 'border-primary text-primary' 
            : 'border-transparent text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
        }`;
      default: // default variant
        return `${baseClasses} rounded-t-lg ${
          isActive 
            ? 'bg-white dark:bg-neutral-800 border-t border-l border-r border-neutral-200 dark:border-neutral-700 text-primary' 
            : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white'
        }`;
    }
  };

  // Get container classes based on variant
  const getContainerClasses = () => {
    if (variant === 'custom') {
      return tabsContainerClassName;
    }
    
    return `flex overflow-x-auto ${variant === 'underline' ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`;
  };

  // Find active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className={className}>
      {/* Tab navigation */}
      <div className={getContainerClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getTabClasses(tab)}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTabId}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div 
        className={contentClassName || 'mt-4'}
        role="tabpanel"
        aria-labelledby={`tab-${activeTabId}`}
        id={`tabpanel-${activeTabId}`}
      >
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;
