import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  tabActiveClassName?: string;
  tabPanelClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  onChange,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  tabActiveClassName = '',
  tabPanelClassName = '',
}) => {
  const defaultTab = defaultActiveTab || (tabs.length > 0 ? tabs[0].id : '');
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      onChange?.(tabId);
    }
  };

  // Find the active tab content
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab list */}
      <div 
        className={`flex border-b border-neutral-200 dark:border-neutral-700 ${tabListClassName}`}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled;
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.id}`}
              id={`tab-${tab.id}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleTabClick(tab.id)}
              className={`
                relative py-[var(--spacing-md)] px-[var(--spacing-lg)] 
                text-[var(--font-size-md)] font-[var(--font-weight-medium)]
                focus:outline-none focus:ring-2 ring-offset-2 ring-brand-purple
                transition-colors
                ${isActive 
                  ? `text-brand-purple dark:text-brand-purple-light ${tabActiveClassName}` 
                  : `text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white`
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${tabClassName}
              `}
            >
              {tab.label}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple dark:bg-brand-purple-light"></span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Tab panel */}
      <div 
        className={`pt-[var(--spacing-lg)] ${tabPanelClassName}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        id={`tab-panel-${activeTab}`}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs; 