import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
  showPrevNextButtons?: boolean;
  showFirstLastButtons?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  prevLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  firstLabel?: React.ReactNode;
  lastLabel?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageRangeDisplayed = 3,
  marginPagesDisplayed = 1,
  showPrevNextButtons = true,
  showFirstLastButtons = true,
  size = 'md',
  className = '',
  ariaLabel = 'Pagination',
  prevLabel = '←',
  nextLabel = '→',
  firstLabel = '«',
  lastLabel = '»',
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  
  // Generate page numbers
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Add first pages
    for (let i = 1; i <= Math.min(marginPagesDisplayed, totalPages); i++) {
      pages.push(i);
    }
    
    // Calculate range around current page
    const startPage = Math.max(
      marginPagesDisplayed + 1,
      currentPage - Math.floor(pageRangeDisplayed / 2)
    );
    const endPage = Math.min(
      totalPages - marginPagesDisplayed,
      currentPage + Math.floor(pageRangeDisplayed / 2)
    );
    
    // Add ellipsis if needed before range
    if (startPage > marginPagesDisplayed + 1) {
      pages.push('ellipsis');
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if needed after range
    if (endPage < totalPages - marginPagesDisplayed) {
      pages.push('ellipsis');
    }
    
    // Add last pages
    for (let i = Math.max(totalPages - marginPagesDisplayed + 1, endPage + 1); i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Button base class
  const buttonBaseClass = `
    inline-flex items-center justify-center
    ${sizeClasses[size]}
    leading-tight rounded-md border border-gray-300 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors
  `;
  
  // Active button class
  const activeButtonClass = `
    ${buttonBaseClass}
    border-blue-500 bg-blue-50 text-blue-600 
    hover:bg-blue-100 hover:text-blue-700
  `;
  
  // Inactive button class
  const inactiveButtonClass = `
    ${buttonBaseClass}
    bg-white text-gray-700
    hover:bg-gray-50 hover:text-gray-900
  `;
  
  // Disabled button class
  const disabledButtonClass = `
    ${buttonBaseClass}
    bg-gray-100 text-gray-400 cursor-not-allowed
  `;
  
  // Ellipsis button class
  const ellipsisButtonClass = `
    inline-flex items-center justify-center
    ${sizeClasses[size]}
    border-none bg-transparent text-gray-500
  `;
  
  return (
    <nav
      className={`flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
    >
      <ul className="inline-flex items-center space-x-1">
        {/* First page button */}
        {showFirstLastButtons && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={currentPage === 1 ? disabledButtonClass : inactiveButtonClass}
              aria-label="Go to first page"
            >
              {firstLabel}
            </button>
          </li>
        )}
        
        {/* Previous page button */}
        {showPrevNextButtons && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={currentPage === 1 ? disabledButtonClass : inactiveButtonClass}
              aria-label="Go to previous page"
            >
              {prevLabel}
            </button>
          </li>
        )}
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <li key={`ellipsis-${index}`}>
                <span className={ellipsisButtonClass}>…</span>
              </li>
            );
          }
          
          return (
            <li key={page}>
              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={currentPage === page ? activeButtonClass : inactiveButtonClass}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}
        
        {/* Next page button */}
        {showPrevNextButtons && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}
              aria-label="Go to next page"
            >
              {nextLabel}
            </button>
          </li>
        )}
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}
              aria-label="Go to last page"
            >
              {lastLabel}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination; 