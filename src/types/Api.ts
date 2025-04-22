/**
 * Generic API Response interface for consistent error handling and type safety
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    status: number;
  }
  
  /**
   * Pagination data received from API responses
   */
  export interface PaginationData {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  }
  
  /**
   * Paginated response wrapper
   */
  export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationData;
  }
  
  export interface ApiPaginatedResponse<T> extends ApiResponse<PaginatedResponse<T>> {}
  
  export interface UploadResponse {
    report_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
  }
  
  /**
   * Upload progress event
   */
  export interface UploadProgressEvent {
    loaded: number;
    total: number;
    percentage: number;
  }
  
  /**
   * File upload response
   */
  export interface FileUploadResponse {
    file_id: string;
    original_filename: string;
    mime_type: string;
    size: number;
    url?: string;
  }
  
  export interface ApiError {
    status: number;
    message: string;
    details?: string;
  }
  