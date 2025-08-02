import { Tool } from "@langchain/core/tools";
import type { RootState } from "../store";

interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: {
    content: Array<{
      type: string;
      text: string;
    }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class MCPShoppingTool extends Tool {
  name = "mcp_shopping";
  description = `Access to shopping functions via MCP protocol. This tool can:
    - Search for products by query or category
    - Add products to cart
    - Remove products from cart
    - Get cart contents with detailed information
    - Get available product categories

    Use this tool for any shopping-related requests like searching products, managing cart, etc.`;

  private getState: () => RootState;
  private baseUrl: string;

  constructor(
    getState: () => RootState,
    baseUrl = "https://29f37bbbb62f.ngrok-free.app"
  ) {
    super();
    this.getState = getState;
    this.baseUrl = baseUrl;
  }

  async _call(input: string): Promise<string> {
    try {
      const state = this.getState();
      const mcpApiKey = this.getActiveMcpApiKey(state);

      if (!mcpApiKey) {
        throw new Error(
          "No active MCP API key found. Please check your authentication."
        );
      }

      // Determine the appropriate MCP tool and arguments based on input
      const { toolName, arguments: toolArgs } = this.parseInput(input);

      const mcpRequest: MCPRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: toolArgs,
        },
      };

      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MCP-API-Key": mcpApiKey,
        },
        body: JSON.stringify(mcpRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MCPResponse = await response.json();

      if (result.error) {
        throw new Error(`MCP Error: ${result.error.message}`);
      }

      if (result.result?.isError) {
        return result.result.content[0]?.text || "An error occurred";
      }

      return result.result?.content[0]?.text || "No response received";
    } catch (error) {
      console.error("MCPShoppingTool error:", error);
      if (error instanceof Error) {
        return `❌ Error: ${error.message}`;
      }
      return "❌ An unexpected error occurred while processing your request.";
    }
  }

  private getActiveMcpApiKey(state: RootState): string | null {
    const activeKey = state.auth.mcpApiKeys.find((key) => key.isActive);
    if (!activeKey?.key) {
      console.log(
        `🔐 No active MCP key found (${state.auth.mcpApiKeys.length} total keys)`
      );
    }
    return activeKey?.key || null;
  }

  private parseInput(input: string): {
    toolName: string;
    arguments: Record<string, unknown>;
  } {
    const lowercaseInput = input.toLowerCase();

    // Search products
    if (
      lowercaseInput.includes("search") ||
      lowercaseInput.includes("find") ||
      lowercaseInput.includes("look for") ||
      lowercaseInput.includes("show me")
    ) {
      return {
        toolName: "search_products",
        arguments: { query: input, limit: 10 },
      };
    }

    // Add to cart
    if (lowercaseInput.includes("add") && lowercaseInput.includes("cart")) {
      // Extract product name and quantity from input
      const quantityMatch = input.match(/(\d+)\s*(?:x|of|pieces?)?/i);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

      // Simple product name extraction (this could be improved with better NLP)
      let productName = input;
      const addToCartPhrases = ["add", "to cart", "cart", "buy", "purchase"];
      addToCartPhrases.forEach((phrase) => {
        productName = productName.replace(new RegExp(phrase, "gi"), "").trim();
      });

      if (quantityMatch) {
        productName = productName.replace(quantityMatch[0], "").trim();
      }

      return {
        toolName: "add_to_cart",
        arguments: { product_name: productName, quantity },
      };
    }

    // Remove from cart
    if (lowercaseInput.includes("remove") && lowercaseInput.includes("cart")) {
      // For now, we'll need cart_id - this could be enhanced to get from user session
      return {
        toolName: "remove_from_cart",
        arguments: { product_name: input, cart_id: 1 },
      };
    }

    // Get cart
    if (
      lowercaseInput.includes("cart") ||
      lowercaseInput.includes("my cart") ||
      lowercaseInput.includes("show cart")
    ) {
      return {
        toolName: "get_cart",
        arguments: { cart_id: 1 },
      };
    }

    // Get categories
    if (
      lowercaseInput.includes("categories") ||
      lowercaseInput.includes("category") ||
      lowercaseInput.includes("what do you have")
    ) {
      return {
        toolName: "get_categories",
        arguments: {},
      };
    }

    // Default to search
    return {
      toolName: "search_products",
      arguments: { query: input, limit: 10 },
    };
  }
}
