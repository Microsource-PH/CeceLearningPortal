#!/bin/bash

# Wait for backend to be ready
echo "Waiting for backend..."
sleep 5

BASE_URL="http://localhost:5295/api"

# Login as admin to get token
echo "Logging in as admin..."
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123"}' | jq -r '.accessToken')

if [ "$ADMIN_TOKEN" = "null" ]; then
    echo "Failed to login as admin, creating admin account..."
    curl -s -X POST $BASE_URL/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"Password123","fullName":"Admin User","role":"Admin"}'
    
    ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"Password123"}' | jq -r '.accessToken')
fi

echo "Admin token obtained"

# Register new instructor with correct name
echo "Registering Dr. Sarah Johnson as instructor..."
INSTRUCTOR_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@example.com","password":"Password123","fullName":"Dr. Sarah Johnson","role":"Instructor"}')

echo "Instructor registration response: $INSTRUCTOR_RESPONSE"

# Test login with instructor account
echo "Testing instructor login..."
INSTRUCTOR_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@example.com","password":"Password123"}')

echo "Instructor login response: $INSTRUCTOR_LOGIN"

echo "✅ Instructor account updated successfully!"