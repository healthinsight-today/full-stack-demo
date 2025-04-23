import React from 'react';
import { Card } from '../components/ui';
import PageContainer from '../components/layout/PageContainer';
import { MagnifyingGlassIcon, DocumentTextIcon, DevicePhoneMobileIcon, ShieldCheckIcon, CreditCardIcon, AcademicCapIcon, PhoneIcon } from '@heroicons/react/24/outline';

const HelpPage: React.FC = () => {
  const helpCategories = [
    {
      id: 'reports',
      title: 'Understanding Reports',
      description: 'Learn how to read and interpret your health reports and metrics',
      icon: <DocumentTextIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'View Guides',
      actionLink: '/help/guides'
    },
    {
      id: 'platform',
      title: 'Using the Platform',
      description: 'Get help with navigating and using the HealthInsightToday features',
      icon: <DevicePhoneMobileIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'View Tutorials',
      actionLink: '/help/tutorials'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Learn about how we protect your health data and privacy',
      icon: <ShieldCheckIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'Read Policies',
      actionLink: '/help/privacy'
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Manage your subscription, billing information, and payment methods',
      icon: <CreditCardIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'View Options',
      actionLink: '/help/billing'
    },
    {
      id: 'glossary',
      title: 'Health Terms Glossary',
      description: 'Find definitions for common medical terms used in your reports',
      icon: <AcademicCapIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'Open Glossary',
      actionLink: '/help/glossary'
    },
    {
      id: 'support',
      title: 'Contact Support',
      description: 'Get in touch with our support team for personalized assistance',
      icon: <PhoneIcon className="h-7 w-7 text-brand-purple" />,
      actionText: 'Contact Us',
      actionLink: '/help/contact'
    }
  ];

  return (
    <PageContainer
      title="Help Center"
      description="Find answers to common questions and get support"
    >
      {/* Search bar */}
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
                <input
                  type="text"
                  placeholder="Search for help topics..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
        />
                </div>
                
      {/* Help categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {helpCategories.map((category) => (
          <Card key={category.id}>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                {category.icon}
              </div>
              <h2 className="text-lg font-semibold mb-2">{category.title}</h2>
              <p className="text-neutral-600 text-sm mb-6 flex-grow">{category.description}</p>
              <a
                href={category.actionLink}
                className="inline-block text-center px-4 py-2 border border-brand-purple text-brand-purple rounded hover:bg-brand-purple hover:text-white transition-colors"
              >
                {category.actionText}
              </a>
            </div>
          </Card>
        ))}
                  </div>
                  
      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
          Frequently Asked Questions
          <button className="text-sm text-brand-purple hover:text-brand-purple-dark">See all FAQs</button>
        </h2>

        <div className="space-y-4">
          {[
            {
              question: 'How do I upload my lab results?',
              answer: 'You can upload lab results from the Reports section by clicking the "Upload" button. We accept PDF files and most lab report formats.'
            },
            {
              question: 'Can I share my health insights with my doctor?',
              answer: 'Yes, you can generate a shareable report for your healthcare provider from any insight or recommendation page.'
            },
            {
              question: 'How is my data protected?',
              answer: 'We use industry-standard encryption and security protocols to protect your information. Your data is never shared without your explicit consent.'
            }
          ].map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="font-medium mb-2">{faq.question}</h3>
              <p className="text-sm text-neutral-600">{faq.answer}</p>
            </div>
          ))}
        </div>
    </div>
    </PageContainer>
  );
};

export default HelpPage; 