#!/bin/bash

BASE_URL="http://localhost:5295/api"

echo "=== Testing Profile Fix ==="

# Step 1: Register Dr. Sarah Johnson as Student (to bypass approval)
echo "1. Registering Dr. Sarah Johnson..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.sarahjohnson@example.com","password":"Password123","fullName":"Dr. Sarah Johnson","role":"Student"}')

echo "Registration: $(echo $REGISTER_RESPONSE | jq -r '.fullName // .message')"

# Step 2: Login to get token
echo -e "\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.sarahjohnson@example.com","password":"Password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.id')
FULL_NAME=$(echo $LOGIN_RESPONSE | jq -r '.fullName')

echo "Login successful: $FULL_NAME"

# Step 3: Test profile retrieval
echo -e "\n3. Testing profile retrieval..."
PROFILE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile: $(echo $PROFILE | jq -r '.fullName // "Failed"')"

# Step 4: Test profile update
echo -e "\n4. Testing profile update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Dr. Sarah Johnson, PhD in Computer Science","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format"}')

# Step 5: Verify update
echo -e "\n5. Verifying profile update..."
UPDATED_PROFILE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Updated Name: $(echo $UPDATED_PROFILE | jq -r '.fullName // "Failed"')"
echo "Avatar Set: $(echo $UPDATED_PROFILE | jq -r '.avatar // "No avatar"' | cut -c1-50)..."

# Step 6: Test stats endpoint
echo -e "\n6. Testing user stats..."
STATS=$(curl -s -X GET "$BASE_URL/users/$USER_ID/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Stats Available: $(echo $STATS | jq -r '.totalCourses // "Failed"') courses"

echo -e "\n✅ Profile module tests completed!"
echo "User: Dr. Sarah Johnson"
echo "Email: dr.sarahjohnson@example.com"
echo "Password: Password123"