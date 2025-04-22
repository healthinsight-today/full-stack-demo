import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  debounceTime?: number;
  clearable?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  className = '',
  autoFocus = false,
  debounceTime = 300,
  clearable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceTime);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      onChange(searchTerm);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <form 
      className={`relative ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-5 h-5 text-neutral-500 dark:text-neutral-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="search"
          className="w-full p-2 pl-10 pr-10 text-sm text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 rounded-md border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          autoFocus={autoFocus}
          aria-label={placeholder}
        />
        
        {clearable && searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-10 flex items-center pr-2"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg 
              className="w-5 h-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        )}
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label="Submit search"
        >
          <svg 
            className="w-5 h-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
