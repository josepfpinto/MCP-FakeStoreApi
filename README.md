# MCP-FakeStoreApi

A Model Context Protocol (MCP) server implementation that provides an AI-powered shopping assistant interface to the Fake Store API. This project demonstrates how to build a conversational AI system that can handle natural language requests for e-commerce operations.

## Overview

This project consists of two main components:

- **Backend MCP Server**: A Node.js/TypeScript server that implements the Model Context Protocol (MCP) for AI agents to interact with the Fake Store API
- **Frontend Client**: A React/TypeScript web application with authentication, chat interface, and API key management (Phase 2 complete)

The system allows users to interact with a shopping assistant using natural language. The frontend uses LangChain to configure OpenAI to call the MCP server (exposed via ngrok tunnel) as tools, enabling direct communication between cloud LLMs and the local shopping backend.

### Implementation Status

- ✅ **Phase 1**: Complete backend MCP server implementation
- ✅ **Phase 2**: Frontend UI with authentication, protected routes, and API key management
- 🚧 **Phase 3**: LangChain integration with OpenAI (upcoming)

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

## Frontend Implementation

### Architecture

The React frontend follows modern best practices with TypeScript, Redux Toolkit for state management, and React Router for navigation:

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── store/           # Redux store and slices
│   ├── hooks/           # Custom React hooks
│   └── App.tsx          # Main application component
```

### Key Features

1. **Authentication System**: Login page with username, password, and OpenAI API key
2. **Protected Routes**: Route guards that redirect unauthenticated users
3. **Chat Interface**: Modern chat UI ready for LangChain integration
4. **API Key Management**: Full CRUD operations for MCP API keys
5. **State Management**: Redux Toolkit for global state
6. **Responsive Design**: Mobile-friendly Tailwind CSS styling

### Pages & Components

- **Login Page**: User authentication with form validation
- **Chat Page**: Shopping assistant chat interface (UI only in Phase 2)
- **API Keys Page**: Manage MCP API keys for LLM integration
- **Protected Route**: Higher-order component for route protection
- **Navigation**: Responsive header with user menu and logout

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

2. Install backend dependencies:

```bash
cd server
yarn install
```

3. Install frontend dependencies:

```bash
cd ../client
yarn install
```

4. Create environment file (optional):

```bash
cd ../server
cp .env.example .env
```

### Running the Application

#### Development Mode (Recommended)

**Terminal 1: Start the Backend Server**

```bash
cd server
yarn dev
```

The backend server will start on `http://localhost:3000`.

**Terminal 2: Start the Frontend Client**

```bash
cd client
yarn dev
```

The frontend will start on `http://localhost:5173` and open automatically in your browser.

#### Production Mode

**Backend:**

```bash
cd server
yarn build
yarn start
```

**Frontend:**

```bash
cd client
yarn build
yarn preview
```

### Quick Start

1. Start both backend and frontend in development mode (see above)
2. Open `http://localhost:5173` in your browser
3. Login with demo credentials:
   - **Username**: `johnd`
   - **Password**: `m38rmF$`
   - **OpenAI API Key**: Your own OpenAI API key
4. Explore the chat interface and API key management

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
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store & slices
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main app component
│   ├── package.json
│   ├── vite.config.ts     # Vite configuration
│   └── tailwind.config.js # Tailwind CSS config
├── PROTOCOL.md            # MCP protocol specification
└── README.md
```

## Authentication Flow

The application implements a secure authentication flow:

1. **User Login**: Users authenticate with Fake Store API credentials
2. **JWT Token**: Backend returns JWT token for session management
3. **MCP API Key Generation**: Automatic generation of MCP API key for LLM integration
4. **Local Storage**: Tokens stored securely in browser's local storage
5. **Protected Routes**: Frontend routes protected by authentication state
6. **API Key Management**: Users can create, view, revoke, and delete MCP API keys

### Frontend Features (Phase 2)

- ✅ **Login System**: Complete authentication with form validation
- ✅ **Protected Routing**: React Router with route guards
- ✅ **Chat Interface**: Modern chat UI (ready for LangChain integration)
- ✅ **API Key Management**: Full CRUD operations for MCP keys
- ✅ **State Management**: Redux Toolkit with persistent storage
- ✅ **Responsive Design**: Mobile-friendly Tailwind CSS
- ✅ **Error Handling**: Comprehensive error states and user feedback

## Development

### Adding New Features

**Backend:**

1. **New MCP Actions**: Add to `src/types/index.ts` and implement in `src/controllers/mcpController.ts`
2. **New Routes**: Create in `src/routes/` and register in `src/index.ts`
3. **New Services**: Add to `src/services/` for external API interactions

**Frontend:**

1. **New Pages**: Create in `src/pages/` and add route in `src/App.tsx`
2. **New Components**: Add to `src/components/` with TypeScript interfaces
3. **New Redux State**: Create slices in `src/store/slices/` and add to store
4. **New API Calls**: Add async thunks to relevant Redux slices

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Follow SOLID principles and DRY methodology
- React functional components with hooks
- Redux Toolkit for state management

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

#### Terminal 2: Start the Frontend (Optional for ngrok testing)

```bash
cd client
yarn dev
# Frontend starts on http://localhost:5173
```

#### Terminal 3: Expose via ngrok

```bash
ngrok http 3000
```

You'll get output like:

```
Session Status    online
Forwarding        https://abc123.ngrok.io -> http://localhost:3000
```

#### Configure LangChain/OpenAI (Phase 3)

In Phase 3, use the ngrok URL in your frontend LangChain configuration:

```typescript
// In your React app (Phase 3 implementation)
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

**Note**: Phase 2 includes the frontend UI but not yet the LangChain integration. The chat interface is ready for Phase 3 implementation.

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
