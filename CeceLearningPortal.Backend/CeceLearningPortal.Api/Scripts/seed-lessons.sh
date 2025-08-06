#!/bin/bash

# Script to seed lessons for existing modules using the API

# First, login as instructor to get auth token
echo "Logging in as instructor..."
RESPONSE=$(curl -s -X POST http://localhost:5294/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@example.com","password":"Instructor123"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" == "null" ]; then
    echo "Failed to login. Response: $RESPONSE"
    exit 1
fi

echo "Login successful. Token: ${TOKEN:0:20}..."

# Add lessons to module 58 (Introduction to Web Development)
echo "Adding lessons to module 58..."
curl -s -X POST "http://localhost:5294/api/courses/modules/58/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Web Development",
    "duration": "15 minutes",
    "type": "Video",
    "content": "Introduction video content",
    "videoUrl": "https://example.com/video1",
    "order": 1
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/58/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setting Up Your Environment",
    "duration": "20 minutes",
    "type": "Video",
    "content": "Setup tutorial",
    "videoUrl": "https://example.com/video2",
    "order": 2
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/58/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your First Web Page",
    "duration": "30 minutes",
    "type": "Assignment",
    "content": "Create your first HTML page",
    "order": 3
  }' | jq '.'

# Add lessons to module 59 (HTML5 & CSS3 Fundamentals)
echo ""
echo "Adding lessons to module 59..."
curl -s -X POST "http://localhost:5294/api/courses/modules/59/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "HTML5 Semantic Elements",
    "duration": "25 minutes",
    "type": "Video",
    "content": "Learn HTML5 semantics",
    "videoUrl": "https://example.com/video3",
    "order": 1
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/59/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CSS3 Flexbox & Grid",
    "duration": "30 minutes",
    "type": "Video",
    "content": "Modern CSS layouts",
    "videoUrl": "https://example.com/video4",
    "order": 2
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/59/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Responsive Design Project",
    "duration": "45 minutes",
    "type": "Assignment",
    "content": "Build a responsive webpage",
    "order": 3
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/59/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "HTML & CSS Quiz",
    "duration": "20 minutes",
    "type": "Quiz",
    "content": "Test your knowledge",
    "order": 4
  }' | jq '.'

# Add lessons to module 60 (React Hooks Deep Dive)
echo ""
echo "Adding lessons to module 60..."
curl -s -X POST "http://localhost:5294/api/courses/modules/60/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to React Hooks",
    "duration": "20 minutes",
    "type": "Video",
    "content": "Why hooks?",
    "videoUrl": "https://example.com/react1",
    "order": 1
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/60/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "useState in Detail",
    "duration": "25 minutes",
    "type": "Video",
    "content": "State management with hooks",
    "videoUrl": "https://example.com/react2",
    "order": 2
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/60/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "useEffect Patterns",
    "duration": "30 minutes",
    "type": "Video",
    "content": "Side effects in React",
    "videoUrl": "https://example.com/react3",
    "order": 3
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/60/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Custom Hooks Workshop",
    "duration": "40 minutes",
    "type": "Assignment",
    "content": "Build your own hooks",
    "order": 4
  }' | jq '.'

# Add lessons to module 61 (Python for Data Science)
echo ""
echo "Adding lessons to module 61..."
curl -s -X POST "http://localhost:5294/api/courses/modules/61/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NumPy Fundamentals",
    "duration": "30 minutes",
    "type": "Video",
    "content": "Array operations",
    "videoUrl": "https://example.com/ml1",
    "order": 1
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/61/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pandas DataFrames",
    "duration": "35 minutes",
    "type": "Video",
    "content": "Data manipulation",
    "videoUrl": "https://example.com/ml2",
    "order": 2
  }' | jq '.'

curl -s -X POST "http://localhost:5294/api/courses/modules/61/lessons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Cleaning Project",
    "duration": "45 minutes",
    "type": "Assignment",
    "content": "Clean a real dataset",
    "order": 3
  }' | jq '.'

echo ""
echo "Lesson seeding completed!"