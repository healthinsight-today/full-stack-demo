import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import axios from 'axios';

type Specialist = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  image: string;
  distance: string;
  availability: string;
};

const Specialists: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string>('');

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        // Using a demo run_id for now - in a real app this would come from user context
        const response = await axios.get(`/api/v1/specialists?run_id=demo123&location=San Francisco${specialty ? `&specialty=${specialty}` : ''}`);
        setSpecialists(response.data.specialists || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch specialists:', err);
        setError('Failed to load specialists. Please try again later.');
        setLoading(false);
        
        // Fallback to sample data in case of API failure
        setSpecialists([
          {
            id: 1,
            name: 'Dr. Michelle Johnson',
            specialty: 'Cardiologist',
            location: 'Heart Health Partners',
            rating: 4.8,
            image: 'https://randomuser.me/api/portraits/women/45.jpg',
            distance: '2.3 miles',
            availability: 'Next available: Tomorrow',
          },
          {
            id: 2,
            name: 'Dr. Robert Chen',
            specialty: 'Endocrinologist',
            location: 'Metabolic Care Clinic',
            rating: 4.9,
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            distance: '5.1 miles',
            availability: 'Next available: Friday',
          },
          {
            id: 3,
            name: 'Dr. Sarah Williams',
            specialty: 'Neurologist',
            location: 'Neuroscience Center',
            rating: 4.7,
            image: 'https://randomuser.me/api/portraits/women/63.jpg',
            distance: '3.8 miles',
            availability: 'Next available: Monday',
          },
          {
            id: 4,
            name: 'Dr. James Wilson',
            specialty: 'Nutritionist',
            location: 'Wellness Nutrition Center',
            rating: 4.6,
            image: 'https://randomuser.me/api/portraits/men/22.jpg',
            distance: '1.2 miles',
            availability: 'Next available: Today',
          },
          {
            id: 5,
            name: 'Dr. Emily Davis',
            specialty: 'Dermatologist',
            location: 'Skin & Beauty Clinic',
            rating: 4.9,
            image: 'https://randomuser.me/api/portraits/women/26.jpg',
            distance: '4.5 miles',
            availability: 'Next available: Wednesday',
          },
          {
            id: 6,
            name: 'Dr. Michael Thompson',
            specialty: 'Rheumatologist',
            location: 'Arthritis & Joint Care',
            rating: 4.7,
            image: 'https://randomuser.me/api/portraits/men/53.jpg',
            distance: '6.2 miles',
            availability: 'Next available: Tuesday',
          }
        ]);
      }
    };

    fetchSpecialists();
  }, [specialty]);

  // Rating stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter by specialty component
  const SpecialtyFilter = () => {
    const specialties = [
      { value: '', label: 'All Specialties' },
      { value: 'cardiologist', label: 'Cardiologist' },
      { value: 'endocrinologist', label: 'Endocrinologist' },
      { value: 'neurologist', label: 'Neurologist' },
      { value: 'nutritionist', label: 'Nutritionist' },
      { value: 'dermatologist', label: 'Dermatologist' },
      { value: 'rheumatologist', label: 'Rheumatologist' },
    ];

    return (
      <div className="mb-6">
        <label htmlFor="specialty-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by specialty
        </label>
        <select
          id="specialty-filter"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
        >
          {specialties.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Specialists Near You</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2">Showing sample data instead.</p>
        </div>
      )}
      
      <SpecialtyFilter />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialists.map((specialist) => (
          <Card key={specialist.id} className="overflow-hidden h-full">
            <div className="flex flex-col h-full">
              <div className="flex p-4 pb-3">
                <img
                  src={specialist.image}
                  alt={specialist.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold text-lg">{specialist.name}</h3>
                  <p className="text-brand-purple font-medium">{specialist.specialty}</p>
                  <p className="text-gray-500 text-sm">{specialist.location}</p>
                  <RatingStars rating={specialist.rating} />
                </div>
              </div>
              
              <div className="px-4 pb-3 text-sm text-gray-600">
                <div className="flex justify-between my-2">
                  <span>Distance</span>
                  <span className="font-medium">{specialist.distance}</span>
                </div>
                <div className="flex justify-between my-2">
                  <span>Availability</span>
                  <span className="font-medium">{specialist.availability}</span>
                </div>
              </div>
              
              <div className="mt-auto p-4 pt-3 border-t border-gray-200">
                <button className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-2 px-4 rounded transition-colors">
                  Schedule Appointment
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {specialists.length === 0 && (
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No specialists found</h3>
            <p className="text-neutral-600">
              There are no specialists matching your criteria. Try adjusting your filters.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Specialists; 