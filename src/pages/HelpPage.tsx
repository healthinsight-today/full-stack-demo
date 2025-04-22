import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  topics: {
    id: string;
    title: string;
    content: string;
  }[];
}

const HelpPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("getting-started");
  const [activeTopic, setActiveTopic] = useState<string>("upload-report");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const helpCategories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using HealthInsightToday",
      icon: "🚀",
      topics: [
        {
          id: "upload-report",
          title: "How to Upload a Report",
          content: `
            <h3>Uploading Your First Report</h3>
            <p>Follow these simple steps to upload and analyze your first blood test report:</p>
            <ol>
              <li>
                <strong>Navigate to the Upload page:</strong> From your dashboard, click on the "Upload Report" button in the navigation menu.
              </li>
              <li>
                <strong>Select your file:</strong> Click the upload area or drag and drop your report file. We support PDF, JPG, PNG, and TIFF formats.
              </li>
              <li>
                <strong>Verify the data:</strong> Our system will automatically extract the data from your report. Please review it to ensure accuracy.
              </li>
              <li>
                <strong>Process the report:</strong> Click the "Analyze Report" button to process your data and generate insights.
              </li>
            </ol>
            <p>Once processed, you'll be redirected to your report details page where you can view the analysis, insights, and recommendations.</p>
            
            <h3>Tips for Best Results</h3>
            <ul>
              <li>Ensure your report image is clear and all text is legible</li>
              <li>Include all pages of your report for comprehensive analysis</li>
              <li>Make sure the report includes reference ranges for each parameter</li>
            </ul>
          `
        },
        {
          id: "navigating-insights",
          title: "Understanding Your Insights",
          content: `
            <h3>Reading Your Health Insights</h3>
            <p>After analyzing your report, we provide personalized insights about your health metrics. Here's how to interpret them:</p>
            
            <h4>Abnormal Parameters</h4>
            <p>Parameters outside the normal range are highlighted and explained in plain language. Each abnormal parameter includes:</p>
            <ul>
              <li><strong>Current value:</strong> Your measured value for this parameter</li>
              <li><strong>Reference range:</strong> The normal range for this parameter</li>
              <li><strong>Deviation:</strong> How far your value is from the normal range</li>
              <li><strong>Explanation:</strong> What this parameter measures and why it might be abnormal</li>
            </ul>
            
            <h4>Health Insights</h4>
            <p>Based on patterns in your results, we provide health insights that may explain your abnormal parameters. Each insight includes:</p>
            <ul>
              <li><strong>Confidence level:</strong> How certain we are about this insight based on your data</li>
              <li><strong>Explanation:</strong> What this insight means for your health</li>
              <li><strong>Supporting evidence:</strong> Which parameters support this insight</li>
              <li><strong>References:</strong> Medical literature supporting our interpretation</li>
            </ul>
            
            <h4>Recommendations</h4>
            <p>Based on your insights, we provide actionable recommendations that may help improve your health metrics. These may include:</p>
            <ul>
              <li>Dietary changes</li>
              <li>Physical activity suggestions</li>
              <li>Lifestyle modifications</li>
              <li>Follow-up testing recommendations</li>
              <li>Specialist consultations to consider</li>
            </ul>
          `
        },
        {
          id: "account-setup",
          title: "Setting Up Your Account",
          content: `
            <h3>Creating and Managing Your Account</h3>
            <p>To get the most out of HealthInsightToday, complete your account setup with these steps:</p>
            
            <h4>Complete Your Profile</h4>
            <ol>
              <li>Navigate to the Settings page by clicking your profile icon in the top right</li>
              <li>Fill in your personal information (age, gender, height, weight)</li>
              <li>Add any relevant medical history or conditions</li>
              <li>Set your health goals and areas of focus</li>
            </ol>
            
            <h4>Privacy Settings</h4>
            <p>Control how your data is used and shared:</p>
            <ul>
              <li>Data sharing preferences</li>
              <li>Email notification settings</li>
              <li>Two-factor authentication setup</li>
              <li>Connected apps and services</li>
            </ul>
            
            <h4>Family Accounts</h4>
            <p>You can manage health reports for family members:</p>
            <ol>
              <li>Go to Settings > Family Management</li>
              <li>Click "Add Family Member"</li>
              <li>Enter their information and relationship to you</li>
              <li>You can now upload and manage reports for this family member</li>
            </ol>
          `
        }
      ]
    },
    {
      id: "using-features",
      title: "Using Key Features",
      description: "Learn how to use the main features of our platform",
      icon: "🔍",
      topics: [
        {
          id: "tracking-health",
          title: "Tracking Health Over Time",
          content: `
            <h3>Monitoring Your Health Progress</h3>
            <p>HealthInsightToday allows you to track changes in your health metrics over time. Here's how to use this feature:</p>
            
            <h4>Viewing Historical Data</h4>
            <ol>
              <li>Navigate to the "History" tab in your dashboard</li>
              <li>Select the parameters you want to track from the dropdown menu</li>
              <li>Choose a date range for your historical view</li>
              <li>View your trends in the interactive charts</li>
            </ol>
            
            <h4>Understanding Trend Charts</h4>
            <p>Our trend charts show how your health metrics have changed over time:</p>
            <ul>
              <li><strong>Green area:</strong> Represents the normal reference range</li>
              <li><strong>Red points:</strong> Values outside the normal range</li>
              <li><strong>Blue line:</strong> Your value trend over time</li>
              <li><strong>Dotted line:</strong> Trend projection based on your data</li>
            </ul>
            
            <h4>Setting Health Goals</h4>
            <p>Set target values for specific parameters:</p>
            <ol>
              <li>From any parameter chart, click "Set Goal"</li>
              <li>Enter your target value and target date</li>
              <li>Add notes about your goal strategy</li>
              <li>Track your progress toward this goal over time</li>
            </ol>
          `
        },
        {
          id: "sharing-reports",
          title: "Sharing Reports with Doctors",
          content: `
            <h3>Sharing Your Health Information</h3>
            <p>Easily share your health insights with healthcare providers:</p>
            
            <h4>Generating Shareable Reports</h4>
            <ol>
              <li>From any report page, click the "Share" button in the top right</li>
              <li>Select "Generate PDF Report" or "Generate Doctor Summary"</li>
              <li>Customize what information to include in the report</li>
              <li>Click "Generate" to create your shareable document</li>
            </ol>
            
            <h4>Sharing Options</h4>
            <p>Once your report is generated, you can share it in several ways:</p>
            <ul>
              <li><strong>Email:</strong> Send directly to your healthcare provider</li>
              <li><strong>Download:</strong> Save the PDF to your device</li>
              <li><strong>Print:</strong> Print a physical copy to bring to appointments</li>
              <li><strong>Secure Link:</strong> Generate a temporary access link to share</li>
            </ul>
            
            <h4>Doctor Access Portal</h4>
            <p>For ongoing access, invite your doctor to view your reports through our portal:</p>
            <ol>
              <li>Go to Settings > Healthcare Providers</li>
              <li>Click "Invite Provider"</li>
              <li>Enter their email and customize their access level</li>
              <li>They'll receive an invitation to create a limited access account</li>
            </ol>
          `
        },
        {
          id: "mobile-app",
          title: "Using the Mobile App",
          content: `
            <h3>HealthInsightToday Mobile Features</h3>
            <p>Our mobile app offers convenient access to your health data on the go. Download it from the App Store or Google Play Store.</p>
            
            <h4>Mobile-Specific Features</h4>
            <ul>
              <li><strong>Camera Upload:</strong> Take photos of new reports directly within the app</li>
              <li><strong>Offline Access:</strong> View your previous reports even without internet connection</li>
              <li><strong>Health Notifications:</strong> Receive reminders and alerts about your health goals</li>
              <li><strong>Quick Share:</strong> Easily share reports during doctor visits</li>
            </ul>
            
            <h4>Syncing Between Devices</h4>
            <p>Your data automatically syncs between web and mobile platforms:</p>
            <ul>
              <li>Log in with the same account credentials on all devices</li>
              <li>Changes made on one device will appear on all others</li>
              <li>Reports uploaded via mobile will be available on the web interface</li>
              <li>Notification preferences can be managed in the app settings</li>
            </ul>
            
            <h4>Mobile Security</h4>
            <p>Additional security options for the mobile app:</p>
            <ul>
              <li>Biometric authentication (fingerprint or face recognition)</li>
              <li>PIN code access</li>
              <li>Automatic logout options</li>
              <li>Remote logout from other devices</li>
            </ul>
          `
        }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Solve common issues and get help",
      icon: "🔧",
      topics: [
        {
          id: "upload-issues",
          title: "Report Upload Problems",
          content: `
            <h3>Solving Report Upload Issues</h3>
            <p>If you're experiencing problems with uploading your reports, try these solutions:</p>
            
            <h4>Common Upload Errors</h4>
            <ul>
              <li>
                <strong>"Format not supported" error:</strong>
                <p>Make sure your file is in PDF, JPG, PNG, or TIFF format. If you have a different format, convert it first using a free online tool.</p>
              </li>
              <li>
                <strong>"File too large" error:</strong>
                <p>Files must be under 20MB. Try compressing your PDF or resizing your image to a smaller file size.</p>
              </li>
              <li>
                <strong>Upload gets stuck at "Processing":</strong>
                <p>Try refreshing the page and uploading again. If the problem persists, try a different browser or clear your browser cache.</p>
              </li>
            </ul>
            
            <h4>Improving Data Extraction</h4>
            <p>If our system has trouble reading your report:</p>
            <ul>
              <li>Ensure the image is clear and not blurry</li>
              <li>Make sure all text is visible and not cut off at edges</li>
              <li>Use the "Manual Entry" option if automatic extraction doesn't work</li>
              <li>Try scanning the document instead of taking a photo</li>
            </ul>
            
            <h4>Still Having Problems?</h4>
            <p>Contact our support team for assistance:</p>
            <ul>
              <li>Email a copy of your report to support@healthinsighttoday.com</li>
              <li>Describe the issue you're experiencing in detail</li>
              <li>Include screenshots of any error messages</li>
              <li>Our team will process your report manually if needed</li>
            </ul>
          `
        },
        {
          id: "account-issues",
          title: "Account and Billing Help",
          content: `
            <h3>Account and Subscription Issues</h3>
            <p>Get help with managing your account and subscription:</p>
            
            <h4>Account Access Problems</h4>
            <ul>
              <li>
                <strong>Forgot password:</strong>
                <p>Use the "Forgot Password" link on the login page to reset your password via email.</p>
              </li>
              <li>
                <strong>Email not receiving verification:</strong>
                <p>Check your spam folder. If not there, contact support to verify your email manually.</p>
              </li>
              <li>
                <strong>Account locked:</strong>
                <p>After multiple failed login attempts, accounts may be temporarily locked. Wait 30 minutes or contact support.</p>
              </li>
            </ul>
            
            <h4>Billing and Subscription</h4>
            <p>Manage your subscription and billing information:</p>
            <ul>
              <li>
                <strong>Update payment method:</strong>
                <p>Go to Settings > Billing > Payment Methods to update your card or payment details.</p>
              </li>
              <li>
                <strong>Cancel subscription:</strong>
                <p>Go to Settings > Billing > Subscription > Cancel Subscription. Access continues until the end of your billing period.</p>
              </li>
              <li>
                <strong>Billing dispute:</strong>
                <p>If you see charges you don't recognize, contact our billing team at billing@healthinsighttoday.com.</p>
              </li>
            </ul>
            
            <h4>Deleting Your Account</h4>
            <p>If you wish to delete your account and data:</p>
            <ol>
              <li>Go to Settings > Privacy > Delete Account</li>
              <li>Read the information about what data will be deleted</li>
              <li>Confirm by entering your password</li>
              <li>We'll send a confirmation email with final delete button</li>
            </ol>
            <p>Note: Account deletion is permanent and cannot be undone.</p>
          `
        },
        {
          id: "technical-issues",
          title: "Technical Problems",
          content: `
            <h3>Resolving Technical Issues</h3>
            <p>Solutions for common technical problems with the platform:</p>
            
            <h4>Performance Issues</h4>
            <ul>
              <li>
                <strong>Slow loading times:</strong>
                <p>Try clearing your browser cache, using a different browser, or checking your internet connection speed.</p>
              </li>
              <li>
                <strong>Charts not displaying:</strong>
                <p>Make sure JavaScript is enabled in your browser. Try disabling any ad blockers or browser extensions.</p>
              </li>
              <li>
                <strong>Application freezing:</strong>
                <p>Close and reopen your browser. If using the mobile app, force close and restart it.</p>
              </li>
            </ul>
            
            <h4>Compatibility Issues</h4>
            <p>Our platform works best with:</p>
            <ul>
              <li>Chrome 70+</li>
              <li>Firefox 65+</li>
              <li>Safari 12+</li>
              <li>Edge 79+</li>
              <li>iOS 12+ or Android 8+</li>
            </ul>
            <p>If using an older browser or operating system, please update to the latest version for the best experience.</p>
            
            <h4>Data Syncing Issues</h4>
            <p>If you notice data isn't syncing between devices:</p>
            <ul>
              <li>Make sure you're logged into the same account on all devices</li>
              <li>Check that you have an active internet connection</li>
              <li>Try logging out and back in to refresh your session</li>
              <li>If problems persist, contact support with details about which devices and data are affected</li>
            </ul>
          `
        }
      ]
    }
  ];

  // Get current category and topic
  const currentCategory = helpCategories.find(cat => cat.id === activeCategory) || helpCategories[0];
  const currentTopic = currentCategory.topics.find(topic => topic.id === activeTopic) || currentCategory.topics[0];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search through all help content
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="page-header bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="page-title text-3xl font-bold text-center">Help Center</h1>
            <p className="text-slate-600 max-w-3xl mx-auto text-center mb-8">
              Find answers, guides, and troubleshooting help for HealthInsightToday.
            </p>
            
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  className="w-full py-3 px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="content-section py-12">
          <div className="container mx-auto px-4">
            <div className="help-content">
              <div className="grid md:grid-cols-12 gap-8">
                
                {/* Sidebar */}
                <div className="md:col-span-3">
                  <div className="categories mb-8">
                    <h2 className="text-lg font-bold mb-3">Help Categories</h2>
                    <ul className="space-y-1">
                      {helpCategories.map(category => (
                        <li key={category.id}>
                          <button
                            onClick={() => {
                              setActiveCategory(category.id);
                              setActiveTopic(category.topics[0].id);
                            }}
                            className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                              activeCategory === category.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            <span className="mr-2">{category.icon}</span>
                            <span className="font-medium">{category.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="topics">
                    <h2 className="text-lg font-bold mb-3">Topics</h2>
                    <ul className="space-y-1">
                      {currentCategory.topics.map(topic => (
                        <li key={topic.id}>
                          <button
                            onClick={() => setActiveTopic(topic.id)}
                            className={`w-full p-3 rounded-lg text-left transition-colors ${
                              activeTopic === topic.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            {topic.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="contact-support mt-8 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-bold mb-2">Need more help?</h3>
                    <p className="text-sm text-slate-600 mb-4">Our support team is here to help you with any questions.</p>
                    <Link
                      to="/contact"
                      className="block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-center rounded-lg transition-colors"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-9">
                  <div className="content-header mb-6">
                    <h2 className="text-2xl font-bold">{currentTopic.title}</h2>
                    <p className="text-slate-600">{currentCategory.description}</p>
                  </div>
                  
                  <div className="content-body prose max-w-none" dangerouslySetInnerHTML={{ __html: currentTopic.content }}>
                  </div>
                  
                  <div className="content-footer mt-8 pt-6 border-t border-slate-200">
                    <h3 className="font-bold mb-2">Was this article helpful?</h3>
                    <div className="flex space-x-2">
                      <button className="py-1 px-4 border border-slate-300 rounded-full hover:bg-slate-50">
                        Yes, thanks!
                      </button>
                      <button className="py-1 px-4 border border-slate-300 rounded-full hover:bg-slate-50">
                        Not really
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="more-resources mt-12 bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-6 text-center">More Resources</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <h3 className="font-bold mb-2">FAQs</h3>
                    <p className="text-sm text-slate-600 mb-4">Browse our frequently asked questions for quick answers.</p>
                    <Link to="/faq" className="text-indigo-600 hover:underline">View FAQs</Link>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎥</div>
                    <h3 className="font-bold mb-2">Video Tutorials</h3>
                    <p className="text-sm text-slate-600 mb-4">Watch step-by-step guides on using our platform.</p>
                    <a href="#" className="text-indigo-600 hover:underline">View Tutorials</a>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">📞</div>
                    <h3 className="font-bold mb-2">Live Support</h3>
                    <p className="text-sm text-slate-600 mb-4">Connect with our support team for personalized help.</p>
                    <Link to="/contact" className="text-indigo-600 hover:underline">Contact Us</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpPage; 