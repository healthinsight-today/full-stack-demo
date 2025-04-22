import React from 'react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find selected item
  const selectedItem = items.find(item => item.value === value);

  // Handle item selection
  const handleSelect = (item: DropdownItem) => {
    if (!item.disabled) {
      onChange(item.value);
      setIsOpen(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        className={`
          relative w-full bg-white dark:bg-neutral-800 border rounded-md shadow-sm pl-3 pr-10 py-2 text-left 
          focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
          ${disabled ? 'bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-error' : 'border-neutral-300 dark:border-neutral-600'}
          ${buttonClassName}
        `}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="flex items-center">
          {selectedItem?.icon && <span className="mr-2">{selectedItem.icon}</span>}
          <span className={`block truncate ${!selectedItem ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}

      {isOpen && (
        <div 
          className={`absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${menuClassName}`}
          role="listbox"
        >
          {items.map((item) => (
            <div
              key={item.value}
              className={`
                ${item.value === value ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-900 dark:text-white'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700'}
                relative py-2 pl-3 pr-9
              `}
              onClick={() => !item.disabled && handleSelect(item)}
              role="option"
              aria-selected={item.value === value}
            >
              <div className="flex items-center">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span className={`block truncate ${item.value === value ? 'font-medium' : 'font-normal'}`}>
                  {item.label}
                </span>
              </div>

              {item.value === value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
