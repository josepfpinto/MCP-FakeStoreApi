#!/bin/bash

# Test MCP Server with Authentication
# Tests the proper MCP flow with HTTP authentication

SERVER_URL="http://localhost:3000"
MCP_URL="$SERVER_URL/mcp"

# Test credentials (from Fake Store API)
USERNAME="johnd"
PASSWORD="m38rmF$"
AUTH_HEADER=$(echo -n "$USERNAME:$PASSWORD" | base64)

echo "🧪 Testing MCP Server with Authentication"
echo "=========================================="
echo ""

# Test 1: Initialize (no auth required)
echo "1️⃣ Testing MCP initialize (no auth required)..."
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

# Test 2: Tools List (requires auth)
echo "2️⃣ Testing tools/list with authentication..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-Auth: $AUTH_HEADER" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-2",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ Tools list failed"
echo ""

# Test 3: Search Products Tool Call
echo "3️⃣ Testing search_products tool call..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-Auth: $AUTH_HEADER" \
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

# Test 4: Resources List
echo "4️⃣ Testing resources/list..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-MCP-Auth: $AUTH_HEADER" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-4",
    "method": "resources/list"
  }' | jq '.' 2>/dev/null || echo "❌ Resources list failed"
echo ""

# Test 5: No Auth (should fail)
echo "5️⃣ Testing tools/list without auth (should fail)..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-5",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ No auth test failed"
echo ""

echo "✅ MCP Server authentication tests completed!"
echo ""
echo "💡 Usage for LangChain/OpenAI:"
echo "   URL: $MCP_URL"
echo "   Auth Header: X-MCP-Auth: $AUTH_HEADER"
echo "   Available tools: search_products, add_to_cart, remove_from_cart, get_cart, get_categories"