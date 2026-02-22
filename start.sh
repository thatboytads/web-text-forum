#!/bin/bash

echo "Starting TruthForum Application..."

# Start backend server
echo "Starting backend server on port 8000..."
cd "$(dirname "$0")"
source venv/bin/activate 2>/dev/null || python -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 4200..."
cd frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ TruthForum is running!"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

