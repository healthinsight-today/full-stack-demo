import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title = 'Server Error',
  message = 'Sorry, something went wrong on our end. We\'re working to fix it.',
}) => {
  const navigate = useNavigate();

  const handleGoBack = (): void => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <div className="w-full max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-6">{statusCode}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 