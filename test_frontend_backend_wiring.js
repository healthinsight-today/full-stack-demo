/**
 * Test script to verify frontend-backend integration
 * 
 * This script tests key API endpoints to ensure the frontend can
 * successfully communicate with the backend.
 * 
 * Usage:
 * 1. Start the backend: cd backendapi && python -m uvicorn app.main:app --reload --port 8000
 * 2. Run this script: node test_frontend_backend_wiring.js
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Base URL for the API
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Set up axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Store the access token for authenticated requests
let ACCESS_TOKEN = '';

/**
 * Test authentication
 */
async function testAuthentication() {
  console.log('\n----- Testing Authentication -----\n');
  
  try {
    // Test login endpoint
    console.log('Testing login with demo credentials...');
    const loginResponse = await api.post('/auth/login', {
      email: 'demo@example.com',
      password: 'password'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      ACCESS_TOKEN = loginResponse.data.data.access_token;
      console.log(`Token: ${ACCESS_TOKEN.slice(0, 20)}...`);
      
      // Set auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
      
      // Test /me endpoint
      console.log('\nTesting fetch current user...');
      const userResponse = await api.get('/auth/me');
      console.log('✅ User data fetched successfully');
      console.log(`User: ${userResponse.data.name} (${userResponse.data.email})`);
    } else {
      console.log('❌ Login failed');
      console.log(loginResponse.data);
    }
  } catch (error) {
    console.log('❌ Authentication test failed');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Test report upload and analysis
 */
async function testReportUpload() {
  console.log('\n----- Testing Report Upload -----\n');
  
  try {
    // Check for auth token
    if (!ACCESS_TOKEN) {
      console.log('❌ No auth token available. Please run authentication test first.');
      return;
    }
    
    // Use a sample PDF for testing
    const samplePath = 'sample_report.pdf';
    
    // Check if sample file exists
    if (!fs.existsSync(samplePath)) {
      console.log('❌ Sample report file not found. Creating a text file for testing...');
      
      // Create a simple text file for testing
      fs.writeFileSync('sample_report.txt', 'This is a sample medical report for testing purposes.');
      console.log('✅ Created sample_report.txt for testing');
    }
    
    // Upload the file
    console.log('Uploading document...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(fs.existsSync(samplePath) ? samplePath : 'sample_report.txt'));
    
    const uploadResponse = await axios.post(
      `${API_BASE_URL}/documents/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    if (uploadResponse.status === 200) {
      console.log('✅ Document upload successful');
      const documentId = uploadResponse.data.id;
      console.log(`Document ID: ${documentId}`);
      
      // Analyze the document
      console.log('\nAnalyzing document...');
      const analyzeFormData = new FormData();
      analyzeFormData.append('file', fs.createReadStream(fs.existsSync(samplePath) ? samplePath : 'sample_report.txt'));
      analyzeFormData.append('provider', 'claude');
      analyzeFormData.append('model', 'claude-3-7-sonnet-20250219');
      
      const analyzeResponse = await axios.post(
        `${API_BASE_URL}/health/analyze-report-with-mcp`,
        analyzeFormData,
        {
          headers: {
            ...analyzeFormData.getHeaders(),
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          }
        }
      );
      
      if (analyzeResponse.status === 200) {
        console.log('✅ Document analysis started');
        const runId = analyzeResponse.data.run_id;
        console.log(`Run ID: ${runId}`);
        
        // Check status a few times
        console.log('\nChecking analysis status...');
        let status = 'processing';
        let attempts = 0;
        const maxAttempts = 3;
        
        while (status === 'processing' && attempts < maxAttempts) {
          attempts++;
          try {
            const statusResponse = await api.get(`/health/reports/${runId}/status`);
            status = statusResponse.data.status;
            console.log(`Attempt ${attempts}: Status - ${status}`);
            
            if (status !== 'completed') {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
          } catch (error) {
            console.log(`❌ Error checking status (attempt ${attempts})`);
            console.error(error.response?.data || error.message);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          }
        }
        
        if (status === 'completed') {
          console.log('✅ Document analysis completed');
          
          // Try to fetch insights
          try {
            console.log('\nFetching insights...');
            const insightsResponse = await api.get(`/health/reports/${runId}/insights`);
            console.log('✅ Insights fetched successfully');
            console.log(`Found ${insightsResponse.data.length} insights`);
          } catch (error) {
            console.log('❌ Error fetching insights');
            console.error(error.response?.data || error.message);
          }
          
          // Try to fetch recommendations
          try {
            console.log('\nFetching recommendations...');
            const recommendationsResponse = await api.get(`/health/reports/${runId}/recommendations`);
            console.log('✅ Recommendations fetched successfully');
            console.log(`Found ${recommendationsResponse.data.recommendations.length} recommendations`);
          } catch (error) {
            console.log('❌ Error fetching recommendations');
            console.error(error.response?.data || error.message);
          }
          
          // Try to fetch abnormal parameters
          try {
            console.log('\nFetching abnormal parameters...');
            const abnormalResponse = await api.get(`/health/reports/${runId}/parameters/abnormal`);
            console.log('✅ Abnormal parameters fetched successfully');
            console.log(`Found ${abnormalResponse.data.parameters.length} abnormal parameters`);
          } catch (error) {
            console.log('❌ Error fetching abnormal parameters');
            console.error(error.response?.data || error.message);
          }
        } else {
          console.log(`❓ Analysis still in progress or failed after ${maxAttempts} attempts`);
        }
      } else {
        console.log('❌ Document analysis failed');
        console.log(analyzeResponse.data);
      }
    } else {
      console.log('❌ Document upload failed');
      console.log(uploadResponse.data);
    }
  } catch (error) {
    console.log('❌ Report upload test failed');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================');
  console.log('  FRONTEND-BACKEND WIRING TEST');
  console.log('=================================\n');
  
  try {
    await testAuthentication();
    await testReportUpload();
    
    console.log('\n=================================');
    console.log('  TEST COMPLETED');
    console.log('=================================\n');
  } catch (error) {
    console.error('Unhandled error during tests:');
    console.error(error);
  }
}

// Run the tests
runTests(); 