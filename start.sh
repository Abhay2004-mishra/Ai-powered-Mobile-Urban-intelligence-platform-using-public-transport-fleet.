#!/bin/bash

echo "🚀 Starting UrbanEye AI — Smart City Command Platform..."

# Activate backend virtualenv and start FastAPI server
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start React Frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ UrbanEye AI is running!"
echo "   - Command Center Dashboard: http://localhost:3000"
echo "   - FastAPI OpenAPI Documentation: http://localhost:8000/docs"
echo "Press CTRL+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
