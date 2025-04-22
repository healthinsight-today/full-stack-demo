import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// API service with methods for common requests
export const apiService = {
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
};

export default apiService; 