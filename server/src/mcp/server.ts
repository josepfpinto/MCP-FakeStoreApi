import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { SessionManager } from "./session";
import { ToolHandlers } from "./tools";
import { ResourceHandlers } from "./resources";
import { authenticateUser } from "../controllers/authController";
import { User } from "../types";

// Extend Express Request type
interface AuthenticatedRequest extends express.Request {
  user?: User;
}

// HTTP Authentication Middleware
async function authenticateRequest(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    // Extract credentials from custom header or body
    const authHeader = req.headers["x-mcp-auth"];
    if (!authHeader) {
      return res.status(401).json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: {
          code: -32001,
          message: "Authentication required",
          data: "Include X-MCP-Auth header with base64(username:password)",
        },
      });
    }

    // Decode credentials
    const [username, password] = Buffer.from(authHeader as string, "base64")
      .toString()
      .split(":");

    if (!username || !password) {
      return res.status(401).json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: { code: -32001, message: "Invalid authentication format" },
      });
    }

    // Authenticate user
    const loginResult = await authenticateUser({ username, password });
    if (!loginResult.success || !loginResult.user) {
      return res.status(401).json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: { code: -32001, message: "Invalid credentials" },
      });
    }

    // Store user in request for session manager
    req.user = loginResult.user;
    next();
  } catch (error: any) {
    console.error("❌ AUTH: Authentication failed:", error.message);
    return res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: { code: -32603, message: "Authentication error" },
    });
  }
}

export async function createMCPServer() {
  // Create MCP server instance
  const server = new Server(
    {
      name: "fake-store-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
      },
    }
  );

  // Initialize session manager
  const sessionManager = new SessionManager();

  // Initialize handlers
  const toolHandlers = new ToolHandlers(sessionManager);
  const resourceHandlers = new ResourceHandlers(sessionManager);

  // Register standard MCP methods with proper schemas
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return await toolHandlers.listTools();
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await toolHandlers.callTool(request);
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return await resourceHandlers.listResources();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return await resourceHandlers.readResource(request);
  });

  // Create Express router for HTTP transport
  const router = express.Router();

  // Initialize endpoint (no auth required)
  router.post("/", (req, res, next) => {
    if (req.body.method === "initialize") {
      return res.json({
        jsonrpc: "2.0",
        id: req.body.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
          },
          serverInfo: {
            name: "fake-store-mcp-server",
            version: "1.0.0",
          },
        },
      });
    }
    next();
  });

  // All other methods require authentication
  router.post("/", authenticateRequest as any);

  // Handle authenticated MCP requests
  router.post("/", (async (
    req: AuthenticatedRequest,
    res: express.Response
  ) => {
    try {
      const { method, params, id } = req.body;

      // Create session for this request
      let sessionId;
      if (req.user) {
        sessionId = sessionManager.createSession(req.user);
        console.log(
          `🔐 MCP: Created session ${sessionId} for user ${req.user.username}`
        );
      }

      // Handle MCP method
      let result;
      switch (method) {
        case "tools/list":
          result = await toolHandlers.listTools();
          break;
        case "tools/call":
          result = await toolHandlers.callTool({ method, params });
          break;
        case "resources/list":
          result = await resourceHandlers.listResources();
          break;
        case "resources/read":
          result = await resourceHandlers.readResource({ method, params });
          break;
        default:
          throw new Error(`Method ${method} not supported`);
      }

      res.json({
        jsonrpc: "2.0",
        id,
        result,
      });
    } catch (error: any) {
      console.error("❌ MCP: Request failed:", error.message);

      res.status(500).json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: {
          code: -32603,
          message: error.message || "Internal error",
        },
      });
    }
  }) as any);

  return router;
}
