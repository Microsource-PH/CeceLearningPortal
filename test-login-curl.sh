#!/bin/bash

# Test login with curl
echo "Testing login with different passwords..."

BASE_URL="http://localhost:5295"

# Test backend connectivity
echo -e "\n1. Testing backend connectivity..."
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
    echo "✅ Backend is reachable"
else
    echo "❌ Backend is not reachable at $BASE_URL"
    exit 1
fi

# Test different passwords
echo -e "\n2. Testing different password combinations..."

passwords=("Admin123" "admin123" "Admin@123" "admin@123")

for password in "${passwords[@]}"; do
    echo -n "  Trying password: $password ... "
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"admin@example.com\",\"password\":\"$password\"}")
    
    if [[ $response == *"token"* ]]; then
        echo "✅ SUCCESS!"
        echo "  Response: ${response:0:100}..."
        break
    else
        echo "❌ Failed"
        echo "  Response: $response"
    fi
done

echo -e "\n3. Testing with verbose output..."
curl -v -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"Admin123"}'