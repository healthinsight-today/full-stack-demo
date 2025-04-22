import React, { useState } from 'react';
import { Parameter } from '../../types/Report';

interface ParametersTableProps {
  parameters: Parameter[];
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'name' | 'value' | 'category' | null;

// Define custom icon components
const SearchIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SortIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const SortUpIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SortDownIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ParametersTable: React.FC<ParametersTableProps> = ({ parameters, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort function
  const getSortedParameters = () => {
    if (!sortField || !sortDirection) return parameters;

    return [...parameters].sort((a, b) => {
      let aValue, bValue;

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'value') {
        aValue = typeof a.value === 'number' ? a.value : parseFloat(a.value as string) || 0;
        bValue = typeof b.value === 'number' ? b.value : parseFloat(b.value as string) || 0;
      } else if (sortField === 'category') {
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
      } else {
        return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter function
  const getFilteredParameters = () => {
    const sorted = getSortedParameters();
    if (!searchTerm) return sorted;

    const term = searchTerm.toLowerCase();
    return sorted.filter(param => 
      param.name.toLowerCase().includes(term) || 
      param.category.toLowerCase().includes(term) ||
      (param.value + '').toLowerCase().includes(term)
    );
  };

  // Get the sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <SortIcon className="text-gray-400" />;
    if (sortDirection === 'asc') return <SortUpIcon className="text-blue-600" />;
    if (sortDirection === 'desc') return <SortDownIcon className="text-blue-600" />;
    return <SortIcon className="text-gray-400" />;
  };

  const filteredParams = getFilteredParameters();

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">All Parameters</h2>
        <p className="text-gray-600">Complete listing of all test parameters</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search parameters..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Parameter
                  <span className="ml-1">{getSortIcon('name')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  <span className="ml-1">{getSortIcon('category')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center">
                  Value
                  <span className="ml-1">{getSortIcon('value')}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reference Range
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredParams.length > 0 ? (
              filteredParams.map((param) => {
                const isAboveNormal = param.reference_max !== null && param.reference_max !== undefined && param.value > param.reference_max;
                const isBelowNormal = param.reference_min !== null && param.reference_min !== undefined && param.value < param.reference_min;
                
                return (
                  <tr key={param.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {param.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {param.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {param.value} {param.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {param.reference_range}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAboveNormal ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          High
                        </span>
                      ) : isBelowNormal ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No parameters found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredParams.length} of {parameters.length} parameters
      </div>
    </div>
  );
};

export default ParametersTable; 