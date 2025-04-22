import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        
        {error && <ErrorMessage message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-neutral-700 dark:text-neutral-300 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-md 
                focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-neutral-700 dark:text-neutral-300 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-md 
                focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800"
              required
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
          
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default LoginForm;
