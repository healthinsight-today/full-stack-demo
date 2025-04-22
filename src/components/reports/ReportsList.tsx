import React, { useState, useEffect } from 'react';
import { useReports } from '../../context/ReportsContext';
import { FilterOptions } from '../../types/Filter';
import ReportCard from './ReportCard';
import ReportFilters from './ReportFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface ReportsListProps {
  className?: string;
}

const ReportsList: React.FC<ReportsListProps> = ({ className = '' }) => {
  const { reports, isLoading, error, filterOptions, setFilterOptions, fetchReports } = useReports();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reportsPerPage] = useState<number>(6);
  const navigate = useNavigate();

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilterOptions({ ...(filterOptions || {}), searchTerm });
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions({ ...(filterOptions || {}), ...newFilters });
    setCurrentPage(1);
  };

  // Handle report click
  const handleReportClick = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  // Refresh reports
  const handleRefresh = () => {
    fetchReports();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchBar
          placeholder="Search reports..."
          value={filterOptions?.searchTerm || ''}
          onChange={handleSearch}
          className="w-full md:w-64"
        />
      </div>
      
      <ReportFilters
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        className="mb-6"
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      ) : error ? (
        <ErrorMessage
          message={error}
          title="Error loading reports"
          onRetry={handleRefresh}
        />
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">No Reports Found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {filterOptions.searchTerm || filterOptions.dateRange || filterOptions.reportTypes
              ? "No reports match your current filters. Try adjusting your search criteria."
              : "You haven't uploaded any reports yet. Upload your first report to get started."}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/upload')}
          >
            Upload Your First Report
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleReportClick(report.id)}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReportsList;
