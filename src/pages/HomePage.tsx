import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthButtons } from '../components/auth/AuthButtons';
import { useUser } from '../context/UserContext';

const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useUser();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="landing-page text-slate-800">
      {/* Header */}
      <header className="py-6 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">HealthInsightToday</Link>
            
            <ul className={`absolute md:relative top-0 ${mobileMenuOpen ? 'right-0' : '-right-full'} 
                          w-4/5 md:w-auto h-screen md:h-auto bg-white md:bg-transparent
                          flex flex-col md:flex-row items-center justify-center md:justify-start 
                          gap-8 transition-all duration-300 shadow-lg md:shadow-none z-50 md:z-auto`}>
              <li><a href="#features" onClick={() => handleScrollTo('features')} className="font-medium hover:text-indigo-600 transition-colors">Features</a></li>
              <li><a href="#how-it-works" onClick={() => handleScrollTo('how-it-works')} className="font-medium hover:text-indigo-600 transition-colors">How It Works</a></li>
              <li><a href="#privacy" onClick={() => handleScrollTo('privacy')} className="font-medium hover:text-indigo-600 transition-colors">Privacy</a></li>
              <li><a href="#terms" onClick={() => handleScrollTo('terms')} className="font-medium hover:text-indigo-600 transition-colors">Terms</a></li>
            </ul>
            
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <Link 
                    to="/login" 
                    className="py-2 px-4 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Try Free
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/dashboard"
                    className="py-2 px-4 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              )}
              <button 
                className="md:hidden text-2xl" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                ☰
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Understanding Your Health<br />Made Simple
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            AI-powered analysis of blood tests that delivers personalized insights, actionable recommendations, and expert guidance for your health journey.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/signup" 
                  className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Try for Free
                </Link>
                <a 
                  href="#how-it-works" 
                  onClick={() => handleScrollTo('how-it-works')}
                  className="py-3 px-6 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg transition-colors"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                  Go to Dashboard
                </Link>
                <Link to="/upload" className="py-3 px-6 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg transition-colors">
                  Upload New Report
                </Link>
              </>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-full">HIPAA Compliant</span>
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-full">Expert Health Analysis</span>
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-full">Detailed Reports</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Powerful Health Analytics at Your Fingertips</h2>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            Discover the full potential of your health data with our advanced analysis tools and personalized recommendations.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Smart Report Analysis</h3>
              <p className="text-slate-600 mb-4">Upload your blood test reports and get instant analysis with abnormal results highlighted and explained in simple language.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">PDF and image upload support</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">AI-powered data extraction</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Clear visual indicators</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3">Health Tracking</h3>
              <p className="text-slate-600 mb-4">Monitor your health parameters over time with interactive charts and identify trends in your health journey.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Historical comparison</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Progress visualization</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Custom date ranges</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-3">Health Insights</h3>
              <p className="text-slate-600 mb-4">Receive expert insights about your health based on your test results, with clear explanations of what they mean.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Evidence-based analysis</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Medical references included</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Confidence indicators</li>
              </ul>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">🥗</div>
              <h3 className="text-xl font-bold mb-3">Personalized Nutrition</h3>
              <p className="text-slate-600 mb-4">Get customized nutrition plans based on your test results to improve your health metrics naturally.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Targeted nutrient recommendations</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Food suggestions with benefits</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Sample meal plans</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Connect with local dietitians</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Schedule nutrition consultations</li>
              </ul>
              <Link to="/find-dietitians" className="block w-full py-2 px-4 text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg transition-colors">
                Find Dietitians Near You
              </Link>
            </div>
            
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-bold mb-3">Specialist Recommendations</h3>
              <p className="text-slate-600 mb-4">Receive suggestions for medical specialists based on your test results and health concerns.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Doctor matching</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Telehealth options</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Insurance information</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Local specialists network</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">One-click appointment scheduling</li>
              </ul>
              <Link to="/find-specialists" className="block w-full py-2 px-4 text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-lg transition-colors">
                Find Specialists Near You
              </Link>
            </div>
            
            <div className="p-8 rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-3">Shopping & Meal Services</h3>
              <p className="text-slate-600 mb-4">Find grocery recommendations and meal delivery services that match your nutritional needs.</p>
              <ul className="mb-4 space-y-2">
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Grocery lists with benefits</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Meal delivery comparisons</li>
                <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600 before:font-bold">Health-focused food options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            Turn your blood test reports into actionable health insights in just a few simple steps.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">Upload Your Report</h3>
              <p className="text-slate-600">Take a photo or upload a PDF of your blood test report securely to our platform.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
              <p className="text-slate-600">Our AI system extracts and analyzes your test results, identifying abnormalities and patterns.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">Get Insights</h3>
              <p className="text-slate-600">Receive detailed health insights, recommendations, and specialist suggestions based on your results.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-xl font-bold mb-2">Take Action</h3>
              <p className="text-slate-600">Follow personalized recommendations, track progress over time, and improve your health outcomes.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/signup" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20" id="testimonials">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Users Say</h2>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            Join thousands of satisfied users who have improved their health with HealthInsightToday.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg shadow-md bg-slate-50">
              <p className="italic text-slate-600 mb-6">"After years of dealing with high cholesterol, HealthInsightToday helped me understand my blood work and connected me with a great dietitian. My numbers improved within 3 months!"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-4 font-bold">RS</div>
                <div>
                  <p className="font-bold">Rajesh Sharma</p>
                  <p className="text-sm text-slate-500">Software Engineer</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-lg shadow-md bg-slate-50">
              <p className="italic text-slate-600 mb-6">"HealthInsightToday helps me understand my lab reports better than my doctor explained them. The nutrition recommendations were exactly what I needed to address my vitamin deficiencies."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center mr-4 font-bold">SJ</div>
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-sm text-slate-500">Marketing Manager</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-lg shadow-md bg-slate-50">
              <p className="italic text-slate-600 mb-6">"Being able to track my health metrics over time has been incredible. I can clearly see how my lifestyle changes are affecting my blood work, and the specialist recommendations were spot on."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 font-bold">TW</div>
                <div>
                  <p className="font-bold">Thomas Wilson</p>
                  <p className="text-sm text-slate-500">Fitness Coach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50" id="try-free">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health Journey?</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-8">
            Upload your first report today and discover the insights that can help you make better health decisions.
          </p>
          <Link to="/signup" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">HealthInsightToday</h3>
              <p className="text-slate-300">Transforming blood test reports into personalized health insights and actionable recommendations.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" onClick={() => handleScrollTo('features')} className="text-slate-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" onClick={() => handleScrollTo('how-it-works')} className="text-slate-300 hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-slate-300 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/faq" className="text-slate-300 hover:text-white transition-colors">FAQs</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 HealthInsightToday. All rights reserved.</p>
            <p className="mt-2 max-w-4xl mx-auto">
              HealthInsightToday is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional before making any health-related decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 