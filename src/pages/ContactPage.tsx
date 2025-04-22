import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSubmitting(false);
      setFormSubmitted(true);
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // After 5 seconds, reset the success message
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="page-header bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="page-title text-3xl font-bold text-center">Contact Us</h1>
            <p className="text-slate-600 max-w-3xl mx-auto text-center">
              Have questions or feedback? We'd love to hear from you. Our team is here to help.
            </p>
          </div>
        </div>

        <div className="content-section py-12">
          <div className="container mx-auto px-4">
            <div className="contact-content max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Contact Form */}
                <div className="contact-form-container">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  
                  {formSubmitted ? (
                    <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                      <p className="font-semibold">Message sent successfully!</p>
                      <p>Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                  ) : null}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership Opportunity</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Please describe how we can help you..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Contact Information */}
                <div className="contact-info">
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Customer Support</h3>
                      <p className="mb-1">
                        <span className="font-medium">Email:</span>{' '}
                        <a href="mailto:support@healthinsighttoday.com" className="text-indigo-600 hover:underline">
                          support@healthinsighttoday.com
                        </a>
                      </p>
                      <p className="mb-1">
                        <span className="font-medium">Phone:</span>{' '}
                        <a href="tel:+18005551234" className="text-indigo-600 hover:underline">
                          1-800-555-1234
                        </a>
                      </p>
                      <p className="text-sm text-slate-500">
                        Available Monday-Friday, 9am-5pm EST
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Business Inquiries</h3>
                      <p className="mb-1">
                        <span className="font-medium">Email:</span>{' '}
                        <a href="mailto:business@healthinsighttoday.com" className="text-indigo-600 hover:underline">
                          business@healthinsighttoday.com
                        </a>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Office Location</h3>
                      <p className="mb-1">123 Health Avenue</p>
                      <p className="mb-1">Suite 400</p>
                      <p className="mb-1">Boston, MA 02110</p>
                      <p className="mb-1">United States</p>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
                      <div className="flex space-x-4">
                        <a href="https://twitter.com/healthinsighttoday" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="Twitter">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                          </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/healthinsighttoday" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="LinkedIn">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                        <a href="https://www.facebook.com/healthinsighttoday" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="Facebook">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
                <p className="text-center mb-6">Find quick answers to commonly asked questions on our FAQ page.</p>
                <div className="flex justify-center">
                  <Link to="/faq" className="py-3 px-6 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg transition-colors">
                    Visit FAQ Page
                  </Link>
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

export default ContactPage; 