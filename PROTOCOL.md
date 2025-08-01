# MCP Shopping Assistant Server Specification

This document defines the Model Context Protocol (MCP) implementation for a shopping assistant server that interfaces with the Fake Store API. This server is fully compliant with the MCP specification using JSON-RPC 2.0.

## Table of Contents

- [Overview](#overview)
- [Transport](#transport)
- [Initialization](#initialization)
- [Authentication Strategy](#authentication-strategy)
- [Tools](#tools)
- [Resources](#resources)
- [Error Handling](#error-handling)
- [Data Types](#data-types)

## Overview

This MCP server provides shopping assistant capabilities through the Model Context Protocol. It implements:

- **5 Tools** for shopping operations (search, cart management, etc.)
- **3 Resources** for data access (products, cart, categories)
- **User Context Management** for multi-user support
- **Fake Store API Integration** for e-commerce operations

**Server Information:**

- Protocol Version: MCP 1.0
- Implementation: JSON-RPC 2.0 over HTTP
- Transport: HTTP (port 3000) or stdio

## Transport

### HTTP Transport

- **Local URL**: `http://localhost:3000/mcp`
- **ngrok URL**: `https://{tunnel-id}.ngrok.io/mcp` (for cloud LLM access)
- **Method**: POST
- **Content-Type**: `application/json`
- **Protocol**: JSON-RPC 2.0

### stdio Transport

- **Standard Input/Output**: JSON-RPC 2.0 messages
- **Line-delimited**: Each message on separate line
- **Use Case**: Local LLM clients (Claude Desktop, Cursor)

## Initialization

All MCP communication begins with capability negotiation.

### Initialize Request

```json
{
  "jsonrpc": "2.0",
  "id": "init-1",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "clientInfo": {
      "name": "shopping-client",
      "version": "1.0.0"
    }
  }
}
```

### Initialize Response

```json
{
  "jsonrpc": "2.0",
  "id": "init-1",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "fake-store-mcp-server",
      "version": "1.0.0"
    }
  }
}
```

## Authentication Strategy

**Challenge**: MCP has no built-in authentication mechanism.

**Solution**: HTTP header-based authentication with API keys

### Method 1: API Key Authentication (Recommended)

**Header**: `X-MCP-API-Key: mcp_abc123...`

API keys provide secure, revocable access without exposing user credentials.

#### API Key Management Flow

1. **User Login**: Authenticate via REST API (`POST /login`)
2. **Generate API Key**: Create API key (`POST /api-keys`)
3. **LLM Configuration**: Configure LLM with API key
4. **MCP Requests**: LLM includes API key in headers

#### Example MCP Request with API Key

```bash
curl -X POST 'http://localhost:3000/mcp' \
  -H 'Content-Type: application/json' \
  -H 'X-MCP-API-Key: mcp_abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234' \
  -d '{
    "jsonrpc": "2.0",
    "id": "tools-1",
    "method": "tools/list"
  }'
```

### Method 2: Basic Credentials Authentication (Fallback)

**Header**: `X-MCP-Auth: base64(username:password)`

Direct credential authentication for development and testing.

#### Example MCP Request with Credentials

```bash
# Generate auth header
AUTH_HEADER=$(echo -n "johnd:m38rmF$" | base64)

curl -X POST 'http://localhost:3000/mcp' \
  -H 'Content-Type: application/json' \
  -H 'X-MCP-Auth: am9obmQ6bTM4cm1GJA==' \
  -d '{
    "jsonrpc": "2.0",
    "id": "tools-1",
    "method": "tools/list"
  }'
```

### API Key Management Endpoints

#### Create API Key

```bash
POST /api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My LLM Client"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "key_123",
    "name": "My LLM Client",
    "key": "mcp_abcd1234...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### List API Keys

```bash
GET /api-keys
Authorization: Bearer <jwt_token>
```

#### Revoke API Key

```bash
PUT /api-keys/{keyId}/revoke
Authorization: Bearer <jwt_token>
```

#### Delete API Key

```bash
DELETE /api-keys/{keyId}
Authorization: Bearer <jwt_token>
```

**Security Features:**

- API keys are hashed for storage
- Keys can be revoked or deleted
- Last used timestamps for monitoring
- User-scoped key management

## Tools

### List Tools

```json
{
  "jsonrpc": "2.0",
  "id": "tools-1",
  "method": "tools/list"
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "tools-1",
  "result": {
    "tools": [
      {
        "name": "search_products",
        "description": "Search for products in the store catalog",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search term for product title, description, or category"
            },
            "category": {
              "type": "string",
              "description": "Filter by product category"
            },
            "limit": {
              "type": "number",
              "description": "Maximum number of results (default: 20)"
            }
          },
          "required": ["query"]
        }
      },
      {
        "name": "add_to_cart",
        "description": "Add a product to the shopping cart",
        "inputSchema": {
          "type": "object",
          "properties": {
            "product_name": {
              "type": "string",
              "description": "Name of the product to add"
            },
            "quantity": {
              "type": "number",
              "description": "Quantity to add (must be positive)"
            },
            "cart_id": {
              "type": "number",
              "description": "Optional cart ID (creates new cart if not provided)"
            }
          },
          "required": ["product_name", "quantity"]
        }
      },
      {
        "name": "remove_from_cart",
        "description": "Remove a product from the shopping cart",
        "inputSchema": {
          "type": "object",
          "properties": {
            "product_name": {
              "type": "string",
              "description": "Name of the product to remove"
            },
            "cart_id": {
              "type": "number",
              "description": "Cart ID to remove from"
            },
            "quantity": {
              "type": "number",
              "description": "Quantity to remove (removes all if not specified)"
            }
          },
          "required": ["product_name", "cart_id"]
        }
      },
      {
        "name": "get_cart",
        "description": "Get cart contents with detailed product information",
        "inputSchema": {
          "type": "object",
          "properties": {
            "cart_id": {
              "type": "number",
              "description": "Cart ID to retrieve"
            }
          },
          "required": ["cart_id"]
        }
      },
      {
        "name": "get_categories",
        "description": "Get all available product categories",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      }
    ]
  }
}
```

### Tool Call Examples

#### 1. Search Products

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "search-1",
  "method": "tools/call",
  "params": {
    "name": "search_products",
    "arguments": {
      "query": "jacket",
      "category": "men's clothing",
      "limit": 5
    }
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "search-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 1 product matching 'jacket' in men's clothing:\n\n1. Mens Cotton Jacket - $55.99\n   Category: men's clothing\n   Rating: 4.7/5 (500 reviews)\n   Description: Great outerwear for spring and fall..."
      }
    ],
    "isError": false
  }
}
```

#### 2. Add to Cart

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "method": "tools/call",
  "params": {
    "name": "add_to_cart",
    "arguments": {
      "product_name": "Mens Cotton Jacket",
      "quantity": 2
    }
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Added 2x Mens Cotton Jacket ($55.99 each) to your cart.\n\nCart ID: 123\nTotal items in cart: 2\nCart total: $111.98"
      }
    ],
    "isError": false
  }
}
```

#### 3. Get Cart

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "cart-1",
  "method": "tools/call",
  "params": {
    "name": "get_cart",
    "arguments": {
      "cart_id": 123
    }
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "cart-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "🛒 Your Cart (ID: 123)\n\n1. Mens Cotton Jacket\n   Price: $55.99 each\n   Quantity: 2\n   Subtotal: $111.98\n\n📊 Cart Summary:\n   Total Items: 2\n   Total Price: $111.98"
      }
    ],
    "isError": false
  }
}
```

#### 4. Remove from Cart

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "remove-1",
  "method": "tools/call",
  "params": {
    "name": "remove_from_cart",
    "arguments": {
      "product_name": "Mens Cotton Jacket",
      "cart_id": 123,
      "quantity": 1
    }
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "remove-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Removed 1x Mens Cotton Jacket from your cart.\n\nRemaining in cart: 1x Mens Cotton Jacket\nNew cart total: $55.99"
      }
    ],
    "isError": false
  }
}
```

#### 5. Get Categories

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "categories-1",
  "method": "tools/call",
  "params": {
    "name": "get_categories",
    "arguments": {}
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "categories-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "📂 Available Categories:\n\n• electronics\n• jewelery\n• men's clothing\n• women's clothing"
      }
    ],
    "isError": false
  }
}
```

## Resources

### List Resources

```json
{
  "jsonrpc": "2.0",
  "id": "resources-1",
  "method": "resources/list"
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "resources-1",
  "result": {
    "resources": [
      {
        "uri": "shopping://products",
        "name": "Product Catalog",
        "description": "Complete product catalog from Fake Store API",
        "mimeType": "application/json"
      },
      {
        "uri": "shopping://categories",
        "name": "Product Categories",
        "description": "All available product categories",
        "mimeType": "application/json"
      },
      {
        "uri": "shopping://cart/{user_id}",
        "name": "User Shopping Cart",
        "description": "Shopping cart contents for authenticated user",
        "mimeType": "application/json"
      }
    ]
  }
}
```

### Read Resource Examples

#### 1. Get Product Catalog

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "read-1",
  "method": "resources/read",
  "params": {
    "uri": "shopping://products"
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "read-1",
  "result": {
    "contents": [
      {
        "uri": "shopping://products",
        "mimeType": "application/json",
        "text": "[\n  {\n    \"id\": 1,\n    \"title\": \"Fjallraven - Foldsack No. 1 Backpack\",\n    \"price\": 109.95,\n    \"description\": \"Your perfect pack for everyday use...\",\n    \"category\": \"men's clothing\",\n    \"image\": \"https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg\",\n    \"rating\": { \"rate\": 3.9, \"count\": 120 }\n  }\n  // ... more products\n]"
      }
    ]
  }
}
```

#### 2. Get User Cart

**Request**

```json
{
  "jsonrpc": "2.0",
  "id": "read-2",
  "method": "resources/read",
  "params": {
    "uri": "shopping://cart/1"
  }
}
```

**Response**

```json
{
  "jsonrpc": "2.0",
  "id": "read-2",
  "result": {
    "contents": [
      {
        "uri": "shopping://cart/1",
        "mimeType": "application/json",
        "text": "{\n  \"id\": 123,\n  \"userId\": 1,\n  \"date\": \"2024-01-15T10:30:00.000Z\",\n  \"products\": [\n    {\n      \"id\": 1,\n      \"title\": \"Mens Cotton Jacket\",\n      \"price\": 55.99,\n      \"quantity\": 2\n    }\n  ],\n  \"totalItems\": 2,\n  \"totalPrice\": 111.98\n}"
      }
    ]
  }
}
```

## Error Handling

MCP uses JSON-RPC 2.0 error format for all errors.

### Error Response Structure

```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": "number",
    "message": "string",
    "data": "object|optional"
  }
}
```

### Error Codes

| Code   | Name                     | Description                                |
| ------ | ------------------------ | ------------------------------------------ |
| -1     | `USER_NOT_AUTHENTICATED` | User context not set or invalid            |
| -2     | `PRODUCT_NOT_FOUND`      | Specified product does not exist           |
| -3     | `CART_NOT_FOUND`         | Specified cart does not exist              |
| -4     | `INVALID_PARAMETERS`     | Tool parameters are invalid                |
| -5     | `EXTERNAL_API_ERROR`     | Fake Store API returned an error           |
| -6     | `CART_OPERATION_FAILED`  | Cart operation failed                      |
| -32700 | `PARSE_ERROR`            | Invalid JSON (JSON-RPC standard)           |
| -32600 | `INVALID_REQUEST`        | Invalid request object (JSON-RPC standard) |
| -32601 | `METHOD_NOT_FOUND`       | Method not found (JSON-RPC standard)       |
| -32602 | `INVALID_PARAMS`         | Invalid parameters (JSON-RPC standard)     |
| -32603 | `INTERNAL_ERROR`         | Internal error (JSON-RPC standard)         |

### Example Error Responses

**User Not Authenticated**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "error": {
    "code": -1,
    "message": "User not authenticated",
    "data": {
      "details": "Please call shopping/set_user_context first"
    }
  }
}
```

**Product Not Found**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "error": {
    "code": -2,
    "message": "Product not found",
    "data": {
      "searchedTerm": "Red T-Shirt",
      "suggestion": "Try searching with partial name or different spelling"
    }
  }
}
```

**Invalid Parameters**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "error": {
    "code": -4,
    "message": "Invalid parameters",
    "data": {
      "field": "quantity",
      "value": -1,
      "requirement": "must be positive integer"
    }
  }
}
```

**Tool Call Error (isError: true)**

```json
{
  "jsonrpc": "2.0",
  "id": "add-1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "❌ Error: Product 'Red T-Shirt' not found. Try searching for similar products first."
      }
    ],
    "isError": true
  }
}
```

## Data Types

### Product Object

```typescript
interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}
```

### Cart Object

```typescript
interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
  totalItems: number;
  totalPrice: number;
}

interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}
```

### User Object

```typescript
interface User {
  id: number;
  firstName: string;
  username: string;
}
```

## Protocol Compliance

This document describes:

- **MCP Protocol Version**: 2024-11-05
- **JSON-RPC Version**: 2.0
- **Transport**: HTTP and stdio
- **Content-Type**: `application/json`

## Implementation Notes

- **User Context**: Managed server-side after authentication
- **Product Cache**: In-memory cache for fast product searches
- **Cart Persistence**: Via Fake Store API cart operations
- **Error Handling**: Both JSON-RPC errors and tool result errors
- **Resource URIs**: Custom `shopping://` scheme for resource identification
- **Thread Safety**: Single-user context per MCP session
- **Tool Results**: Human-readable text format for AI consumption
- **Cloud LLM Access**: Server exposed via ngrok tunnel for OpenAI/cloud LLM accessibility
- **Local Development**: Runs on localhost:3000, tunneled via ngrok for external access

## Differences from REST Implementation

| Aspect             | REST API               | MCP Implementation            |
| ------------------ | ---------------------- | ----------------------------- |
| **Transport**      | HTTP endpoints         | JSON-RPC 2.0                  |
| **Authentication** | JWT tokens             | User context setting          |
| **Actions**        | POST with action field | Tool calls                    |
| **Data Access**    | API responses          | Resources + Tools             |
| **Error Format**   | Custom success/error   | JSON-RPC errors               |
| **Discovery**      | Fixed endpoints        | Dynamic tool/resource listing |
