# Frontend-Backend Integration Test

This README provides instructions for running the frontend-backend integration test script (`test_frontend_backend_wiring.js`), which verifies the correct wiring between the Trae AI frontend and backend components.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API running on localhost:8000
- Required npm packages: axios, form-data

## Setup

1. Ensure the backend is running:
   ```
   cd backendapi && python -m uvicorn app.main:app --reload --port 8000
   ```

2. Install the required Node.js dependencies:
   ```
   npm install axios form-data
   ```

3. Optionally, place a sample PDF file named `sample_report.pdf` in the same directory as the test script. If this file is not present, the test will create a simple text file for testing purposes.

## Running the Test

Run the test using Node.js:

```
node test_frontend_backend_wiring.js
```

## What the Test Covers

The test script verifies:

1. **Authentication Flow**
   - Login functionality using demo credentials (demo@example.com)
   - Token retrieval and storage
   - Access to authenticated endpoints (/auth/me)

2. **Document Upload and Analysis**
   - Uploading documents to the backend
   - Initiating document analysis
   - Monitoring analysis status
   - Retrieving analysis results, including:
     - Insights
     - Recommendations
     - Abnormal parameters

## Test Output

The test produces console output that shows:
- ✅ Successful operations
- ❌ Failed operations
- Detailed error messages for troubleshooting

## Troubleshooting

If you encounter issues:

1. **Authentication Failures**
   - Verify the backend is running on port 8000
   - Check if the demo credentials have been changed
   - Ensure the `/auth/login` endpoint is accessible

2. **Upload Failures**
   - Check that the backend storage is properly configured
   - Verify you have sufficient permissions for file operations

3. **Analysis Failures**
   - Ensure the AI analysis services are operational
   - Check that the configured AI model (claude-3-7-sonnet-20250219) is available
   - The test only checks status a few times; analysis might still be running

4. **Connection Issues**
   - Verify the API_BASE_URL in the script matches your backend configuration
   - Check for network issues or firewalls blocking requests

## Extending the Tests

To add more test cases:
1. Create new test functions in the script
2. Add your test function calls to the `runTests()` function
3. Ensure proper error handling and reporting 