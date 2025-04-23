import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-[var(--container-max-width)] mx-auto px-[var(--spacing-lg)] ${className}`}>
      {children}
    </div>
  );
};

export default Container; 