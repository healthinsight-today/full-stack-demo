import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  elevated?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  elevated = false,
  loading = false,
  onClick,
}) => {
  const baseClasses = "bg-white dark:bg-neutral-800 rounded-[var(--border-radius-lg)] overflow-hidden";
  const elevationClasses = elevated ? "shadow-[var(--shadow-md)]" : "shadow-[var(--shadow-sm)]";
  const hoverClasses = onClick ? "hover:shadow-[var(--shadow-md)] cursor-pointer transition-shadow" : "";
  const paddingClasses = "p-[var(--spacing-lg)]";
  
  return (
    <div 
      className={`${baseClasses} ${elevationClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Card Header */}
      {(title || subtitle) && (
        <div className={`${paddingClasses} ${children ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
          {title && (
            typeof title === 'string' 
              ? <h3 className="text-[var(--font-size-lg)] leading-[var(--line-height-lg)] font-[var(--font-weight-medium)] text-neutral-900 dark:text-white">{title}</h3>
              : title
          )}
          {subtitle && (
            <p className="mt-1 text-[var(--font-size-sm)] text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          )}
        </div>
      )}
      
      {/* Card Content */}
      {loading ? (
        <div className={paddingClasses}>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        <div className={paddingClasses}>
          {children}
        </div>
      )}
      
      {/* Card Footer */}
      {footer && (
        <div className={`${paddingClasses} border-t border-neutral-200 dark:border-neutral-700`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 