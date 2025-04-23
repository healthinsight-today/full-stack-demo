#!/bin/bash

# Script to properly set up environment files for the application

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up environment files for HealthInsightToday...${NC}"

# Create frontend .env file
echo -e "${BLUE}Creating frontend .env file...${NC}"
cat > .env << EOF
# Frontend environment variables
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development

# API timeout in milliseconds
REACT_APP_API_TIMEOUT=30000
EOF

# Create backend .env file
echo -e "${BLUE}Creating backend .env file...${NC}"
mkdir -p fastAPI
cat > fastAPI/.env << EOF
# Backend environment variables
ENV=development
DEBUG=true
PORT=8000
HOST=0.0.0.0

# CORS settings
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
CORS_ALLOW_CREDENTIALS=true

# Logging
LOG_LEVEL=INFO

# File storage paths
UPLOAD_DIR=uploads
TEXT_DIR=text
PROCESSED_DIR=processed
REPORTS_DIR=reports
EOF

# Create required directories
echo -e "${BLUE}Creating required directories...${NC}"
mkdir -p fastAPI/uploads fastAPI/text fastAPI/processed fastAPI/reports logs

# Make scripts executable
echo -e "${BLUE}Making start scripts executable...${NC}"
chmod +x start-dev.sh stop-dev.sh

echo -e "${GREEN}Environment setup complete!${NC}"
echo -e "You can now run ${BLUE}./start-dev.sh${NC} to start the application" 