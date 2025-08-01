#!/bin/bash

# MCP Server with ngrok Development Script
# This script helps set up the development environment with ngrok

echo "🚀 MCP Server + ngrok Development Setup"
echo "======================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "📦 Installation options:"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  Other: Download from https://ngrok.com/download"
    echo ""
    echo "💡 After installation, sign up at https://ngrok.com/ and run:"
    echo "   ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"

# Check if server dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

echo ""
echo "🔄 Starting development environment..."
echo ""
echo "📋 Next steps:"
echo "1. Server will start on http://localhost:3000"
echo "2. Open another terminal and run: ngrok http 3000"
echo "3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "4. Use https://YOUR_NGROK_URL.ngrok.io/mcp in your LangChain/OpenAI tools"
echo ""
echo "🛠️ Available endpoints:"
echo "  • REST API: http://localhost:3000/login, /api/mcp"
echo "  • MCP Server: http://localhost:3000/mcp (use ngrok HTTPS for cloud LLMs)"
echo "  • Health Check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
yarn dev