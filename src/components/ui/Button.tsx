import React from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'outline' 
  | 'text';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  leftIcon,
  rightIcon,
}) => {
  // Base classes always applied
  const baseClasses = `
    inline-flex items-center justify-center
    font-[var(--font-weight-medium)]
    rounded-[var(--border-radius-md)]
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
  
  // Size variations
  const sizeClasses = {
    sm: 'px-[var(--spacing-md)] py-[var(--spacing-xs)] text-[var(--font-size-sm)]',
    md: 'px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-[var(--font-size-md)]',
    lg: 'px-[var(--spacing-xl)] py-[var(--spacing-md)] text-[var(--font-size-md)]',
  };
  
  // Variant styles
  const variantClasses = {
    primary: `
      bg-brand-purple text-white
      hover:bg-brand-purple-dark
      focus:ring-brand-purple
    `,
    secondary: `
      bg-neutral-100 text-neutral-800
      hover:bg-neutral-200
      focus:ring-neutral-400
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-red-500
    `,
    success: `
      bg-green-600 text-white
      hover:bg-green-700
      focus:ring-green-500
    `,
    warning: `
      bg-yellow-500 text-white
      hover:bg-yellow-600
      focus:ring-yellow-400
    `,
    info: `
      bg-blue-500 text-white
      hover:bg-blue-600
      focus:ring-blue-400
    `,
    outline: `
      bg-transparent 
      text-brand-purple dark:text-brand-purple-light
      border-2 border-brand-purple dark:border-brand-purple-light
      hover:bg-brand-purple hover:bg-opacity-10
      focus:ring-brand-purple
    `,
    text: `
      bg-transparent text-brand-purple dark:text-brand-purple-light
      hover:bg-brand-purple hover:bg-opacity-10
      focus:ring-brand-purple
    `,
  };
  
  // State classes
  const loadingClasses = isLoading ? 'opacity-80 cursor-wait' : '';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${loadingClasses}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {/* Button content */}
      {children}
      
      {/* Right icon */}
      {rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button; 