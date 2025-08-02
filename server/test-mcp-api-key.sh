#!/bin/bash

# Test MCP Server with API Key Authentication
# Demonstrates the new API key authentication flow

SERVER_URL="http://localhost:3000"
MCP_URL="$SERVER_URL/mcp"

# Test credentials (from Fake Store API)
USERNAME="johnd"
PASSWORD="m38rmF$"

echo "🔑 Testing MCP Server with API Key Authentication"
echo "=================================================="
echo ""

# Step 1: Login to get JWT token
echo "1️⃣ Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }")

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$JWT_TOKEN" = "null" ] || [ -z "$JWT_TOKEN" ]; then
    echo "❌ Login failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"
echo "JWT Token: ${JWT_TOKEN:0:20}..."
echo ""

# Step 2: Generate MCP API Key
echo "2️⃣ Generating MCP API key..."
API_KEY_RESPONSE=$(curl -s -X POST "$SERVER_URL/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Test LLM Client"
  }')

MCP_API_KEY=$(echo "$API_KEY_RESPONSE" | jq -r '.data.key' 2>/dev/null)

if [ "$MCP_API_KEY" = "null" ] || [ -z "$MCP_API_KEY" ]; then
    echo "❌ API key generation failed!"
    echo "Response: $API_KEY_RESPONSE"
    exit 1
fi

echo "✅ API key generated!"
echo "MCP API Key: ${MCP_API_KEY:0:20}..."
echo ""

# Step 3: Test MCP Initialize (no auth required)
echo "3️⃣ Testing MCP initialize (no auth required)..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-1",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {"tools": {}, "resources": {}},
      "clientInfo": {"name": "test-client", "version": "1.0.0"}
    }
  }' | jq '.' 2>/dev/null || echo "❌ Initialize failed"
echo ""

# Step 4: Test Tools List with API Key
echo "4️⃣ Testing tools/list with API key..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-2",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ Tools list failed"
echo ""

# Step 5: Test Tool Call with API Key
echo "5️⃣ Testing search_products tool call with API key..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-3",
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "query": "jacket",
        "limit": 2
      }
    }
  }' | jq '.' 2>/dev/null || echo "❌ Search products failed"
echo ""

# Step 6: Test Resources List with API Key
echo "6️⃣ Testing resources/list with API key..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-4",
    "method": "resources/list"
  }' | jq '.' 2>/dev/null || echo "❌ Resources list failed"
echo ""

# Step 7: Test without API Key (should fail)
echo "7️⃣ Testing tools/list without API key (should fail)..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-5",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ No auth test failed"
echo ""

# Step 8: Test with invalid API Key (should fail)
echo "8️⃣ Testing with invalid API key (should fail)..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: mcp_invalid123" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-6",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ Invalid key test failed"
echo ""

# Step 9: List API Keys
echo "9️⃣ Listing user's API keys..."
curl -s -X GET "$SERVER_URL/api-keys" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "❌ List keys failed"
echo ""

echo "✅ MCP Server API key authentication tests completed!"
echo ""
echo "💡 Usage for LangChain/OpenAI:"
echo "   URL: $MCP_URL"
echo "   Header: X-MCP-API-Key: $MCP_API_KEY"
echo "   Available tools: search_products, add_to_cart, remove_from_cart, get_cart, get_categories"
echo ""
echo "🔄 Fallback authentication (still supported):"
echo "   Header: X-MCP-Auth: $(echo -n "$USERNAME:$PASSWORD" | base64)"