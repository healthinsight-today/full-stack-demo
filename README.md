# Health Analysis API

A FastAPI-based backend service for analyzing medical blood test reports using advanced language models.

## Features

- **PDF/Image Processing**: Extract text from uploaded medical reports
- **LLM Analysis**: Use Claude, Grok, and other LLM providers to analyze medical test results
- **Standardized Output**: Convert diverse medical report formats into structured JSON
- **Health Insights**: Get detailed insights and recommendations based on test results
- **API Endpoints**: RESTful endpoints for report management and analysis
- **Personalized Recommendations**: Get diet plans, shopping lists, and specialist referrals based on analysis
- **Authentication**: JWT-based user authentication system with login, signup, and user profile endpoints

## API Endpoints

### Authentication
- `POST /api/v1/auth/login`: Login with email and password to receive a JWT token
- `POST /api/v1/auth/signup`: Create a new user account
- `GET /api/v1/auth/me`: Get current authenticated user information
- `POST /api/v1/auth/login/form`: OAuth2 compatible token login for use with Swagger UI

### Health Analysis
- `POST /api/v1/health/analyze/mcp`: Upload and analyze a medical report using an LLM
- `GET /api/v1/health/providers`: List available LLM providers and their status

### Reports Management
- `GET /api/v1/health/reports`: List all saved reports
- `GET /api/v1/health/reports/{run_id}`: Get full report details by ID
- `POST /api/v1/health/save`: Save a report to disk

### Analysis Components
- `GET /api/v1/health/reports/{run_id}/insights`: Get health insights from a report
- `GET /api/v1/health/reports/{run_id}/recommendations`: Get all recommendations from a report
- `GET /api/v1/health/reports/{run_id}/parameters/abnormal`: Get abnormal parameters from a report

### Diet and Nutrition
- `GET /api/v1/diet/meal-plan?run_id={run_id}&preferences={preferences}`: Get personalized meal plan based on health analysis

### Shopping Recommendations
- `GET /api/v1/shopping/grocery-recommendations?run_id={run_id}&location={location}`: Get personalized grocery recommendations based on health analysis

### Healthcare Specialists
- `GET /api/v1/specialists?run_id={run_id}&specialty={specialty}&location={location}`: Get healthcare specialist recommendations based on health analysis

## Setup Instructions

### Prerequisites
- Python 3.9+
- Tesseract OCR (for image and PDF processing)
- API keys for LLM providers (Claude, Grok, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/health-analysis-api.git
   cd health-analysis-api
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage Examples

### Authentication

#### Login with demo credentials
```bash
curl -X POST 'http://127.0.0.1:8000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email": "demo@example.com", "password": "password"}'
```

#### Create a new user account
```bash
curl -X POST 'http://127.0.0.1:8000/api/v1/auth/signup' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "password123", "name": "New User"}'
```

#### Get current user profile (requires auth token)
```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/auth/me' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Analyze a Medical Report

```bash
curl -X POST 'http://127.0.0.1:8000/api/v1/health/analyze/mcp' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@bloodreport.pdf' \
  -F 'provider=claude' \
  -F 'model=claude-3-7-sonnet-20250219'
```

### Get Health Insights

```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/health/reports/{run_id}/insights' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Get Recommendations

```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/health/reports/{run_id}/recommendations' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Get a Personalized Meal Plan

```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/diet/meal-plan?run_id={run_id}&preferences=vegetarian,low-carb' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Get Grocery Recommendations

```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/shopping/grocery-recommendations?run_id={run_id}&location=Boston,MA' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Find Specialists in Your Area

```bash
curl -X GET 'http://127.0.0.1:8000/api/v1/specialists?run_id={run_id}&specialty=cardiologist&location=New York' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Project Structure

```
app/
├── main.py                  # Main FastAPI application
├── config.py                # Configuration settings
├── routes/
│   ├── __init__.py
│   ├── auth.py              # Authentication endpoints
│   ├── health_analysis.py   # Health analysis endpoints
│   ├── diet.py              # Diet and meal planning endpoints
│   ├── shopping.py          # Shopping recommendations endpoints
│   ├── specialists.py       # Healthcare specialist endpoints
│   └── ...
├── services/
│   ├── document_processor/  # Document processing services
│   ├── llm_providers/       # LLM integration services
│   ├── diet_service.py      # Diet recommendation service
│   ├── grocery_service.py   # Grocery recommendation service
│   ├── specialist_service.py # Specialist recommendation service
│   └── ...
├── models/
│   ├── schemas.py           # Pydantic models including auth models
│   └── ...
├── utils/
│   ├── auth.py              # Authentication utilities
│   └── ...
└── ...
```

## Demo User Credentials

For testing purposes, you can use these demo credentials:
- **Email**: demo@example.com
- **Password**: password

## Future Work

- MongoDB integration for report storage
- Enhanced user authentication with email verification
- Role-based access control
- Additional LLM providers
- Advanced visualization of health trends
- Expanded health insights with peer-reviewed medical references
- AI-powered diet, shopping, and specialist recommendations

## License

MIT License - See LICENSE file for details