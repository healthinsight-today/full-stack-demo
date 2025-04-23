#!/bin/bash

# This script stops the development servers started by start-dev.sh

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Stopping Health Insight Today Development Servers"
echo "================================================="

# Check if PID file exists
if [ ! -f .dev_pids ]; then
  echo -e "${RED}Error: No running development servers found.${NC}"
  echo "If the servers are running, you need to stop them manually."
  exit 1
fi

# Read PIDs from file
read -r BACKEND_PID FRONTEND_PID < .dev_pids

# Stop processes
echo "Stopping servers..."

# Stop frontend
if ps -p $FRONTEND_PID > /dev/null; then
  kill $FRONTEND_PID
  echo -e "${GREEN}Frontend server stopped.${NC}"
else
  echo -e "${RED}Frontend server (PID: $FRONTEND_PID) not found.${NC}"
fi

# Stop backend
if ps -p $BACKEND_PID > /dev/null; then
  kill $BACKEND_PID
  echo -e "${GREEN}Backend server stopped.${NC}"
else
  echo -e "${RED}Backend server (PID: $BACKEND_PID) not found.${NC}"
fi

# Remove PID file
rm .dev_pids

echo -e "${GREEN}All development servers stopped.${NC}"
echo "=================================================" 