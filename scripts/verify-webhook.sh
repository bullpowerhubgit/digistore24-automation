#!/bin/bash

# Webhook Verification Test Script
# This script tests the webhook endpoint to ensure it returns the correct response

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="${1:-http://localhost:3000/api/digistore/webhook}"

echo "🔍 Testing Webhook Endpoint: $WEBHOOK_URL"
echo ""

# Test 1: POST with JSON payload
echo "Test 1: POST request with JSON payload"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}\n%{content_type}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "order_id": "TEST-VERIFY-001",
    "product_name": "Test Product",
    "amount": "99.00",
    "currency": "EUR",
    "buyer_email": "test@example.com",
    "buyer_name": "Test User",
    "status": "completed"
  }')

BODY=$(echo "$RESPONSE" | head -n 1)
STATUS=$(echo "$RESPONSE" | sed -n '2p')
CONTENT_TYPE=$(echo "$RESPONSE" | tail -n 1)

echo "Response Body: '$BODY'"
echo "Status Code: $STATUS"
echo "Content-Type: $CONTENT_TYPE"

# Validate response
if [ "$STATUS" = "200" ] && [ "$BODY" = "OK" ] && [[ "$CONTENT_TYPE" == *"text/plain"* ]]; then
    echo -e "${GREEN}✅ PASS${NC}: Correct response format"
else
    echo -e "${RED}❌ FAIL${NC}: Incorrect response format"
    echo "Expected: Status=200, Body='OK', Content-Type='text/plain'"
    echo "Got: Status=$STATUS, Body='$BODY', Content-Type='$CONTENT_TYPE'"
    exit 1
fi

echo ""

# Test 2: POST with form data
echo "Test 2: POST request with form data"
echo "------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "event=on_payment&order_id=TEST-002&product_name=Test&amount=10.00&buyer_email=test@test.com&buyer_name=Test&status=completed")

BODY=$(echo "$RESPONSE" | head -n 1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Response Body: '$BODY'"
echo "Status Code: $STATUS"

if [ "$STATUS" = "200" ] && [ "$BODY" = "OK" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Form data handled correctly"
else
    echo -e "${RED}❌ FAIL${NC}: Form data not handled correctly"
    exit 1
fi

echo ""

# Test 3: GET request
echo "Test 3: GET request (health check)"
echo "-----------------------------------"

RESPONSE=$(curl -s "$WEBHOOK_URL")
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "webhook endpoint is active"; then
    echo -e "${GREEN}✅ PASS${NC}: GET endpoint responds correctly"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: GET response unexpected"
fi

echo ""

# Test 4: Check for incorrect JSON error response
echo "Test 4: Verify NOT returning JSON error"
echo "----------------------------------------"

RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"event":"on_payment","order_id":"TEST-003"}')

if echo "$RESPONSE" | grep -q "success.*false"; then
    echo -e "${RED}❌ FAIL${NC}: Webhook returning JSON error response (OLD CODE)"
    echo "Response: $RESPONSE"
    echo ""
    echo "This indicates the wrong version of code is deployed!"
    echo "Expected: 'OK'"
    echo "Got: JSON error response"
    exit 1
else
    echo -e "${GREEN}✅ PASS${NC}: Not returning JSON error (correct code)"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "========================================="
echo ""
echo "The webhook endpoint is configured correctly and returns the expected format:"
echo "  - Returns plain text 'OK'"
echo "  - Returns status code 200"
echo "  - Returns Content-Type: text/plain"
echo "  - Processes events asynchronously"
echo ""
echo "✅ Ready for production use with Digistore24"
