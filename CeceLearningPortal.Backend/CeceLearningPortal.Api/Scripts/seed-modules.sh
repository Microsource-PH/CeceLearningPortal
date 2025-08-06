#!/bin/bash

# Script to seed modules and lessons for existing courses using the API

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

# Function to create modules for a course
create_modules_for_course() {
    local COURSE_ID=$1
    local COURSE_TITLE=$2
    
    echo ""
    echo "Creating modules for Course $COURSE_ID: $COURSE_TITLE"
    
    # Create modules based on course type
    if [[ "$COURSE_TITLE" == *"Web Development Bootcamp"* ]]; then
        # Module 1
        curl -s -X POST "http://localhost:5294/api/courses/$COURSE_ID/modules" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Introduction to Web Development",
            "description": "Start your web development journey",
            "order": 1,
            "lessons": [
              {"title": "Welcome to Web Development", "duration": "15 minutes", "type": "Video", "content": "Introduction video content", "videoUrl": "https://example.com/video1", "order": 1},
              {"title": "Setting Up Your Environment", "duration": "20 minutes", "type": "Video", "content": "Setup tutorial", "videoUrl": "https://example.com/video2", "order": 2},
              {"title": "Your First Web Page", "duration": "30 minutes", "type": "Assignment", "content": "Create your first HTML page", "order": 3}
            ]
          }' | jq '.'
          
        # Module 2  
        curl -s -X POST "http://localhost:5294/api/courses/$COURSE_ID/modules" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "HTML5 & CSS3 Fundamentals",
            "description": "Master the building blocks of the web",
            "order": 2,
            "lessons": [
              {"title": "HTML5 Semantic Elements", "duration": "25 minutes", "type": "Video", "content": "Learn HTML5 semantics", "videoUrl": "https://example.com/video3", "order": 1},
              {"title": "CSS3 Flexbox & Grid", "duration": "30 minutes", "type": "Video", "content": "Modern CSS layouts", "videoUrl": "https://example.com/video4", "order": 2},
              {"title": "Responsive Design Project", "duration": "45 minutes", "type": "Assignment", "content": "Build a responsive webpage", "order": 3},
              {"title": "HTML & CSS Quiz", "duration": "20 minutes", "type": "Quiz", "content": "Test your knowledge", "order": 4}
            ]
          }' | jq '.'
          
    elif [[ "$COURSE_TITLE" == *"React"* ]]; then
        # React course modules
        curl -s -X POST "http://localhost:5294/api/courses/$COURSE_ID/modules" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "React Hooks Deep Dive",
            "description": "Master useState, useEffect, and custom hooks",
            "order": 1,
            "lessons": [
              {"title": "Introduction to React Hooks", "duration": "20 minutes", "type": "Video", "content": "Why hooks?", "videoUrl": "https://example.com/react1", "order": 1},
              {"title": "useState in Detail", "duration": "25 minutes", "type": "Video", "content": "State management with hooks", "videoUrl": "https://example.com/react2", "order": 2},
              {"title": "useEffect Patterns", "duration": "30 minutes", "type": "Video", "content": "Side effects in React", "videoUrl": "https://example.com/react3", "order": 3},
              {"title": "Custom Hooks Workshop", "duration": "40 minutes", "type": "Assignment", "content": "Build your own hooks", "order": 4}
            ]
          }' | jq '.'
          
    elif [[ "$COURSE_TITLE" == *"Machine Learning"* ]]; then
        # ML course modules
        curl -s -X POST "http://localhost:5294/api/courses/$COURSE_ID/modules" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Python for Data Science",
            "description": "NumPy, Pandas, and data manipulation",
            "order": 1,
            "lessons": [
              {"title": "NumPy Fundamentals", "duration": "30 minutes", "type": "Video", "content": "Array operations", "videoUrl": "https://example.com/ml1", "order": 1},
              {"title": "Pandas DataFrames", "duration": "35 minutes", "type": "Video", "content": "Data manipulation", "videoUrl": "https://example.com/ml2", "order": 2},
              {"title": "Data Cleaning Project", "duration": "45 minutes", "type": "Assignment", "content": "Clean a real dataset", "order": 3}
            ]
          }' | jq '.'
          
    else
        # Default modules for other courses
        curl -s -X POST "http://localhost:5294/api/courses/$COURSE_ID/modules" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Getting Started",
            "description": "Introduction and fundamentals",
            "order": 1,
            "lessons": [
              {"title": "Course Introduction", "duration": "15 minutes", "type": "Video", "content": "Welcome to the course", "videoUrl": "https://example.com/intro", "order": 1},
              {"title": "Core Concepts", "duration": "25 minutes", "type": "Video", "content": "Understanding the basics", "videoUrl": "https://example.com/concepts", "order": 2},
              {"title": "First Assignment", "duration": "30 minutes", "type": "Assignment", "content": "Apply what you learned", "order": 3}
            ]
          }' | jq '.'
    fi
}

# Get instructor's courses
echo ""
echo "Fetching instructor courses..."
COURSES=$(curl -s -X GET "http://localhost:5294/api/courses/instructor" \
  -H "Authorization: Bearer $TOKEN")

# Extract course IDs and titles
echo "$COURSES" | jq -c '.[]' | while read course; do
    COURSE_ID=$(echo "$course" | jq -r '.id')
    COURSE_TITLE=$(echo "$course" | jq -r '.title')
    create_modules_for_course "$COURSE_ID" "$COURSE_TITLE"
done

echo ""
echo "Module seeding completed!"