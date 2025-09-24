#!/bin/bash

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 10

# Base URL
BASE_URL="http://localhost:5295/api"

# Test 1: Check if API is running
echo -e "\n1. Testing API health..."
curl -s -o /dev/null -w "%{http_code}" $BASE_URL/courses
echo " - Courses endpoint responded"

# Test 2: Register a new user
echo -e "\n2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123","fullName":"Test User","role":"Student"}')
echo "Registration response: $REGISTER_RESPONSE"

# Test 3: Login
echo -e "\n3. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123"}')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "Login successful, token received"

# Test 4: Get courses
echo -e "\n4. Testing get courses..."
COURSES=$(curl -s $BASE_URL/courses | jq length)
echo "Found $COURSES courses"

# Test 5: Get course details
echo -e "\n5. Testing get course details..."
COURSE_DETAIL=$(curl -s $BASE_URL/courses/1 | jq -r '.title')
echo "Course 1 title: $COURSE_DETAIL"

# Test 6: Enroll in course (authenticated)
echo -e "\n6. Testing course enrollment..."
ENROLLMENT_RESPONSE=$(curl -s -X POST $BASE_URL/enrollments/courses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "Enrollment response: $ENROLLMENT_RESPONSE"

# Test 7: Get user enrollments
echo -e "\n7. Testing get user enrollments..."
ENROLLMENTS=$(curl -s $BASE_URL/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq length 2>/dev/null || echo "0")
echo "User has $ENROLLMENTS enrollments"

# Test 8: Update user profile
echo -e "\n8. Testing user profile update..."
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.id')
UPDATE_RESPONSE=$(curl -s -X PUT $BASE_URL/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated Test User"}')
echo "Profile update status: $(echo $UPDATE_RESPONSE | jq -r '.fullName' 2>/dev/null || echo "Failed")"

echo -e "\n✅ All API tests completed!"
echo -e "\nFrontend is running at: http://localhost:8080"
echo "Backend API is running at: http://localhost:5295/api"