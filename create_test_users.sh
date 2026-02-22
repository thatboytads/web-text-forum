#!/bin/bash

echo "🧪 Creating test users for TruthForum..."

API_URL="http://localhost:8000"

# Create a regular user
echo "Creating regular user (username: user1, password: password123)..."
curl -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "password123", "role": "regular"}' \
  2>/dev/null

echo ""

# Create a moderator
echo "Creating moderator (username: mod1, password: password123)..."
curl -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "mod1", "password": "password123", "role": "moderator"}' \
  2>/dev/null

echo ""
echo ""
echo "✅ Test users created!"
echo ""
echo "Regular User:"
echo "  Username: user1"
echo "  Password: password123"
echo ""
echo "Moderator:"
echo "  Username: mod1"
echo "  Password: password123"

