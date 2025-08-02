# MCP-FakeStoreApi

A Model Context Protocol (MCP) server implementation that provides an AI-powered shopping assistant interface to the Fake Store API. This project demonstrates how to build a conversational AI system that can handle natural language requests for e-commerce operations.

## Overview

This project consists of two main components:

- **Backend MCP Server**: A Node.js/TypeScript server that implements the Model Context Protocol (MCP) for AI agents to interact with the Fake Store API
- **Frontend Client**: A React/TypeScript web application with authentication, chat interface, and API key management (Phase 2 complete)

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
├── server/                 # Backend MCP server (Node.js/TypeScript)
│   ├── src/
│   │   ├── controllers/   # Request handlers & business logic
│   │   ├── middleware/    # Auth, validation & error handling
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # External API interactions
│   │   ├── mcp/          # MCP protocol implementation
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions (retry, logger)
│   │   └── index.ts       # Server entry point
│   ├── tests/             # Backend test suites
│   ├── package.json
│   ├── jest.config.js     # Jest testing configuration
│   └── tsconfig.json
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── store/         # Redux store & slices
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service classes
│   │   ├── contexts/      # React contexts (Toast, etc.)
│   │   └── App.tsx        # Main app component
│   ├── tests/             # Frontend test suites
│   ├── package.json
│   ├── vite.config.ts     # Vite configuration
│   ├── vitest.config.ts   # Vitest testing configuration
│   └── tailwind.config.js # Tailwind CSS config
├── llm-server/            # Python LLM integration server
│   ├── app/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── services/     # Business logic services
│   │   └── models/       # Pydantic models
│   ├── requirements.txt
│   └── README.md
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

## Testing

The project includes comprehensive test suites for both backend and frontend components.

### Backend Testing (Node.js/Jest)

The backend uses Jest with Supertest for API endpoint testing:

```bash
cd server

# Install dependencies
yarn install

# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

**Test Coverage:**

- ✅ Authentication endpoints (login, token validation)
- ✅ MCP protocol compliance (initialize, tools/list, tools/call)
- ✅ Error handling (network errors, timeouts, invalid requests)
- ✅ API key management
- ✅ External API integration (Fake Store API)

### Frontend Testing (React/Vitest)

The frontend uses Vitest with React Testing Library:

```bash
cd client

# Install dependencies
yarn install

# Run all tests
yarn test

# Run tests with UI interface
yarn test:ui

# Run tests with coverage report
yarn test:coverage
```

**Test Coverage:**

- ✅ Component rendering and interactions
- ✅ Authentication flows (login, logout, protected routes)
- ✅ Redux state management
- ✅ Error boundary handling
- ✅ User input validation
- ✅ Navigation and routing

### Python LLM Server Testing

```bash
cd llm-server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install pytest for testing
pip install pytest pytest-asyncio httpx

# Run tests (when implemented)
pytest
```

### Integration Testing

To test the complete system integration:

1. Start all services:

   ```bash
   # Terminal 1: Backend MCP Server
   cd server && yarn dev

   # Terminal 2: Python LLM Server
   cd llm-server && python start.py

   # Terminal 3: Frontend Client
   cd client && yarn dev

   # Terminal 4: ngrok (for external testing)
   ngrok http 3000
   ```

2. Run the test scripts:
   ```bash
   cd server
   ./test-mcp.sh        # Basic MCP connectivity
   ./test-mcp-auth.sh   # Authentication flow
   ./test-mcp-api-key.sh # API key management
   ```

### Test Data

The application uses demo data from the Fake Store API:

- **Demo User**: `johnd` / `m38rmF$`
- **Products**: Electronics, jewelry, men's clothing, women's clothing
- **Test Categories**: All categories from Fake Store API

## Error Handling & Monitoring

### Robust Error Handling

**Backend:**

- ✅ Comprehensive error middleware with structured error responses
- ✅ Retry logic for external API calls with exponential backoff
- ✅ Request timeout handling (30s for chat, 5s for API calls)
- ✅ Rate limiting protection
- ✅ JWT token validation and expiration handling
- ✅ Graceful degradation for service unavailability

**Frontend:**

- ✅ Error boundary components to catch React errors
- ✅ Toast notifications for user feedback
- ✅ Automatic token refresh on 401 responses
- ✅ Network connectivity detection
- ✅ Loading states and error recovery
- ✅ Form validation with user-friendly messages

**Python LLM Server:**

- ✅ Authentication error handling
- ✅ LLM service initialization error recovery
- ✅ MCP client connection error handling
- ✅ Rate limiting and quota management

### Error Categories

1. **Authentication Errors** (401)

   - Invalid credentials
   - Expired tokens
   - Missing authentication headers

2. **Authorization Errors** (403)

   - Insufficient permissions
   - Invalid API keys

3. **Validation Errors** (400)

   - Missing required fields
   - Invalid data formats
   - Malformed requests

4. **Network Errors**

   - Connection timeouts
   - Service unavailable
   - DNS resolution failures

5. **Rate Limiting** (429)

   - API quota exceeded
   - Too many requests

6. **Server Errors** (500+)
   - Internal server errors
   - External API failures
   - Database connection issues

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Security Considerations

- **ngrok tunnels are public** - ensure proper authentication
- **Free ngrok URLs change** on restart - consider paid plan for stable URLs
- **Local development only** - not recommended for production traffic

## Deployment

### Local Development Deployment

The recommended setup for local development with full AI integration:

1. **Prerequisites**

   ```bash
   # Install required tools
   brew install node yarn python ngrok  # macOS
   # or use your system's package manager

   # Sign up for services
   # - ngrok account (free tier available)
   # - OpenAI API key
   ```

2. **Environment Setup**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd MCP-FakeStoreApi

   # Backend setup
   cd server
   yarn install

   # Frontend setup
   cd ../client
   yarn install

   # Python LLM server setup
   cd ../llm-server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configuration**

   ```bash
   # Set up ngrok authentication
   ngrok config add-authtoken YOUR_AUTHTOKEN

   # Configure environment variables (optional)
   cd server
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Running the Complete System**

   ```bash
   # Terminal 1: MCP Backend Server
   cd server && yarn dev
   # ✅ Server running on http://localhost:3000

   # Terminal 2: Python LLM Server
   cd llm-server && python start.py
   # ✅ LLM server running on http://localhost:8000

   # Terminal 3: Frontend Client
   cd client && yarn dev
   # ✅ Frontend running on http://localhost:5173

   # Terminal 4: ngrok Tunnel (for AI integration)
   ngrok http 3000
   # ✅ Public URL: https://abc123.ngrok.io
   ```

### Production Deployment

#### Option 1: Traditional Server Deployment

**Backend (Node.js):**

```bash
# Build and deploy
cd server
yarn build
yarn start

# With PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name mcp-backend
pm2 startup
pm2 save
```

**Frontend (Static Site):**

```bash
# Build for production
cd client
yarn build

# Deploy to static hosting (Netlify, Vercel, S3, etc.)
# Upload dist/ folder contents
```

**Python LLM Server:**

```bash
cd llm-server

# Option 1: Direct deployment
pip install gunicorn
gunicorn app.main:app --host 0.0.0.0 --port 8000

# Option 2: Docker deployment
docker build -t mcp-llm-server .
docker run -p 8000:8000 mcp-llm-server
```

#### Option 2: Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: "3.8"
services:
  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  llm-server:
    build: ./llm-server
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
      - llm-server
```

Deploy with: `docker-compose up -d`

#### Option 3: Cloud Deployment

**Recommended Cloud Platforms:**

1. **Vercel** (Frontend + Serverless Functions)

   - Frontend: Automatic deployment from Git
   - Backend: Serverless functions in `/api`

2. **Railway** (Full-stack)

   - Automatic deployment from Git
   - Built-in PostgreSQL if needed
   - Custom domains included

3. **Render** (Full-stack)

   - Free tier available
   - Automatic deployments
   - Built-in SSL certificates

4. **Google Cloud Platform**
   - Cloud Run for containerized apps
   - App Engine for traditional deployment
   - Cloud Build for CI/CD

### Deployment Checklist

**Security:**

- [ ] Environment variables configured
- [ ] API keys secured (not in source code)
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Rate limiting enabled

**Performance:**

- [ ] Production builds created
- [ ] Static assets cached
- [ ] Database connections pooled
- [ ] Error monitoring enabled

**Monitoring:**

- [ ] Health check endpoints working
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring (if needed)

**Testing:**

- [ ] All tests passing
- [ ] Integration tests verified
- [ ] Load testing completed (if needed)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Run the test suite: `yarn test`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Use semantic commit messages
- Follow SOLID principles
- Keep functions small and focused
- Document complex logic
- Use meaningful variable names

## License

MIT License - see LICENSE file for details
