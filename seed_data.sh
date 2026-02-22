#!/bin/bash

echo "🌱 Seeding TruthForum with sample data..."

API_URL="http://localhost:8000"

# First, check if server is running
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo "❌ Backend server is not running. Please start it first with: uvicorn app.main:app --reload"
    exit 1
fi

# Login as user1 to create posts
echo "Logging in as user1..."
TOKEN=$(curl -s -X POST "$API_URL/token" \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "password123"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login. Please make sure test users are created first:"
    echo "   Run: ./create_test_users.sh"
    exit 1
fi

echo "Creating sample posts..."

# Post 1
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Welcome to TruthForum!",
    "content": "We are excited to launch this new platform where facts and community discussion come together. Our mission is to create a space for honest, transparent dialogue."
  }' > /dev/null

# Post 2
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Best Practices for Online Discussions",
    "content": "Here are some tips for productive discussions: 1) Be respectful, 2) Cite your sources, 3) Stay on topic, 4) Listen to others, 5) Admit when you are wrong."
  }' > /dev/null

# Post 3
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "The Importance of Fact-Checking",
    "content": "In an era of misinformation, fact-checking has become more important than ever. Always verify information from multiple reliable sources before sharing."
  }' > /dev/null

# Post 4
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Community Guidelines Update",
    "content": "We have updated our community guidelines to ensure a safe and respectful environment for all users. Please take a moment to review them."
  }' > /dev/null

# Login as mod1 to create more posts
echo "Logging in as mod1..."
MOD_TOKEN=$(curl -s -X POST "$API_URL/token" \
  -H "Content-Type: application/json" \
  -d '{"username": "mod1", "password": "password123"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Post 5
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -d '{
    "title": "Moderator Introduction",
    "content": "Hello everyone! I am one of the moderators here. My role is to ensure our discussions remain factual and respectful. Feel free to reach out if you have any concerns."
  }' > /dev/null

echo "Adding sample comments..."

# Add comments to first post (ID: 1)
curl -s -X POST "$API_URL/posts/1/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "This is great! Looking forward to meaningful discussions."}' > /dev/null

curl -s -X POST "$API_URL/posts/1/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -d '{"content": "Welcome to the community! We are glad to have you here."}' > /dev/null

# Add comment to second post
curl -s -X POST "$API_URL/posts/2/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -d '{"content": "These are excellent guidelines. Following them will make our community better."}' > /dev/null

echo ""
echo "✅ Sample data created successfully!"
echo ""
echo "Created:"
echo "  - 5 posts"
echo "  - 3 comments"
echo ""
echo "You can now login and explore the forum!"

