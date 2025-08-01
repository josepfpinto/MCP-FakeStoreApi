# MCP-FakeStoreApi

A Model Context Protocol (MCP) server implementation that provides an AI-powered shopping assistant interface to the Fake Store API. This project demonstrates how to build a conversational AI system that can handle natural language requests for e-commerce operations.

## Overview

This project consists of two main components:

- **Backend MCP Server**: A Node.js/TypeScript server that implements the Model Context Protocol (MCP) for AI agents to interact with the Fake Store API
- **Frontend Client**: A React/TypeScript web application with chat interface using LangChain and OpenAI (to be implemented)

The system allows users to interact with a shopping assistant using natural language. The frontend uses LangChain to configure OpenAI to call the MCP server (exposed via ngrok tunnel) as tools, enabling direct communication between cloud LLMs and the local shopping backend.

## Server Implementation

### Architecture

The MCP server follows a modular architecture with clear separation of concerns:

```
server/
├── src/
│   ├── controllers/     # Business logic handlers
│   ├── middleware/      # Authentication & request processing
│   ├── routes/          # API endpoint definitions
│   ├── services/        # External API interactions
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main server entry point
```

### Key Features

1. **Product Cache**: In-memory cache of all products from Fake Store API for fast searching
2. **Authentication**: JWT token-based authentication with Fake Store API
3. **Cart Management**: Full CRUD operations for shopping carts
4. **Product Discovery**: Search and filter products by name, description, or category
5. **Error Handling**: Comprehensive error responses following the MCP protocol specification

### API Endpoints

- `POST /login` - User authentication
- `POST /api/mcp` - Main MCP actions endpoint
- `GET /health` - Server health check

### Supported MCP Actions

- `search_products` - Find products by query and category
- `show_cart` - Display cart contents with itemized details
- `add_item` - Add products to cart
- `remove_item` - Remove products from cart
- `get_categories` - List all available product categories

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- TypeScript knowledge

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd MCP-FakeStoreApi
```

2. Install server dependencies:

```bash
cd server
yarn install
```

3. Create environment file (optional):

```bash
cp .env.example .env
```

### Running the Server

#### Development Mode

```bash
cd server
yarn dev
```

#### Production Mode

```bash
cd server
yarn build
yarn start
```

The server will start on `http://localhost:3000` by default.

### Testing the API

#### 1. Health Check

```bash
curl http://localhost:3000/health
```

#### 2. User Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnd",
    "password": "m38rmF$"
  }'
```

#### 3. Search Products

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "search_products",
    "query": "jacket"
  }'
```

#### 4. Add Item to Cart

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "add_item",
    "item_name": "Mens Cotton Jacket",
    "quantity": 1
  }'
```

## Project Structure

```
MCP-FakeStoreApi/
├── server/                 # Backend MCP server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth & validation
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── client/                # Frontend React app (to be implemented)
└── README.md
```

## Development

### Adding New Features

1. **New MCP Actions**: Add to `src/types/index.ts` and implement in `src/controllers/mcpController.ts`
2. **New Routes**: Create in `src/routes/` and register in `src/index.ts`
3. **New Services**: Add to `src/services/` for external API interactions

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Follow SOLID principles and DRY methodology

## Local Deployment with ngrok

This project is designed for local development with ngrok tunneling to make the MCP server accessible to cloud LLMs (OpenAI, Claude API, etc.).

### Prerequisites

1. **Install ngrok**:

   ```bash
   # macOS (via Homebrew)
   brew install ngrok/ngrok/ngrok

   # Or download from https://ngrok.com/download
   ```

2. **Sign up for ngrok** (free tier available):
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```

### Running with ngrok

#### Terminal 1: Start the MCP Server

```bash
cd server
yarn dev
# Server starts on http://localhost:3000
```

#### Terminal 2: Expose via ngrok

```bash
ngrok http 3000
```

You'll get output like:

```
Session Status    online
Forwarding        https://abc123.ngrok.io -> http://localhost:3000
```

#### Configure LangChain/OpenAI

Use the ngrok URL in your frontend LangChain configuration:

```typescript
// In your React app
const mcpServerUrl = "https://abc123.ngrok.io/mcp"; // Replace with your ngrok URL

// Configure OpenAI tools to use this URL
const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for products",
      // OpenAI will call: POST https://abc123.ngrok.io/mcp
    },
  },
];
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Security Considerations

- **ngrok tunnels are public** - ensure proper authentication
- **Free ngrok URLs change** on restart - consider paid plan for stable URLs
- **Local development only** - not recommended for production traffic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
