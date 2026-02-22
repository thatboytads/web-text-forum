#!/bin/bash

# TruthForum - Complete Demo Script
# This script demonstrates the full application setup and usage

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🎉 TruthForum Complete Setup & Demo"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
check_backend() {
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if frontend is running
check_frontend() {
    if curl -s http://localhost:4200 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo "📋 Checking prerequisites..."
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 is installed"
else
    echo "❌ Python3 is not installed"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed ($(node --version))"
else
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm is installed ($(npm --version))"
else
    echo "❌ npm is not installed"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📦 Installation"
echo "════════════════════════════════════════════════════════════"
echo ""

# Backend setup
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Installing backend dependencies..."
source .venv/bin/activate
pip install -q -r requirements.txt
echo "✅ Backend dependencies installed"

# Frontend setup
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🚀 Starting Servers"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if servers are already running
if check_backend; then
    echo "✅ Backend is already running on port 8000"
else
    echo "Starting backend server..."
    echo "   Command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo "   Run this in a separate terminal:"
    echo ""
    echo "   cd /home/tadiwamuzondo/Personal/web-text-forum"
    echo "   source .venv/bin/activate"
    echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
fi

if check_frontend; then
    echo "✅ Frontend is already running on port 4200"
else
    echo "Starting frontend server..."
    echo "   Command: npm start"
    echo "   Run this in a separate terminal:"
    echo ""
    echo "   cd /home/tadiwamuzondo/Personal/web-text-forum/frontend"
    echo "   npm start"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  👥 Creating Test Users"
echo "════════════════════════════════════════════════════════════"
echo ""

if check_backend; then
    echo "Creating test users..."
    ./create_test_users.sh
    echo ""

    echo "════════════════════════════════════════════════════════════"
    echo "  🌱 Seeding Sample Data"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Adding sample posts and comments..."
    ./seed_data.sh
else
    echo "⚠️  Backend is not running. Please start it first."
    echo ""
    echo "Run in Terminal 1:"
    echo "  cd /home/tadiwamuzondo/Personal/web-text-forum"
    echo "  source .venv/bin/activate"
    echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🎊 Setup Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✨ TruthForum is ready to use!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:4200"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Test Credentials:"
echo "   Regular User:"
echo "     Username: user1"
echo "     Password: password123"
echo ""
echo "   Moderator:"
echo "     Username: mod1"
echo "     Password: password123"
echo ""
echo "📖 Documentation:"
echo "   START_HERE.md   - Quick overview"
echo "   QUICKSTART.md   - Fast setup"
echo "   README.md       - Complete guide"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🎯 What to Test"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "As Regular User (user1):"
echo "  ✓ Login to see posts"
echo "  ✓ Like posts (button turns green)"
echo "  ✓ Expand/collapse comments"
echo "  ✓ Add new comments"
echo "  ✓ See misleading warnings"
echo ""
echo "As Moderator (mod1):"
echo "  ✓ See moderator badge"
echo "  ✓ Mark posts as misleading"
echo "  ✓ See red border appear"
echo "  ✓ Toggle back to accurate"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Enjoy TruthForum - Where facts meet community!"
echo ""

