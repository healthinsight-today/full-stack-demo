import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
  pill?: boolean;
  outlined?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  icon,
  dot = false,
  pill = false,
  outlined = false,
  removable = false,
  onRemove,
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium';
  
  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };
  
  // Border radius styles
  const radiusStyles = pill ? 'rounded-full' : 'rounded';
  
  // Color styles
  const colorStyles = outlined
    ? {
        primary: 'bg-blue-50 text-blue-700 border border-blue-300',
        secondary: 'bg-gray-50 text-gray-700 border border-gray-300',
        success: 'bg-green-50 text-green-700 border border-green-300',
        danger: 'bg-red-50 text-red-700 border border-red-300',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
        info: 'bg-cyan-50 text-cyan-700 border border-cyan-300',
        neutral: 'bg-gray-50 text-gray-700 border border-gray-300'
      }
    : {
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-cyan-100 text-cyan-800',
        neutral: 'bg-gray-100 text-gray-800'
      };
  
  // Dot color styles
  const dotColorStyles = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500',
    neutral: 'bg-gray-500'
  };
  
  // Combine styles
  const badgeStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${radiusStyles}
    ${colorStyles[variant]}
    ${className}
  `;
  
  return (
    <span className={badgeStyles}>
      {dot && (
        <span 
          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${dotColorStyles[variant]}`}
          aria-hidden="true"
        ></span>
      )}
      
      {icon && (
        <span className={`mr-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {removable && (
        <button
          type="button"
          className={`
            ml-1 -mr-0.5 h-3.5 w-3.5 rounded-full inline-flex items-center
            justify-center focus:outline-none focus:ring-2 focus:ring-offset-0
            ${outlined ? 'focus:ring-blue-400' : 'focus:ring-blue-500'}
            hover:bg-black/10
          `}
          onClick={onRemove}
          aria-label="Remove"
        >
          <svg
            className="h-2.5 w-2.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge; 