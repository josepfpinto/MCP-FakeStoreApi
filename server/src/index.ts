import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productCache from "./services/productCache";
import { createMCPServer } from "./mcp/server";
import authRoutes from "./routes/auth";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize product cache
    console.log("🔄 Initializing product cache...");
    await productCache.initialize();
    console.log("✅ Product cache initialized successfully");

    // Create Express app for REST endpoints
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // REST routes for frontend
    app.use("/", authRoutes);

    // Create and mount MCP server for cloud LLMs
    const mcpServer = await createMCPServer();
    app.use("/mcp", mcpServer);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔐 REST API available for frontend authentication`);
      console.log(`🤖 MCP server available at http://localhost:${PORT}/mcp`);
      console.log(
        `🌐 Expose via ngrok for cloud LLM access: ngrok http ${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer();
