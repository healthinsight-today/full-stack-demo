import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="page-header bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="page-title text-3xl font-bold text-center">Terms of Service</h1>
            <p className="text-slate-600 max-w-3xl mx-auto text-center">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>

        <div className="content-section py-12">
          <div className="container mx-auto px-4">
            <div className="terms-content max-w-4xl mx-auto">
              <div className="mb-8">
                <p className="text-sm text-slate-500 mb-4">Last Updated: April 1, 2023</p>
                
                <p className="mb-4">
                  These Terms of Service ("Terms") govern your access to and use of the HealthInsightToday website, 
                  application, and services ("Service"). Please read these Terms carefully, and contact us if you have any questions.
                </p>
                
                <p className="mb-4">
                  By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you 
                  do not agree to these Terms, you may not access or use the Service.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Using our Service</h2>
                
                <h3 className="text-xl font-bold mb-3">1.1 Account Registration</h3>
                <p className="mb-4">
                  To use certain features of the Service, you may be required to register for an account. You agree to provide 
                  accurate, current, and complete information during the registration process and to update such information 
                  to keep it accurate, current, and complete.
                </p>
                
                <h3 className="text-xl font-bold mb-3">1.2 Account Security</h3>
                <p className="mb-4">
                  You are responsible for safeguarding your account and for all activities that occur under your account. 
                  You agree to notify HealthInsightToday immediately of any unauthorized use of your account or any other 
                  breach of security.
                </p>
                
                <h3 className="text-xl font-bold mb-3">1.3 Acceptable Use</h3>
                <p className="mb-4">
                  You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. You may not:
                </p>
                <ul className="list-disc pl-8 mb-4 space-y-2">
                  <li>Use the Service in any manner that could interfere with, disable, disrupt, or impair the Service</li>
                  <li>Attempt to gain unauthorized access to the Service or any related systems or networks</li>
                  <li>Upload or transmit any viruses, malware, or other malicious code</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                  <li>Collect or store personal data about other users without their express consent</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Health Information Disclaimer</h2>
                
                <h3 className="text-xl font-bold mb-3">2.1 Not Medical Advice</h3>
                <p className="mb-4">
                  The Service provides information and insights based on your uploaded health data, but it is not intended to be 
                  a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician 
                  or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
                
                <h3 className="text-xl font-bold mb-3">2.2 No Doctor-Patient Relationship</h3>
                <p className="mb-4">
                  Use of the Service does not create a doctor-patient relationship between you and HealthInsightToday or any of 
                  its employees, contractors, or partners. The Service is provided for informational purposes only.
                </p>
                
                <h3 className="text-xl font-bold mb-3">2.3 Emergency Situations</h3>
                <p className="mb-4">
                  The Service is not designed for use in medical emergencies. If you believe you have a medical emergency, 
                  immediately call your doctor or 911.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Intellectual Property</h2>
                
                <h3 className="text-xl font-bold mb-3">3.1 Our Intellectual Property</h3>
                <p className="mb-4">
                  The Service and its original content, features, and functionality are owned by HealthInsightToday and are 
                  protected by United States and international copyright, trademark, patent, trade secret, and other intellectual 
                  property or proprietary rights laws.
                </p>
                
                <h3 className="text-xl font-bold mb-3">3.2 License to Use</h3>
                <p className="mb-4">
                  Subject to these Terms, HealthInsightToday grants you a limited, non-exclusive, non-transferable, and revocable 
                  license to use the Service for your personal, non-commercial purposes.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Privacy</h2>
                <p className="mb-4">
                  We care about the privacy of our users. Please refer to our <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> for 
                  information on how we collect, use, and disclose information from our users.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
                <p className="mb-4">
                  To the maximum extent permitted by law, HealthInsightToday shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
                  indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-8 mb-4 space-y-2">
                  <li>Your access to or use of or inability to access or use the Service;</li>
                  <li>Any conduct or content of any third party on the Service;</li>
                  <li>Any content obtained from the Service; or</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <ul className="list-none mb-4">
                  <li>By email: <a href="mailto:terms@healthinsighttoday.com" className="text-indigo-600 hover:underline">terms@healthinsighttoday.com</a></li>
                  <li>By phone: <a href="tel:+18005551234" className="text-indigo-600 hover:underline">1-800-555-1234</a></li>
                </ul>
                <p>
                  <Link to="/contact" className="text-indigo-600 hover:underline">Visit our contact page</Link> for more ways to reach us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsPage; 