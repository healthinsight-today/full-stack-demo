import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-neutral-800 py-6 w-full border-t border-neutral-200 dark:border-neutral-700 z-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-6">
            <div className="flex items-center mb-4">
              <span className="text-lg font-bold">
                <span className="text-primary-600 dark:text-primary-400">HealthInsight</span>
                <span className="text-neutral-800 dark:text-neutral-200">Today</span>
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-xl">
              HealthInsightToday helps you understand your blood test results, track your health metrics over time, and make informed decisions about your wellness journey.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-neutral-900 dark:text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  My Reports
                </Link>
              </li>
              <li>
                <Link to="/insights" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Insights
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Recommendations
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  History
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-neutral-900 dark:text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright and Disclaimer */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-6">
          <div className="text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              © 2025 HealthInsightToday. All rights reserved.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2 max-w-3xl mx-auto">
              HealthInsightToday is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional before making any health-related decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
