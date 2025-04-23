import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast, { ToastType } from './Toast';

// Define toast item structure
export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

// Toast params can be a string or an object
type ToastParams = 
  | string
  | {
      message: string;
      type?: ToastType;
      title?: string;
      duration?: number;
      autoClose?: boolean;
    };

// Define toast context
interface ToastContextProps {
  toasts: ToastItem[];
  showToast: (
    params: ToastParams,
    type?: ToastType,
    options?: {
      title?: string;
      duration?: number;
      autoClose?: boolean;
    }
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Create the context
const ToastContext = createContext<ToastContextProps | null>(null);

// Define provider props
interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Function to create a new toast
  const showToast = useCallback(
    (
      params: ToastParams,
      type: ToastType = 'info',
      options: {
        title?: string;
        duration?: number;
        autoClose?: boolean;
      } = {}
    ): string => {
      const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Handle both string and object parameters
      let newToast: ToastItem;
      
      if (typeof params === 'string') {
        newToast = {
          id,
          type,
          message: params,
          title: options.title,
          duration: options.duration,
          autoClose: options.autoClose !== undefined ? options.autoClose : true,
        };
      } else {
        newToast = {
          id,
          type: params.type || type,
          message: params.message,
          title: params.title || options.title,
          duration: params.duration || options.duration,
          autoClose: params.autoClose !== undefined ? params.autoClose : 
                    options.autoClose !== undefined ? options.autoClose : true,
        };
      }
      
      setToasts((prevToasts) => {
        // Limit number of toasts
        const updatedToasts = [newToast, ...prevToasts];
        return updatedToasts.slice(0, maxToasts);
      });
      
      return id;
    },
    [maxToasts]
  );
  
  // Function to remove a toast
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Function to clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Position styles
  const positionStyles = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  };
  
  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        clearToasts,
      }}
    >
      {children}
      
      {/* Toast container */}
      <div 
        className={`fixed z-[var(--z-index-toast)] p-[var(--spacing-md)] max-h-screen overflow-hidden pointer-events-none flex flex-col ${
          position.includes('top') ? 'space-y-[var(--spacing-sm)]' : 'space-y-[var(--spacing-sm)] flex-col-reverse'
        } ${positionStyles[position]}`}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto transition-all duration-300 ease-in-out transform">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              autoClose={toast.autoClose}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 