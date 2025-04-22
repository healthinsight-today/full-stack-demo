export interface FilterOptions {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    reportTypes?: string[];
    abnormalOnly?: boolean;
    searchTerm?: string;
    sortBy?: 'date' | 'name' | 'abnormalities';
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface SortOption {
    id: string;
    label: string;
    value: string;
  }
  
  export interface DateRangeOption {
    id: string;
    label: string;
    value: {
      startDate: string;
      endDate: string;
    } | null;
  }
  
  export interface ReportTypeOption {
    id: string;
    label: string;
    value: string;
  }
  
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  