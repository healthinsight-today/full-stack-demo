import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000')
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API Response (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      throw new Error('No response received from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Mock API Interceptor for development
if (process.env.NODE_ENV === 'development') {
  const mockAdapter = require('axios-mock-adapter');
  const mock = new mockAdapter(api, { delayResponse: 800 });
  
  // Mock responses for Auth API endpoints
  mock.onPost('/auth/login').reply(200, {
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: "123456",
        email: "demo@example.com",
        name: "Demo User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {},
        settings: {}
      },
      access_token: "mock_jwt_token_for_testing_purposes",
      token_type: "bearer",
      expires_in: 86400
    }
  });
  
  mock.onPost('/auth/signup').reply(200, {
    success: true,
    message: "User created successfully",
    data: {
      user: {
        id: "123456",
        email: "demo@example.com",
        name: "Demo User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {},
        settings: {}
      },
      access_token: "mock_jwt_token_for_testing_purposes",
      token_type: "bearer",
      expires_in: 86400
    }
  });
  
  mock.onGet('/auth/me').reply(200, {
    id: "123456",
    email: "demo@example.com",
    name: "Demo User",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {},
    settings: {}
  });
  
  // Mock responses for Diet API endpoints
  mock.onGet(/\/api\/v1\/diet\/meal-plan/).reply(200, {
    breakfast: [
      {
        name: "Steel-cut oatmeal with berries",
        description: "A nutritious breakfast rich in fiber and antioxidants",
        nutrients: {
          calories: 320,
          protein: 12,
          carbs: 45,
          fat: 9
        }
      },
      {
        name: "Greek yogurt with nuts and honey",
        description: "Protein-packed breakfast with healthy fats",
        nutrients: {
          calories: 280,
          protein: 18,
          carbs: 20,
          fat: 14
        }
      }
    ],
    lunch: [
      {
        name: "Grilled chicken salad with olive oil dressing",
        description: "Lean protein with mixed greens and healthy fats",
        nutrients: {
          calories: 420,
          protein: 35,
          carbs: 15,
          fat: 22
        }
      },
      {
        name: "Quinoa bowl with avocado and roasted vegetables",
        description: "Plant-based meal with complex carbs and healthy fats",
        nutrients: {
          calories: 450,
          protein: 15,
          carbs: 55,
          fat: 18
        }
      }
    ],
    dinner: [
      {
        name: "Baked salmon with sweet potato and asparagus",
        description: "Omega-3 rich meal with complex carbs and fiber",
        nutrients: {
          calories: 480,
          protein: 32,
          carbs: 38,
          fat: 20
        }
      },
      {
        name: "Turkey meatballs with zucchini noodles",
        description: "Lean protein with low-carb vegetable alternative",
        nutrients: {
          calories: 390,
          protein: 28,
          carbs: 18,
          fat: 22
        }
      }
    ],
    snacks: [
      {
        name: "Apple slices with almond butter",
        description: "Balanced snack with fiber and healthy fats",
        nutrients: {
          calories: 200,
          protein: 6,
          carbs: 22,
          fat: 12
        }
      },
      {
        name: "Greek yogurt with berries",
        description: "Protein-rich snack with antioxidants",
        nutrients: {
          calories: 150,
          protein: 15,
          carbs: 14,
          fat: 3
        }
      }
    ]
  });
  
  // Mock responses for Shopping API endpoints
  mock.onGet(/\/api\/v1\/shopping\/grocery-recommendations/).reply(200, {
    items: [
      {
        id: "g1",
        name: "Wild Salmon",
        category: "Protein",
        nutritionalBenefits: ["High in omega-3 fatty acids", "Quality protein source"],
        healthReason: "Helps lower cholesterol and supports heart health"
      },
      {
        id: "g2",
        name: "Spinach and Kale",
        category: "Vegetables",
        nutritionalBenefits: ["Rich in iron", "High in antioxidants", "Good source of folate"],
        healthReason: "Addresses mild anemia shown in your bloodwork"
      },
      {
        id: "g3",
        name: "Berries (Blueberries, Strawberries)",
        category: "Fruit",
        nutritionalBenefits: ["High in antioxidants", "Rich in fiber", "Low glycemic impact"],
        healthReason: "Supports healthy blood glucose levels"
      },
      {
        id: "g4",
        name: "Oats",
        category: "Grains",
        nutritionalBenefits: ["Contains beta-glucans", "Rich in soluble fiber"],
        healthReason: "Helps lower LDL cholesterol levels"
      },
      {
        id: "g5",
        name: "Extra Virgin Olive Oil",
        category: "Oils",
        nutritionalBenefits: ["Rich in monounsaturated fats", "Contains antioxidants"],
        healthReason: "Supports healthy cholesterol profile"
      }
    ]
  });
  
  // Mock responses for Insights API endpoints
  mock.onGet(/\/api\/v1\/insights/).reply(200, {
    insights: [
      {
        id: "insight-1",
        report_id: "report-1",
        title: "Vitamin D Deficiency",
        description: "Your vitamin D levels are below the recommended range.",
        severity: "moderate",
        category: "Vitamin D",
        related_parameters: ["Vitamin D"],
        details: "Low vitamin D can affect bone health and immune function.",
        recommendations: [
          "Consider a vitamin D3 supplement of 1000-2000 IU daily",
          "Increase sun exposure for 15-20 minutes daily",
          "Add vitamin D rich foods to your diet"
        ],
        possible_causes: [
          "Limited sun exposure",
          "Diet low in vitamin D rich foods",
          "Certain medications"
        ],
        action_required: true,
        created_at: "2023-05-15T14:30:00Z",
        updated_at: "2023-05-15T14:30:00Z"
      },
      {
        id: "insight-2",
        report_id: "report-1",
        title: "Elevated LDL Cholesterol",
        description: "Your LDL cholesterol is above the recommended range.",
        severity: "moderate",
        category: "Cholesterol",
        related_parameters: ["LDL Cholesterol"],
        details: "Elevated LDL cholesterol increases risk of cardiovascular disease.",
        recommendations: [
          "Limit saturated and trans fats in your diet",
          "Increase soluble fiber intake",
          "Consider regular moderate exercise"
        ],
        possible_causes: [
          "Diet high in saturated fats",
          "Sedentary lifestyle",
          "Genetic factors"
        ],
        action_required: true,
        created_at: "2023-05-15T14:32:00Z",
        updated_at: "2023-05-15T14:32:00Z"
      },
      {
        id: "insight-3",
        report_id: "report-1",
        title: "Optimal HDL Cholesterol",
        description: "Your HDL cholesterol is within the recommended range.",
        severity: "mild",
        category: "Cholesterol",
        related_parameters: ["HDL Cholesterol"],
        details: "Healthy HDL levels help protect against heart disease.",
        recommendations: [
          "Maintain current healthy habits",
          "Regular exercise helps maintain healthy HDL levels",
          "Include healthy fats in your diet"
        ],
        possible_causes: [
          "Healthy diet with adequate omega-3 fatty acids",
          "Regular physical activity",
          "Moderate alcohol consumption"
        ],
        action_required: false,
        created_at: "2023-05-15T14:35:00Z",
        updated_at: "2023-05-15T14:35:00Z"
      }
    ]
  });
  
  // Mock response for reports endpoint
  mock.onGet(/\/api\/v1\/health\/reports/).reply(200, {
    id: "report-123",
    user_id: "user-456",
    report_info: {
      report_id: "BT-2023-10-15-001",
      report_type: "Complete Blood Panel",
      report_date: "2023-10-15T09:30:00Z",
      lab_name: "HealthLabs Inc.",
      processing_timestamp: "2023-10-15T14:45:00Z"
    },
    patient_info: {
      name: "John Doe",
      patient_id: "P-10042",
      age: 42,
      gender: "Male",
      height: 175,
      weight: 78,
      blood_group: "O+"
    },
    insights: [
      {
        id: "insight-1",
        report_id: "report-123",
        title: "Vitamin D Deficiency",
        description: "Your vitamin D levels are below the recommended range.",
        severity: "moderate",
        category: "Vitamin D",
        related_parameters: ["Vitamin D"],
        details: "Low vitamin D can affect bone health and immune function.",
        recommendations: [
          "Consider a vitamin D3 supplement of 1000-2000 IU daily",
          "Increase sun exposure for 15-20 minutes daily",
          "Add vitamin D rich foods to your diet"
        ],
        possible_causes: [
          "Limited sun exposure",
          "Diet low in vitamin D rich foods",
          "Certain medications"
        ],
        action_required: true,
        created_at: "2023-05-15T14:30:00Z",
        updated_at: "2023-05-15T14:30:00Z"
      },
      {
        id: "insight-2",
        report_id: "report-123",
        title: "Elevated LDL Cholesterol",
        description: "Your LDL cholesterol is above the recommended range.",
        severity: "moderate",
        category: "Cholesterol",
        related_parameters: ["LDL Cholesterol"],
        details: "Elevated LDL cholesterol increases risk of cardiovascular disease.",
        recommendations: [
          "Limit saturated and trans fats in your diet",
          "Increase soluble fiber intake",
          "Consider regular moderate exercise"
        ],
        possible_causes: [
          "Diet high in saturated fats",
          "Sedentary lifestyle",
          "Genetic factors"
        ],
        action_required: true,
        created_at: "2023-05-15T14:32:00Z",
        updated_at: "2023-05-15T14:32:00Z"
      }
    ],
    status: "completed",
    created_at: "2023-10-15T10:00:00Z",
    updated_at: "2023-10-15T15:30:00Z"
  });
  
  // Add mock for /api/v1/reports endpoint
  mock.onGet(/\/api\/v1\/reports/).reply((config: { url?: string }) => {
    // Check if it's a specific report request like /reports/report-123
    const reportIdMatch = config.url?.match(/\/api\/v1\/reports\/([\w-]+)/);
    
    if (reportIdMatch) {
      // This is a request for a specific report
      const reportId = reportIdMatch[1];
      
      return [
        200,
        {
          id: reportId,
          user_id: "user-456",
          report_info: {
            report_id: reportId === "report-123" ? "BT-2023-10-15-001" : "BT-2023-11-20-002",
            report_type: reportId === "report-123" ? "Complete Blood Panel" : "Lipid Panel",
            report_date: reportId === "report-123" ? "2023-10-15T09:30:00Z" : "2023-11-20T10:15:00Z",
            lab_name: "HealthLabs Inc.",
            processing_timestamp: reportId === "report-123" ? "2023-10-15T14:45:00Z" : "2023-11-20T16:30:00Z"
          },
          patient_info: {
            name: "John Doe",
            patient_id: "P-10042",
            age: 42,
            gender: "Male",
            height: 175,
            weight: 78,
            blood_group: "O+"
          },
          insights: [
            {
              id: "insight-1",
              report_id: reportId,
              title: "Vitamin D Deficiency",
              description: "Your vitamin D levels are below the recommended range.",
              severity: "moderate",
              category: "Vitamin D",
              related_parameters: ["Vitamin D"],
              details: "Low vitamin D can affect bone health and immune function.",
              recommendations: [
                "Consider a vitamin D3 supplement of 1000-2000 IU daily",
                "Increase sun exposure for 15-20 minutes daily",
                "Add vitamin D rich foods to your diet"
              ],
              possible_causes: [
                "Limited sun exposure",
                "Diet low in vitamin D rich foods",
                "Certain medications"
              ],
              action_required: true,
              created_at: "2023-05-15T14:30:00Z",
              updated_at: "2023-05-15T14:30:00Z"
            },
            {
              id: "insight-2",
              report_id: reportId,
              title: "Elevated LDL Cholesterol",
              description: "Your LDL cholesterol is above the recommended range.",
              severity: "moderate",
              category: "Cholesterol",
              related_parameters: ["LDL Cholesterol"],
              details: "Elevated LDL cholesterol increases risk of cardiovascular disease.",
              recommendations: [
                "Limit saturated and trans fats in your diet",
                "Increase soluble fiber intake",
                "Consider regular moderate exercise"
              ],
              possible_causes: [
                "Diet high in saturated fats",
                "Sedentary lifestyle",
                "Genetic factors"
              ],
              action_required: true,
              created_at: "2023-05-15T14:32:00Z",
              updated_at: "2023-05-15T14:32:00Z"
            }
          ],
          status: "completed",
          created_at: reportId === "report-123" ? "2023-10-15T10:00:00Z" : "2023-11-20T11:00:00Z",
          updated_at: reportId === "report-123" ? "2023-10-15T15:30:00Z" : "2023-11-20T16:45:00Z"
        }
      ];
    }
    
    // Otherwise, return the list of reports
    return [
      200,
      [
        {
          id: "report-123",
          user_id: "user-456",
          report_info: {
            report_id: "BT-2023-10-15-001",
            report_type: "Complete Blood Panel",
            report_date: "2023-10-15T09:30:00Z",
            lab_name: "HealthLabs Inc.",
            processing_timestamp: "2023-10-15T14:45:00Z"
          },
          patient_info: {
            name: "John Doe",
            patient_id: "P-10042",
            age: 42,
            gender: "Male"
          },
          status: "completed",
          created_at: "2023-10-15T10:00:00Z",
          updated_at: "2023-10-15T15:30:00Z"
        },
        {
          id: "report-124",
          user_id: "user-456",
          report_info: {
            report_id: "BT-2023-11-20-002",
            report_type: "Lipid Panel",
            report_date: "2023-11-20T10:15:00Z",
            lab_name: "HealthLabs Inc.",
            processing_timestamp: "2023-11-20T16:30:00Z"
          },
          patient_info: {
            name: "John Doe",
            patient_id: "P-10042",
            age: 42,
            gender: "Male"
          },
          status: "completed",
          created_at: "2023-11-20T11:00:00Z",
          updated_at: "2023-11-20T16:45:00Z"
        }
      ]
    ];
  });
  
  // Mock response for report upload
  mock.onPost('/api/v1/reports/upload').reply(200, {
    id: "report-125",
    user_id: "user-456",
    report_info: {
      report_id: "BT-2024-05-10-003",
      report_type: "Blood Chemistry Panel",
      report_date: "2024-05-10T08:45:00Z",
      lab_name: "HealthLabs Inc.",
      processing_timestamp: "2024-05-10T12:30:00Z"
    },
    patient_info: {
      name: "John Doe",
      patient_id: "P-10042",
      age: 42,
      gender: "Male"
    },
    status: "processing",
    created_at: "2024-05-10T09:15:00Z",
    updated_at: "2024-05-10T09:15:00Z"
  });
  
  // Additional mock endpoints can be added as needed
}

// Export the API instance
export const apiInstance = api;

// Services that use the API
export const apiService = {
  getInstance: () => api,
  
  // GET request
  async get(endpoint: string, params: Record<string, any> = {}) {
    return api.get(endpoint, { params });
  },

  // POST request
  async post(endpoint: string, data = {}) {
    return api.post(endpoint, data);
  },

  // PUT request
  async put(endpoint: string, data = {}) {
    return api.put(endpoint, data);
  },

  // PATCH request
  async patch(endpoint: string, data = {}) {
    return api.patch(endpoint, data);
  },

  // DELETE request
  async delete(endpoint: string) {
    return api.delete(endpoint);
  },

  // Handle file uploads
  async upload(endpoint: string, file: File, onUploadProgress?: (progressEvent: any) => void) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Multi-file upload with additional data
  async uploadMultiple(endpoint: string, files: File[], additionalData: Record<string, any> = {}, onUploadProgress?: (progressEvent: any) => void) {
    const formData = new FormData();
    
    // Append each file to form data
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }
};

export default apiService; 