import React, { Fragment, useEffect, useRef } from 'react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  hideCloseButton = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEscape, isOpen, onClose]);
  
  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen && preventScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 z-[var(--z-index-modal)] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="flex min-h-screen items-center justify-center px-[var(--spacing-md)] pt-[var(--spacing-md)] pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
        />
        
        {/* Center modal */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>
        
        {/* Modal panel */}
        <div
          ref={modalRef}
          className={`inline-block transform overflow-hidden rounded-[var(--border-radius-lg)] bg-white dark:bg-neutral-800 text-left align-bottom shadow-[var(--shadow-lg)] transition-all sm:my-8 sm:align-middle ${sizeClasses[size]}`}
        >
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="bg-white dark:bg-neutral-800 px-[var(--spacing-md)] py-[var(--spacing-md)] sm:px-[var(--spacing-lg)] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              {title && (
                <h3 className="text-[var(--font-size-md)] font-[var(--font-weight-medium)] text-neutral-900 dark:text-white" id="modal-title">
                  {title}
                </h3>
              )}
              
              {!hideCloseButton && (
                <button
                  type="button"
                  className="rounded-md bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <svg 
                    className="h-6 w-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="bg-white dark:bg-neutral-800 px-[var(--spacing-md)] py-[var(--spacing-md)] sm:px-[var(--spacing-lg)] sm:py-[var(--spacing-lg)]">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="bg-neutral-50 dark:bg-neutral-900 px-[var(--spacing-md)] py-[var(--spacing-sm)] sm:px-[var(--spacing-lg)] border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-[var(--spacing-sm)] justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  ...props
}) => {
  const footer = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={props.onClose}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        size="sm"
        onClick={() => {
          onConfirm();
          props.onClose();
        }}
      >
        {confirmText}
      </Button>
    </>
  );
  
  return (
    <Modal {...props} footer={footer}>
      <div className="py-[var(--spacing-sm)]">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </Modal>
  );
};

export default Modal; 