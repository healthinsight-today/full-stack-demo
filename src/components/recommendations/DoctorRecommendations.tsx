import React, { useState, useEffect } from 'react';
import { DoctorRecommendation, getDoctorRecommendations } from '../../services/api/recommendations';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';

interface DoctorRecommendationsProps {
  reportId: string;
  className?: string;
}

const DoctorRecommendations: React.FC<DoctorRecommendationsProps> = ({ reportId, className = '' }) => {
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getDoctorRecommendations(reportId);
        
        if (response.success && response.data) {
          setRecommendations(response.data);
          
          // Select the first recommendation by default if available
          if (response.data.length > 0) {
            setSelectedRecommendation(response.data[0].id);
          }
        } else {
          setError(response.error || 'Failed to fetch doctor recommendations');
        }
      } catch (err) {
        setError('An error occurred while fetching doctor recommendations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [reportId]);

  const getCurrentRecommendation = () => {
    return recommendations.find(rec => rec.id === selectedRecommendation);
  };

  // Function to get appropriate urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'moderate':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  // Handle scheduling an appointment
  const handleScheduleAppointment = (doctorId: string) => {
    // In a real app, this would open a scheduling flow
    console.log(`Scheduling appointment with doctor ${doctorId}`);
    alert(`Appointment scheduling would open for doctor ${doctorId}`);
  };

  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center p-8`}>
        <LoadingSpinner size="lg" text="Loading specialist recommendations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorMessage title="Failed to load recommendations" message={error} />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={className}>
        <Card>
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No specialist recommendations</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              There are no specialist recommendations available for this report.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const currentRecommendation = getCurrentRecommendation();

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Specialist Recommendations</h2>
      
      {/* Recommendation Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recommendations.map((rec) => (
          <button
            key={rec.id}
            onClick={() => setSelectedRecommendation(rec.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${rec.id === selectedRecommendation
                ? 'bg-primary-600 text-white dark:bg-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
          >
            {rec.specialistType}
          </button>
        ))}
      </div>
      
      {currentRecommendation && (
        <div className="space-y-6">
          {/* Recommendation Header */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentRecommendation.specialistType} Recommendation
                  </h3>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {currentRecommendation.reason}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                  ${getUrgencyColor(currentRecommendation.urgency)}`}>
                  {currentRecommendation.urgency.charAt(0).toUpperCase() + currentRecommendation.urgency.slice(1)} Priority
                </span>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Recommended timeframe: <span className="font-medium">{currentRecommendation.timeframe}</span>
              </div>
            </div>
          </Card>
          
          {/* Doctor Cards */}
          <h3 className="text-md font-medium text-gray-800 dark:text-white mt-6 mb-3">
            Local {currentRecommendation.specialistType} Specialists
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRecommendation.specialists.map((doctor) => (
              <Card key={doctor.id} className="h-full">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doctor.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                      <div className="mt-1 flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(doctor.rating)
                                  ? 'text-yellow-400'
                                  : i < doctor.rating
                                  ? 'text-yellow-300'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          ({doctor.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="ml-2 text-gray-700 dark:text-gray-300">{doctor.hospital}</p>
                    </div>
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="ml-2">
                        <p className="text-gray-700 dark:text-gray-300">{doctor.address}</p>
                        <p className="text-gray-500 dark:text-gray-400">{doctor.distance}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="ml-2 text-gray-700 dark:text-gray-300">{doctor.availability}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    {doctor.telehealth && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Telehealth
                      </span>
                    )}
                    {doctor.acceptsInsurance && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Insurance
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-5 flex space-x-3">
                    <Button 
                      variant="primary"
                      onClick={() => handleScheduleAppointment(doctor.id)}
                      className="w-full"
                    >
                      Schedule
                    </Button>
                    {doctor.telehealth && (
                      <Button 
                        variant="outline"
                        onClick={() => handleScheduleAppointment(doctor.id)}
                        className="w-full"
                      >
                        Telehealth
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRecommendations; 