import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  error = false,
  errorMessage,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
          {leftIcon}
        </div>
      )}
      
      <input
        id={id}
        name={name}
        disabled={disabled}
        className={`
          py-2 px-3 block w-full rounded-md border
          focus:outline-none focus:ring-2 ring-offset-2
          text-neutral-900 dark:text-white
          bg-white dark:bg-neutral-800
          placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          ${leftIcon ? 'pl-10' : ''}
          ${rightIcon ? 'pr-10' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900' : ''}
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-neutral-300 dark:border-neutral-700 focus:border-primary-500 focus:ring-primary-500'
          }
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
      
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
          {rightIcon}
        </div>
      )}
      
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormInput; 