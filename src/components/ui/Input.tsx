import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  helperClassName = '',
  wrapperClassName = '',
  disabled,
  required,
  ...props
}, ref) => {
  // Container styles
  const containerStyles = `
    ${fullWidth ? 'w-full' : ''}
    ${containerClassName}
  `;
  
  // Label styles
  const labelStyles = `
    block text-sm font-medium text-gray-700 mb-1
    ${disabled ? 'opacity-60' : ''}
    ${labelClassName}
  `;
  
  // Input wrapper styles (for icons)
  const wrapperStyles = `
    relative rounded-md shadow-sm
    ${wrapperClassName}
  `;
  
  // Input styles
  const baseInputStyles = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'bg-gray-100 opacity-75 cursor-not-allowed' : ''}
    ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${inputClassName}
    ${className}
  `;
  
  // Helper text styles
  const helperStyles = `
    mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}
    ${helperClassName}
  `;
  
  return (
    <div className={containerStyles}>
      {label && (
        <label htmlFor={props.id} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={wrapperStyles}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={baseInputStyles}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText || error ? `${props.id}-description` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p id={`${props.id}-description`} className={helperStyles}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 