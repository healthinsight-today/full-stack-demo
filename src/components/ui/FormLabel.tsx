import React from 'react';

export interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  optional?: boolean;
  error?: boolean;
  helpText?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required = false,
  className = '',
  optional = false,
  error = false,
  helpText,
}) => {
  return (
    <div className="mb-[var(--spacing-xs)]">
      <label 
        htmlFor={htmlFor}
        className={`
          block text-[var(--font-size-sm)] font-[var(--font-weight-medium)]
          text-neutral-700 dark:text-neutral-300
          ${error ? 'text-red-600 dark:text-red-400' : ''}
          ${className}
        `}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-600 dark:text-red-400">*</span>
        )}
        {optional && (
          <span className="ml-1 text-neutral-500 dark:text-neutral-400 text-[var(--font-size-xs)] font-[var(--font-weight-normal)]">
            (optional)
          </span>
        )}
      </label>
      {helpText && (
        <p className={`
          mt-1 text-[var(--font-size-xs)]
          ${error ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}
        `}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormLabel; 