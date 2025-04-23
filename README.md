# HealthInsightToday Full-Stack Demo

A full-stack application that helps users understand their health data through AI-powered analysis and visualization.

## Features

- Modern React frontend with responsive UI
- FastAPI backend for efficient data processing
- Report analysis using AI
- Interactive data visualization
- User authentication
- Responsive design

## Prerequisites

- Node.js v14 or higher
- Python 3.8 or higher
- pip

## Quick Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/full-stack-demo.git
cd full-stack-demo
```

2. Run the setup script
```bash
./setup-env.sh
```

3. Start the development servers
```bash
./start-dev.sh
```

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:8000.

To stop the servers:
```bash
./stop-dev.sh
```

## Manual Setup

### Frontend (React)

1. Install dependencies
```bash
npm install
```

2. Create `.env` file
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
REACT_APP_API_TIMEOUT=30000
```

3. Start development server
```bash
npm start
```

### Backend (FastAPI)

1. Create and activate virtual environment
```bash
cd fastAPI
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Create `.env` file
```
ENV=development
DEBUG=true
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
CORS_ALLOW_CREDENTIALS=true
LOG_LEVEL=INFO
UPLOAD_DIR=uploads
TEXT_DIR=text
PROCESSED_DIR=processed
REPORTS_DIR=reports
```

4. Start development server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

- `src/` - Frontend React application
  - `components/` - Reusable UI components
  - `context/` - React context providers
  - `hooks/` - Custom React hooks
  - `pages/` - Application pages
  - `services/` - API service layers
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions

- `fastAPI/` - Backend FastAPI application
  - `app/` - Main application package
    - `routes/` - API endpoints
    - `services/` - Business logic services
    - `models/` - Data models
    - `utils/` - Utility functions
    - `config.py` - Application configuration
    - `main.py` - Application entry point

## API Documentation

When the backend is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT
