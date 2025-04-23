import React from 'react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import FormLabel from '@/components/ui/FormLabel';
import FormInput from '@/components/ui/FormInput';
import FormField from '@/components/ui/FormField';

export default function ComponentsShowcasePage() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">UI Components</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Form Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">FormLabel</h3>
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="standard-label">Standard Label</FormLabel>
              </div>
              <div>
                <FormLabel htmlFor="required-label" required>Required Label</FormLabel>
              </div>
              <div>
                <FormLabel htmlFor="optional-label" optional>Optional Label</FormLabel>
              </div>
              <div>
                <FormLabel htmlFor="error-label" error>Error Label</FormLabel>
              </div>
              <div>
                <FormLabel htmlFor="help-label" helpText="This is some helpful text">
                  Label with Help Text
                </FormLabel>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">FormInput</h3>
            <div className="space-y-4">
              <FormInput 
                id="standard-input"
                name="standard-input"
                placeholder="Standard input"
              />
              <FormInput 
                id="disabled-input"
                name="disabled-input"
                placeholder="Disabled input"
                disabled
              />
              <FormInput 
                id="error-input"
                name="error-input"
                placeholder="Input with error"
                error
                errorMessage="This field has an error"
              />
              <FormInput 
                id="left-icon-input"
                name="left-icon-input"
                placeholder="Input with left icon"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              />
              <FormInput 
                id="right-icon-input"
                name="right-icon-input"
                placeholder="Input with right icon"
                rightIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              />
              <FormInput 
                id="full-width-input"
                name="full-width-input"
                placeholder="Full width input"
                fullWidth
              />
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">FormField</h3>
            <div className="space-y-4">
              <FormField 
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                required
              />
              
              <FormField 
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                rightIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                required
              />
              
              <FormField 
                label="Username"
                name="username"
                placeholder="johndoe"
                optional
                helpText="Choose a unique username for your account"
              />
              
              <FormField 
                label="Confirmation Code"
                name="code"
                placeholder="Enter the 6-digit code"
                error
                errorMessage="Invalid code. Please try again."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 