#!/bin/bash

# Simple MCP Server Test Script
# Tests the basic MCP endpoints

SERVER_URL="http://localhost:3000"
MCP_URL="$SERVER_URL/mcp"

echo "🧪 Testing MCP Server Endpoints"
echo "==============================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
curl -s "$SERVER_URL/health" | jq '.' 2>/dev/null || echo "❌ Health check failed"
echo ""

# Test 2: MCP Initialize
echo "2️⃣ Testing MCP initialize..."
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
  }' | jq '.' 2>/dev/null || echo "❌ MCP initialize failed"
echo ""

# Test 3: Tools List (will fail without auth, but should show proper error)
echo "3️⃣ Testing tools/list (expected to fail without auth)..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-2",
    "method": "tools/list"
  }' | jq '.' 2>/dev/null || echo "❌ Tools list request failed"
echo ""

# Test 4: REST Login
echo "4️⃣ Testing REST login..."
curl -s -X POST "$SERVER_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnd",
    "password": "m38rmF$"
  }' | jq '.' 2>/dev/null || echo "❌ REST login failed"
echo ""

echo "✅ Basic connectivity tests completed!"
echo ""
echo "💡 For full testing:"
echo "   1. Start server: yarn dev"
echo "   2. Run tests: ./test-mcp.sh"
echo "   3. Use ngrok for cloud LLM testing: ngrok http 3000"