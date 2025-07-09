#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting development environment...${NC}"

# Function to kill all background processes when script exits
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start Frontend (Next.js) in its own subprocess
echo -e "${GREEN}📱 Starting Frontend (Next.js)...${NC}"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Start Backend (NestJS) in its own subprocess
echo -e "${GREEN}🏗️ Starting Backend (NestJS)...${NC}"
(cd backend && npm run start:dev) &
BACKEND_PID=$!

# Start Prisma Studio in its own subprocess (from backend directory)
echo -e "${GREEN}🗄️ Starting Prisma Studio...${NC}"
(cd backend && npx prisma studio) &
PRISMA_PID=$!

echo -e "${BLUE}✅ All services started!${NC}"
echo -e "${YELLOW}📋 Services running:${NC}"
echo -e "  • Frontend: http://localhost:3000"
echo -e "  • Backend: http://localhost:7532 (or your configured port)"
echo -e "  • Prisma Studio: http://localhost:5555"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait 