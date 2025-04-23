#!/bin/bash

# This script starts both the frontend and backend servers for development

echo "Starting Health Insight Today Development Servers"
echo "================================================="

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a program is installed
check_dependency() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is required but not installed.${NC}"
    exit 1
  fi
}

# Check dependencies
check_dependency "node"
check_dependency "python3"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend server
echo -e "${BLUE}Starting FastAPI backend server...${NC}"
cd fastAPI || { echo -e "${RED}Error: fastAPI directory not found${NC}"; exit 1; }

# Check for Python virtual environment
if [ ! -d "venv" ]; then
  echo -e "${BLUE}Creating Python virtual environment...${NC}"
  python3 -m venv venv || { echo -e "${RED}Error: Failed to create virtual environment${NC}"; exit 1; }
  echo -e "${GREEN}Virtual environment created.${NC}"
fi

# Activate virtual environment and install dependencies
echo -e "${BLUE}Installing/updating backend dependencies...${NC}"
source venv/bin/activate || { echo -e "${RED}Error: Failed to activate virtual environment${NC}"; exit 1; }
pip install -r requirements.txt || { echo -e "${RED}Error: Failed to install backend dependencies${NC}"; exit 1; }

# Start backend in background
echo -e "${BLUE}Starting FastAPI backend at http://localhost:8000${NC}"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Navigate back to root directory
cd ..

# Start frontend server
echo -e "${BLUE}Installing/updating frontend dependencies...${NC}"
npm install || { echo -e "${RED}Error: Failed to install frontend dependencies${NC}"; kill $BACKEND_PID; exit 1; }

echo -e "${BLUE}Starting React frontend at http://localhost:3000${NC}"
npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"

# Write PIDs to file for stop script
echo "$BACKEND_PID $FRONTEND_PID" > .dev_pids

echo -e "${GREEN}Both servers are now running!${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API: ${GREEN}http://localhost:8000/api/v1${NC}"
echo -e "API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "Log files are in the ${BLUE}logs/${NC} directory."
echo "================================================="
echo -e "Press ${BLUE}Ctrl+C${NC} to stop both servers."

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; rm .dev_pids; echo -e '${RED}Servers stopped.${NC}'" INT
wait 