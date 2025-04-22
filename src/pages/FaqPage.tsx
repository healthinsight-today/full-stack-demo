import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FaqPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const faqItems: FaqItem[] = [
    // General FAQs
    {
      question: "What is HealthInsightToday?",
      answer: "HealthInsightToday is a platform that analyzes your blood test reports using AI technology to provide personalized health insights, explanations of abnormal results, and actionable recommendations to improve your health.",
      category: "general"
    },
    {
      question: "How do I get started with HealthInsightToday?",
      answer: "Simply create an account, upload your blood test report (PDF or image), and our system will analyze it to provide you with detailed insights. The process takes just a few minutes.",
      category: "general"
    },
    {
      question: "Is my health data secure?",
      answer: "Yes, we take data security very seriously. We use industry-standard encryption, are HIPAA compliant, and never share your health data with third parties without your explicit consent. Learn more in our Privacy Policy.",
      category: "general"
    },
    
    // Service FAQs
    {
      question: "What types of health reports can I analyze?",
      answer: "Currently, we support blood test reports including Complete Blood Count (CBC), Comprehensive Metabolic Panel (CMP), Lipid Panel, Hemoglobin A1c, Thyroid Function Tests, Vitamin levels, and more. We're continuously expanding our capabilities.",
      category: "service"
    },
    {
      question: "How accurate are the insights provided?",
      answer: "Our system is trained on medical knowledge and clinical guidelines. Each insight includes a confidence level and references to medical literature. However, our service is not a substitute for professional medical advice.",
      category: "service"
    },
    {
      question: "Can I track my health metrics over time?",
      answer: "Yes, you can upload multiple reports over time, and our platform will track changes in your health metrics, showing trends and progress through interactive charts and comparisons.",
      category: "service"
    },
    
    // Account FAQs
    {
      question: "Is there a free trial available?",
      answer: "Yes, you can analyze your first report for free. This includes basic insights and recommendations. For more detailed analysis and continuous tracking, we offer premium subscription plans.",
      category: "account"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from your account settings. After cancellation, you'll continue to have access to the service until the end of your billing period.",
      category: "account"
    },
    {
      question: "Can I share my health insights with my doctor?",
      answer: "Absolutely! You can export your insights and recommendations as a PDF to share with your healthcare provider. This can help facilitate more informed discussions during your appointments.",
      category: "account"
    },
    
    // Technical FAQs
    {
      question: "What file formats are supported for report upload?",
      answer: "We support PDF, JPG, PNG, and TIFF formats. For best results, ensure your uploads are clear and all text is legible.",
      category: "technical"
    },
    {
      question: "What should I do if my report analysis fails?",
      answer: "If the automatic analysis is unsuccessful, you can manually enter key results from your report. Additionally, our support team is available to assist you with processing your report.",
      category: "technical"
    },
    {
      question: "Is HealthInsightToday available on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on smartphones and tablets. We also offer dedicated iOS and Android apps for an enhanced mobile experience.",
      category: "technical"
    },
  ];

  const categories = [
    { id: 'general', name: 'General Questions' },
    { id: 'service', name: 'Our Services' },
    { id: 'account', name: 'Account & Billing' },
    { id: 'technical', name: 'Technical Support' },
  ];

  const filteredFaqs = faqItems.filter(item => 
    (activeCategory === 'all' || item.category === activeCategory) &&
    (searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="page-header bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="page-title text-3xl font-bold text-center">Frequently Asked Questions</h1>
            <p className="text-slate-600 max-w-3xl mx-auto text-center">
              Find answers to common questions about HealthInsightToday.
            </p>
            
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for questions..."
                  className="w-full py-3 px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section py-12">
          <div className="container mx-auto px-4">
            <div className="faq-content max-w-4xl mx-auto">
              <div className="category-tabs mb-8 flex flex-wrap justify-center space-x-2">
                <button 
                  onClick={() => setActiveCategory('all')}
                  className={`py-2 px-4 rounded-lg mb-2 ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  All Questions
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`py-2 px-4 rounded-lg mb-2 ${activeCategory === category.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="faq-items">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <div key={index} className="mb-6 p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg text-slate-600">No results found for your search.</p>
                    <p className="mt-2">Try different keywords or <button onClick={() => setSearchQuery('')} className="text-indigo-600 hover:underline">clear your search</button>.</p>
                  </div>
                )}
              </div>

              <div className="mt-12 bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-center">Still have questions?</h2>
                <p className="text-center mb-6">Our support team is here to help you with any questions you might have.</p>
                <div className="flex justify-center">
                  <Link to="/contact" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                    Contact Support
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

export default FaqPage; 