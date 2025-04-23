import React from 'react';
import FormLabel from './FormLabel';
import FormInput, { FormInputProps } from './FormInput';

export interface FormFieldProps extends Omit<FormInputProps, 'id'> {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  helpText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id: propId,
  label,
  name,
  required = false,
  optional = false,
  helpText,
  error = false,
  errorMessage,
  ...props
}) => {
  // Generate an id if one wasn't provided
  const id = propId || `field-${name}`;

  return (
    <div className="mb-4">
      <FormLabel 
        htmlFor={id}
        required={required}
        optional={optional}
        error={error}
        helpText={helpText}
      >
        {label}
      </FormLabel>
      
      <div className="mt-1">
        <FormInput
          id={id}
          name={name}
          error={error}
          errorMessage={errorMessage}
          required={required}
          aria-describedby={helpText ? `${id}-description` : undefined}
          {...props}
        />
      </div>
    </div>
  );
};

export default FormField; 