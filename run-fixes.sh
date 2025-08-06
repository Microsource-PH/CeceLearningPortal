#!/bin/bash

# Script to fix Dr. Sarah Johnson's data
# Run this to re-seed data and fix payment records

BASE_URL="http://localhost:5295"

echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful!"

# Step 1: Verify current data
echo -e "\n📊 1. Current instructor data:"
curl -s -X GET "$BASE_URL/api/admin/verify-instructor-data" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 2: Re-run data seeder
echo -e "\n🌱 2. Re-running data seeder..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/seed" \
  -H "Authorization: Bearer $TOKEN")
echo $SEED_RESPONSE | jq '.'

# Step 3: Fix payments
echo -e "\n💰 3. Fixing instructor payments..."
FIX_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/fix-instructor-payments" \
  -H "Authorization: Bearer $TOKEN")
echo $FIX_RESPONSE | jq '.'

echo -e "\n✅ All fixes completed! Please refresh the marketplace page."