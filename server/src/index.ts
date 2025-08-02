import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productCache from "./services/productCache";
import { createMCPServer } from "./mcp/server";
import authRoutes from "./routes/auth";
import apiKeyRoutes from "./routes/apiKeys";
import logger from "./utils/logger";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize product cache
    logger.info("🔄 Initializing product cache...");
    await productCache.initialize();
    logger.info("✅ Product cache initialized successfully");

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
    app.use("/api-keys", apiKeyRoutes);

    // Create and mount MCP server for cloud LLMs
    const mcpServer = await createMCPServer();
    app.use("/mcp", mcpServer);

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔐 REST API available for frontend authentication`);
      logger.info(`🤖 MCP server available at http://localhost:${PORT}/mcp`);
      logger.info(
        `🌐 Expose via ngrok for cloud LLM access: ngrok http ${PORT}`
      );
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer();
