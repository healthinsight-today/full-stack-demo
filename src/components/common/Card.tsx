import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  onClick,
  hoverable = false,
  bordered = false,
  elevated = true,
}) => {
  const baseClasses = 'bg-white dark:bg-neutral-800 rounded-lg overflow-hidden transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-card-hover cursor-pointer transform hover:-translate-y-1' : '';
  const borderClasses = bordered ? 'border border-neutral-200 dark:border-neutral-700' : '';
  const shadowClasses = elevated ? 'shadow-card' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${borderClasses} ${shadowClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          {title && <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
        </div>
      )}
      
      <div className={`${title || subtitle ? '' : 'p-4 sm:p-6'}`}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
