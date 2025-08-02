# LLM Shopping Assistant Server

Python FastAPI server that provides intelligent shopping assistance using LLM with MCP (Model Context Protocol) integration.

## Architecture

```
React Frontend → Python LLM Server → Node.js MCP Server
```

- **Python LLM Server**: Intelligent agent using langchain-mcp-adapters
- **Node.js MCP Server**: Shopping operations (search, cart management)
- **React Frontend**: User interface

## Features

- 🤖 **Intelligent LLM Agent**: Uses GPT-4 with ReAct pattern for decision making
- 🛍️ **MCP Integration**: Seamless communication with shopping MCP server
- 🚀 **FastAPI**: High-performance async web framework
- 🔧 **Modular Design**: Clean separation of concerns (SOLID principles)

## Quick Start

### 1. Create Python Virtual Environment

```bash
cd llm-server
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Get MCP API Key from Node.js Server

First, make sure your Node.js MCP server is running, then generate an API key:

```bash
# Login and generate MCP API key
JWT_TOKEN=$(curl -s -X POST "http://localhost:3000/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "johnd", "password": "m38rmF$"}' | jq -r '.data.token')

# Create API key for LLM server
curl -X POST "http://localhost:3000/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "LLM Server API Key"}' | jq '.'
```

This will return your MCP API key that looks like:

```json
{
  "success": true,
  "data": {
    "key": "mcp_8d576aa6ff5ee35b413518e9f13b8f8e08922020ce49f043c230c08a0fe608f1",
    "name": "LLM Server API Key"
  }
}
```

### 4. Configure Environment

```bash
cp env-template .env
# Edit .env with your API keys
```

Required environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `MCP_SERVER_URL`: URL of your MCP server (default: ngrok tunnel)

### 5. Start Server

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Verify Setup

- Health check: http://localhost:8001/health
- API docs: http://localhost:8001/docs
- Chat endpoint: `POST http://localhost:8001/api/v1/chat`

## API Usage

### Chat Endpoint

```bash
curl -X POST "http://localhost:8001/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What jackets do you have?"}'
```

Response:

```json
{
  "message": "I found 2 great jackets for you:\n\n1. **Mens Cotton Jacket** - $55.99...",
  "is_error": false
}
```

## Development

### Project Structure

```
llm-server/
├── app/
│   ├── main.py           # FastAPI application
│   ├── config.py         # Configuration management
│   ├── api/
│   │   └── chat.py       # Chat endpoints
│   ├── services/
│   │   ├── llm_service.py    # LLM & MCP integration
│   │   └── mcp_client.py     # MCP communication
│   └── models/
│       └── schemas.py    # Request/Response models
├── requirements.txt
└── env-template
```

### Key Components

- **LLMService**: Manages LLM and MCP client, processes chat requests
- **MCPClient**: HTTP client for MCP protocol communication
- **ChatAPI**: REST endpoint for frontend communication
- **Configuration**: Environment-based settings management

## Integration Flow

1. **User Input**: Frontend sends message to `/api/v1/chat`
2. **LLM Processing**: LLMService uses GPT-4 with ReAct agent
3. **Tool Decision**: Agent decides which MCP tools to use
4. **MCP Communication**: Tools call Node.js MCP server
5. **Response Generation**: LLM formats final response
6. **Frontend Response**: Natural language response returned

## Error Handling

- HTTP errors are caught and returned as JSON responses
- MCP server communication errors are handled gracefully
- All errors are logged with structured logging (loguru)

## Logging

Structured logging with loguru:

- **INFO**: General application flow
- **DEBUG**: Detailed request/response data (debug mode)
- **ERROR**: Error conditions with stack traces
