import { get } from './client';
import { ApiResponse } from '../../types/Api';
import { Specialist } from '../../types/Report';
import { mockReport } from './mockData';

// Get specialist recommendations for a specific report
export const getSpecialistRecommendations = async (reportId: string): Promise<ApiResponse<Specialist[]>> => {
  try {
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        data: [],  // Fixed: mockReport doesn't have recommended_specialists
        status: 200,
        success: true
      };
    }

    const response = await get<Specialist[]>(`/reports/${reportId}/specialists`);
    return response;
  } catch (error) {
    console.error('Error fetching specialist recommendations:', error);
    return {
      data: [],
      status: 500,
      success: false,
      error: 'Failed to fetch specialist recommendations'
    };
  }
};

// Get local specialists based on user location and specialty
export const getLocalSpecialists = async (
  zipCode: string,
  specialty: string
): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  specialty: string;
  subspecialty?: string;
  address: string;
  phone: string;
  email: string;
  acceptingNewPatients: boolean;
  telehealth: boolean;
  insuranceAccepted: string[];
  hospitalAffiliations: string[];
  education: string[];
  rating: number;
  distance: number;
}>>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock specialists data based on requested specialty
    const specialists = [
      {
        id: "s-1",
        name: "Dr. Robert Williams",
        specialty: "Endocrinologist",
        subspecialty: "Diabetes Management",
        address: "123 Medical Center Dr, Wellness City, CA 90210",
        phone: "(555) 111-2222",
        email: "robert.williams@example.com",
        acceptingNewPatients: true,
        telehealth: true,
        insuranceAccepted: ["Aetna", "Blue Cross", "Cigna", "Medicare"],
        hospitalAffiliations: ["Wellness City Medical Center", "University Hospital"],
        education: ["Harvard Medical School", "Johns Hopkins Residency"],
        rating: 4.9,
        distance: 3.2
      },
      {
        id: "s-2",
        name: "Dr. Lisa Chen",
        specialty: "Cardiologist",
        subspecialty: "Preventive Cardiology",
        address: "456 Heart Health Blvd, Wellness City, CA 90210",
        phone: "(555) 222-3333",
        email: "lisa.chen@example.com",
        acceptingNewPatients: true,
        telehealth: false,
        insuranceAccepted: ["Blue Cross", "United Healthcare", "Kaiser", "Medicare"],
        hospitalAffiliations: ["Wellness City Medical Center", "Heart Institute"],
        education: ["Stanford Medical School", "Mayo Clinic Residency"],
        rating: 4.8,
        distance: 2.5
      },
      {
        id: "s-3",
        name: "Dr. James Thompson",
        specialty: "Hematologist",
        subspecialty: "Benign Hematology",
        address: "789 Blood Center Way, Wellness City, CA 90210",
        phone: "(555) 333-4444",
        email: "james.thompson@example.com",
        acceptingNewPatients: false,
        telehealth: true,
        insuranceAccepted: ["Aetna", "Cigna", "Humana", "Medicare"],
        hospitalAffiliations: ["University Hospital", "Regional Medical Center"],
        education: ["UCLA Medical School", "UCSF Residency"],
        rating: 4.7,
        distance: 4.8
      }
    ];
    
    // Filter by specialty
    const filteredSpecialists = specialists.filter(s => 
      s.specialty.toLowerCase() === specialty.toLowerCase() ||
      (s.subspecialty && s.subspecialty.toLowerCase().includes(specialty.toLowerCase()))
    );
    
    return {
      success: true,
      data: filteredSpecialists.length > 0 ? filteredSpecialists : specialists,
      status: 200
    };
  }
  
  // Real API call for production
  return get<Array<{
    id: string;
    name: string;
    specialty: string;
    subspecialty?: string;
    address: string;
    phone: string;
    email: string;
    acceptingNewPatients: boolean;
    telehealth: boolean;
    insuranceAccepted: string[];
    hospitalAffiliations: string[];
    education: string[];
    rating: number;
    distance: number;
  }>>('/specialists/local', { zipCode, specialty });
};

// Get appointment availability for a specific specialist
export const getSpecialistAvailability = async (
  specialistId: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<Array<{
  date: string;
  slots: Array<{
    time: string;
    available: boolean;
    telehealth: boolean;
  }>
}>>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Parse date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate mock availability data
    const availability = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const slots = [];
        
        // Generate time slots from 9 AM to 4 PM
        for (let hour = 9; hour <= 16; hour++) {
          if (hour !== 12) { // Skip lunch hour
            slots.push({
              time: `${hour}:00`,
              available: Math.random() > 0.3, // 70% chance of availability
              telehealth: Math.random() > 0.5 // 50% chance of telehealth
            });
            
            if (hour !== 16) { // No 4:30 slot
              slots.push({
                time: `${hour}:30`,
                available: Math.random() > 0.3,
                telehealth: Math.random() > 0.5
              });
            }
          }
        }
        
        availability.push({
          date: currentDate.toISOString().split('T')[0],
          slots
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      success: true,
      data: availability,
      status: 200
    };
  }
  
  // Real API call for production
  return get<Array<{
    date: string;
    slots: Array<{
      time: string;
      available: boolean;
      telehealth: boolean;
    }>
  }>>(`/specialists/${specialistId}/availability`, { startDate, endDate });
};

// Book an appointment with a specialist
export const bookAppointment = async (
  specialistId: string,
  date: string,
  time: string,
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    insurance: string;
    isTelehealth: boolean;
  }
): Promise<ApiResponse<{
  appointmentId: string;
  confirmationCode: string;
  specialist: string;
  date: string;
  time: string;
  isTelehealth: boolean;
  instructions: string;
}>> => {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Find specialist
    const specialists = [
      {
        id: "s-1",
        name: "Dr. Robert Williams",
        specialty: "Endocrinologist"
      },
      {
        id: "s-2",
        name: "Dr. Lisa Chen",
        specialty: "Cardiologist"
      },
      {
        id: "s-3",
        name: "Dr. James Thompson",
        specialty: "Hematologist"
      }
    ];
    
    const specialist = specialists.find(s => s.id === specialistId) || specialists[0];
    
    // Generate confirmation code
    const confirmationCode = `APPT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    return {
      success: true,
      data: {
        appointmentId: `appointment-${Date.now()}`,
        confirmationCode,
        specialist: specialist.name,
        date,
        time,
        isTelehealth: patientInfo.isTelehealth,
        instructions: patientInfo.isTelehealth
          ? "You will receive a link to join the telehealth appointment 24 hours before your scheduled time."
          : "Please arrive 15 minutes before your appointment time. Bring your insurance card and ID."
      },
      status: 201
    };
  }
  
  // Real API call for production
  return get<{
    appointmentId: string;
    confirmationCode: string;
    specialist: string;
    date: string;
    time: string;
    isTelehealth: boolean;
    instructions: string;
  }>(`/specialists/${specialistId}/book`, {
    date,
    time,
    ...patientInfo
  });
};
