import React, { useState } from 'react';
import { FilterOptions, DateRangeOption, ReportTypeOption, SortOption } from '../../types/Filter';
import Dropdown from '../common/Dropdown';
import Card from '../common/Card';

interface ReportFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  className?: string;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  className = '',
}) => {
  // Date range options
  const dateRangeOptions: DateRangeOption[] = [
    { id: 'all', label: 'All Time', value: null },
    { 
      id: 'last-30', 
      label: 'Last 30 Days', 
      value: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      }
    },
    { 
      id: 'last-90', 
      label: 'Last 90 Days', 
      value: {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      }
    },
    { 
      id: 'last-year', 
      label: 'Last Year', 
      value: {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      }
    },
  ];

  // Report type options
  const reportTypeOptions: ReportTypeOption[] = [
    { id: 'all', label: 'All Types', value: '' },
    { id: 'complete', label: 'Complete Blood Panel', value: 'Complete Blood Panel' },
    { id: 'basic', label: 'Basic Metabolic Panel', value: 'Basic Metabolic Panel' },
    { id: 'lipid', label: 'Lipid Panel', value: 'Lipid Panel' },
    { id: 'thyroid', label: 'Thyroid Panel', value: 'Thyroid Panel' },
    { id: 'liver', label: 'Liver Function', value: 'Liver Function' },
    { id: 'kidney', label: 'Kidney Function', value: 'Kidney Function' },
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { id: 'date-desc', label: 'Newest First', value: 'date-desc' },
    { id: 'date-asc', label: 'Oldest First', value: 'date-asc' },
    { id: 'abnormal-desc', label: 'Most Abnormalities', value: 'abnormal-desc' },
    { id: 'abnormal-asc', label: 'Least Abnormalities', value: 'abnormal-asc' },
  ];

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    const selectedOption = dateRangeOptions.find(option => option.id === value);
    onFilterChange({ 
      dateRange: selectedOption?.value || undefined 
    });
  };

  // Handle report type change
  const handleReportTypeChange = (value: string) => {
    onFilterChange({ 
      reportTypes: value ? [value] : undefined 
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    onFilterChange({ 
      sortBy: sortBy as 'date' | 'name' | 'abnormalities',
      sortOrder: sortOrder as 'asc' | 'desc'
    });
  };

  // Handle abnormal only toggle
  const handleAbnormalOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ abnormalOnly: e.target.checked });
  };

  // Get current values
  const getCurrentDateRangeId = (): string => {
    if (!filters?.dateRange) return 'all';
    const matchingOption = dateRangeOptions.find(
      option => option.value && 
      option.value.startDate === filters.dateRange?.startDate &&
      option.value.endDate === filters.dateRange?.endDate
    );
    return matchingOption?.id || 'all';
  };

  const getCurrentReportType = (): string => {
    return filters?.reportTypes && filters.reportTypes.length > 0 
      ? filters.reportTypes[0] 
      : '';
  };

  const getCurrentSortId = (): string => {
    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'desc';
    return `${sortBy}-${sortOrder}`;
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Dropdown
              label="Date Range"
              items={dateRangeOptions.map(option => ({
                label: option.label,
                value: option.id,
              }))}
              value={getCurrentDateRangeId()}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div>
            <Dropdown
              label="Report Type"
              items={reportTypeOptions.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              value={getCurrentReportType()}
              onChange={handleReportTypeChange}
            />
          </div>
          
          <div>
            <Dropdown
              label="Sort By"
              items={sortOptions.map(option => ({
                label: option.label,
                value: option.id,
              }))}
              value={getCurrentSortId()}
              onChange={handleSortChange}
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary rounded border-neutral-300 dark:border-neutral-700 focus:ring-primary"
                checked={filters?.abnormalOnly || false}
                onChange={handleAbnormalOnlyChange}
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Show only reports with abnormalities
              </span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
