/**
 * Test script for medical report upload and processing
 * 
 * This script tests the upload and processing of multiple medical report formats
 * to ensure the system handles various types of medical reports correctly.
 * 
 * Usage:
 * 1. Start the backend server
 * 2. Run this script: node test_report_upload.js
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { execSync } = require('child_process');

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
async function authenticate() {
  console.log('\n----- Authenticating -----\n');
  
  try {
    // Test login endpoint
    console.log('Logging in with demo credentials...');
    const loginResponse = await api.post('/auth/login', {
      email: 'demo@example.com',
      password: 'password'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      ACCESS_TOKEN = loginResponse.data.data.access_token;
      
      // Set auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
      return true;
    } else {
      console.log('❌ Login failed');
      console.log(loginResponse.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication failed');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Upload and process a medical report
 */
async function uploadAndProcessReport(reportPath, description) {
  try {
    if (!fs.existsSync(reportPath)) {
      console.log(`❌ Report file not found: ${reportPath}`);
      return null;
    }

    console.log(`\nUploading report: ${reportPath}`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(reportPath));
    
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
      console.log('Analyzing document...');
      const analyzeFormData = new FormData();
      analyzeFormData.append('file', fs.createReadStream(reportPath));
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
        console.log('Checking analysis status...');
        let status = 'processing';
        let attempts = 0;
        const maxAttempts = 5;
        
        while (status === 'processing' && attempts < maxAttempts) {
          attempts++;
          try {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            const statusResponse = await api.get(`/health/reports/${runId}/status`);
            status = statusResponse.data.status;
            const progress = statusResponse.data.progress || 'unknown';
            console.log(`Attempt ${attempts}: Status - ${status}, Progress: ${progress}%`);
            
            if (status !== 'completed') {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
          } catch (error) {
            console.log(`❌ Error checking status (attempt ${attempts})`);
            console.error(error.response?.data || error.message);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          }
        }
        
        return runId;
      } else {
        console.log('❌ Document analysis failed');
        console.log(analyzeResponse.data);
        return null;
      }
    } else {
      console.log('❌ Document upload failed');
      console.log(uploadResponse.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Report upload failed');
    console.error(error.response?.data || error.message);
    return null;
  }
}

/**
 * Verify report data extraction was successful
 */
async function verifyReportData(runId, reportType) {
  console.log(`\n----- Verifying data extraction for ${reportType} report -----`);
  
  try {
    // 1. Fetch insights
    console.log('\nFetching insights...');
    try {
      const insightsResponse = await api.get(`/health/reports/${runId}/insights`);
      const insightsCount = insightsResponse.data.length || 0;
      console.log(`✅ Retrieved ${insightsCount} insights`);
    } catch (error) {
      console.log('❌ Error fetching insights');
      console.error(error.response?.data || error.message);
    }
    
    // 2. Fetch recommendations
    console.log('\nFetching recommendations...');
    try {
      const recommendationsResponse = await api.get(`/health/reports/${runId}/recommendations`);
      const recommendationsCount = recommendationsResponse.data.recommendations?.length || 0;
      console.log(`✅ Retrieved ${recommendationsCount} recommendations`);
    } catch (error) {
      console.log('❌ Error fetching recommendations');
      console.error(error.response?.data || error.message);
    }
    
    // 3. Fetch abnormal parameters
    console.log('\nFetching abnormal parameters...');
    try {
      const abnormalResponse = await api.get(`/health/reports/${runId}/parameters/abnormal`);
      const abnormalCount = abnormalResponse.data.parameters?.length || 0;
      console.log(`✅ Retrieved ${abnormalCount} abnormal parameters`);
      
      // Log a few parameters for verification
      if (abnormalCount > 0) {
        const sampleParams = abnormalResponse.data.parameters.slice(0, 3);
        console.log('Sample abnormal parameters:');
        sampleParams.forEach(param => {
          console.log(`- ${param.name}: ${param.value} ${param.unit} [Reference: ${param.reference_range}]`);
        });
      }
    } catch (error) {
      console.log('❌ Error fetching abnormal parameters');
      console.error(error.response?.data || error.message);
    }
    
    // 4. Get the full report data
    console.log('\nFetching full report data...');
    try {
      const reportResponse = await api.get(`/health/reports/${runId}`);
      console.log('✅ Successfully retrieved full report data');
      
      // Output relevant metadata for verification
      const reportData = reportResponse.data;
      console.log('Report metadata:');
      console.log(`- Patient: ${reportData.patient_info?.name || 'Unknown'}`);
      console.log(`- Date: ${reportData.report_info?.report_date || 'Unknown'}`);
      console.log(`- Type: ${reportData.report_info?.report_type || 'Unknown'}`);
      console.log(`- Provider: ${reportData.report_info?.provider || 'Unknown'}`);
      
      // For pediatric reports, check if age data is correctly parsed
      if (reportType === 'Pediatric') {
        console.log(`- Patient age: ${reportData.patient_info?.age || 'Unknown'}`);
        
        // Check if growth parameters were extracted (pediatric specific)
        const hasGrowthData = reportData.growth_parameters && 
          (reportData.growth_parameters.height || 
           reportData.growth_parameters.weight || 
           reportData.growth_parameters.bmi);
           
        if (hasGrowthData) {
          console.log('✅ Growth parameters correctly extracted');
          console.log(`- Weight: ${reportData.growth_parameters.weight || 'Unknown'}`);
          console.log(`- Height: ${reportData.growth_parameters.height || 'Unknown'}`);
          console.log(`- BMI: ${reportData.growth_parameters.bmi || 'Unknown'}`);
        } else {
          console.log('❌ No growth parameters found in pediatric report');
        }
      }
      
      // For obstetric reports, check if pregnancy-specific data is correctly parsed
      if (reportType === 'Obstetric') {
        console.log(`- Gestational age: ${reportData.pregnancy_info?.gestational_age || 'Unknown'}`);
        
        // Check if pregnancy-specific data was extracted
        const hasPregnancyData = reportData.pregnancy_info && 
          (reportData.pregnancy_info.gestational_age || 
           reportData.pregnancy_info.edd || 
           reportData.pregnancy_info.gravida_para);
           
        if (hasPregnancyData) {
          console.log('✅ Pregnancy-specific data correctly extracted');
          console.log(`- EDD: ${reportData.pregnancy_info.edd || 'Unknown'}`);
          console.log(`- Gravida/Para: ${reportData.pregnancy_info.gravida_para || 'Unknown'}`);
          console.log(`- Fetal heart rate: ${reportData.pregnancy_info.fetal_heart_rate || 'Unknown'}`);
        } else {
          console.log('❌ No pregnancy-specific data found in obstetric report');
        }
      }
    } catch (error) {
      console.log('❌ Error fetching full report');
      console.error(error.response?.data || error.message);
    }
  } catch (error) {
    console.log('❌ Verification failed');
    console.error(error);
  }
}

/**
 * Test TypeScript compilation
 */
async function testTypeScriptCompilation() {
  console.log('\n----- Testing TypeScript Compilation -----\n');
  
  try {
    console.log('Running TypeScript compilation check...');
    // Use tsc to check for errors without emitting files
    const result = execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
    console.log(error.stdout.toString());
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================');
  console.log('  MEDICAL REPORT UPLOAD TEST');
  console.log('=================================\n');
  
  try {
    // Test TypeScript compilation first
    await testTypeScriptCompilation();
    
    // Authenticate
    const authenticated = await authenticate();
    if (!authenticated) {
      console.log('Cannot proceed with tests due to authentication failure');
      return;
    }
    
    // Test with different report types
    const reports = [
      { path: 'sample_report.txt', type: 'General Medical' },
      { path: 'sample_report_2.txt', type: 'Cardiac' },
      { path: 'sample_report_3.txt', type: 'Neurological' },
      { path: 'sample_report_4_pediatric.txt', type: 'Pediatric' },
      { path: 'sample_report_5_obstetric.txt', type: 'Obstetric' }
    ];
    
    for (const report of reports) {
      console.log(`\n=================================`);
      console.log(`  TESTING ${report.type.toUpperCase()} REPORT`);
      console.log(`=================================`);
      
      const runId = await uploadAndProcessReport(report.path, `Test ${report.type} Report`);
      
      if (runId) {
        await verifyReportData(runId, report.type);
      } else {
        console.log(`❌ Couldn't get run ID for ${report.type} report, skipping verification`);
      }
    }
    
    console.log('\n=================================');
    console.log('  ALL TESTS COMPLETED');
    console.log('=================================\n');
  } catch (error) {
    console.error('Unhandled error during tests:');
    console.error(error);
  }
}

// Run the tests
runTests(); 