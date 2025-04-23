import React from 'react';
import Badge from './Badge';

export interface TableColumn<T> {
  key: string;
  title: React.ReactNode;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: React.ReactNode;
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'No data',
  rowKey = 'id',
  onRowClick,
  className = '',
  bordered = false,
  striped = false,
  hoverable = true,
  compact = false,
  sortColumn,
  sortDirection = 'asc',
  onSort,
}: TableProps<T>) {
  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };
  
  // Handle sort click
  const handleSortClick = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = 
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(column.key, newDirection);
  };
  
  // Base styles
  const tableClasses = `
    min-w-full divide-y divide-gray-200
    ${bordered ? 'border border-gray-200' : ''}
    ${className}
  `;
  
  // Row styles
  const getRowClasses = (index: number) => `
    ${striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
    ${hoverable ? 'hover:bg-gray-100' : ''}
    ${onRowClick ? 'cursor-pointer' : ''}
    ${compact ? 'h-9' : ''}
    transition-colors
  `;
  
  // Cell content
  const getCellContent = (column: TableColumn<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(
        column.dataIndex ? record[column.dataIndex] : record,
        record,
        index
      );
    }
    
    if (column.dataIndex) {
      return record[column.dataIndex];
    }
    
    return null;
  };
  
  // Sort icon
  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    const isCurrentSortColumn = sortColumn === column.key;
    
    return (
      <span className="ml-1 inline-flex flex-col">
        <svg 
          className={`h-2 w-2 ${isCurrentSortColumn && sortDirection === 'asc' ? 'text-gray-900' : 'text-gray-400'}`} 
          viewBox="0 0 16 16"
        >
          <path fillRule="evenodd" d="M8 4l4 4H4l4-4z" />
        </svg>
        <svg 
          className={`h-2 w-2 ${isCurrentSortColumn && sortDirection === 'desc' ? 'text-gray-900' : 'text-gray-400'}`} 
          viewBox="0 0 16 16"
        >
          <path fillRule="evenodd" d="M8 12l4-4H4l4 4z" />
        </svg>
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="min-w-full animate-pulse">
        <div className="h-10 bg-gray-200 rounded-t"></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={`h-12 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}></div>
        ))}
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
        {emptyText}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto rounded-md">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer select-none' : ''}
                  ${column.headerClassName || ''}
                `}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSortClick(column)}
              >
                <div className="flex items-center">
                  {column.title}
                  {column.sortable && renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr
              key={getRowKey(record, index)}
              className={getRowClasses(index)}
              onClick={() => onRowClick && onRowClick(record, index)}
            >
              {columns.map((column) => (
                <td
                  key={`${getRowKey(record, index)}-${column.key}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                >
                  {getCellContent(column, record, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface StatusCellProps {
  status: string;
  statusMap?: Record<string, {
    label: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  }>;
}

export const StatusCell: React.FC<StatusCellProps> = ({ 
  status,
  statusMap = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'secondary' },
    pending: { label: 'Pending', variant: 'warning' },
    error: { label: 'Error', variant: 'danger' },
    completed: { label: 'Completed', variant: 'success' },
    processing: { label: 'Processing', variant: 'info' },
  }
}) => {
  const statusConfig = statusMap[status.toLowerCase()] || { 
    label: status, 
    variant: 'neutral' 
  };
  
  return (
    <Badge variant={statusConfig.variant} size="sm" pill>
      {statusConfig.label}
    </Badge>
  );
};

export default Table; 