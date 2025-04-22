import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="page-header bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="page-title text-3xl font-bold text-center">About HealthInsightToday</h1>
            <p className="text-slate-600 max-w-3xl mx-auto text-center">
              Learn more about our mission to make health data accessible and actionable for everyone.
            </p>
          </div>
        </div>

        <div className="content-section py-12">
          <div className="container mx-auto px-4">
            <div className="about-content max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="mb-6">
                At HealthInsightToday, we believe that everyone deserves to understand their health data. Our mission 
                is to demystify medical reports and empower individuals to take control of their health journey with 
                clear, actionable insights.
              </p>
              
              <p className="mb-6">
                Founded in 2023, we've set out to transform how people interact with their health information. 
                Through advanced AI technology and medical expertise, we analyze blood test reports to provide 
                personalized insights and recommendations that anyone can understand and act upon.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Our Story</h2>
              <p className="mb-6">
                HealthInsightToday was born from a personal experience. Our founder, Dr. Sarah Chen, struggled to 
                help her parents understand their complex blood test results and what actions they should take to 
                improve their health. Despite being a physician herself, she found it challenging to translate 
                medical jargon into practical advice.
              </p>
              
              <p className="mb-6">
                This experience inspired her to create a solution that would make health data accessible to everyone, 
                regardless of their medical knowledge. By combining artificial intelligence with medical expertise, 
                HealthInsightToday was created to bridge the gap between complex medical data and everyday health decisions.
              </p>

              <div className="team-section mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Our Leadership Team</h2>
                
                <div className="founder-profile">
                  <div className="w-48 h-48 rounded-full bg-slate-100 flex items-center justify-center text-5xl text-indigo-600 mb-4 mx-auto">
                    SC
                  </div>
                  <h3 className="founder-name text-xl font-bold text-center">Dr. Sarah Chen</h3>
                  <p className="founder-role text-slate-600 text-center">Founder & CEO</p>
                  <p className="founder-bio max-w-2xl text-center mx-auto">
                    With over 15 years of experience in internal medicine and digital health, Dr. Chen leads our mission 
                    to make health data accessible to everyone. She holds an MD from Stanford University and an MBA from Harvard.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-indigo-600 mx-auto mb-4">
                      MP
                    </div>
                    <h3 className="text-lg font-bold">Dr. Michael Park</h3>
                    <p className="text-slate-600 mb-2">Chief Medical Officer</p>
                    <p>Specialist in laboratory medicine with expertise in interpreting complex test results.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-indigo-600 mx-auto mb-4">
                      RS
                    </div>
                    <h3 className="text-lg font-bold">Rahul Sharma</h3>
                    <p className="text-slate-600 mb-2">Chief Technology Officer</p>
                    <p>AI specialist with a background in healthcare technology and data science.</p>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Our Values</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <div className="text-3xl text-indigo-600 mb-3">🔍</div>
                    <h3 className="text-lg font-bold mb-2">Accuracy</h3>
                    <p>We prioritize medical accuracy in all our insights and recommendations, ensuring you receive reliable information.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <div className="text-3xl text-indigo-600 mb-3">🔒</div>
                    <h3 className="text-lg font-bold mb-2">Privacy</h3>
                    <p>Your health data belongs to you. We maintain the highest standards of privacy and security.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <div className="text-3xl text-indigo-600 mb-3">💡</div>
                    <h3 className="text-lg font-bold mb-2">Accessibility</h3>
                    <p>We believe health information should be understandable and actionable for everyone.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <div className="text-3xl text-indigo-600 mb-3">🤝</div>
                    <h3 className="text-lg font-bold mb-2">Empowerment</h3>
                    <p>We aim to empower individuals to take control of their health journey through knowledge and guidance.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-16">
                <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
                <p className="mb-6">Join thousands of users who are making informed health decisions with HealthInsightToday.</p>
                <Link to="/signup" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors inline-block">
                  Get Started For Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage; 