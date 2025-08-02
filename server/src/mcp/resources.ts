import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import productCache from "../services/productCache";
import { SessionManager } from "./session";

const FAKE_STORE_API_BASE = "https://fakestoreapi.com";

export class ResourceHandlers {
  constructor(private sessionManager: SessionManager) {}

  async listResources() {
    return {
      resources: [
        {
          uri: "shopping://products",
          name: "Product Catalog",
          description: "Complete product catalog from Fake Store API",
          mimeType: "application/json",
        },
        {
          uri: "shopping://categories",
          name: "Product Categories",
          description: "All available product categories",
          mimeType: "application/json",
        },
        {
          uri: "shopping://cart/{user_id}",
          name: "User Shopping Cart",
          description: "Shopping cart contents for authenticated user",
          mimeType: "application/json",
        },
      ],
    };
  }

  async readResource(request: any) {
    const { uri } = request.params;

    console.log(`📖 RESOURCE: Reading ${uri}`);

    try {
      if (uri === "shopping://products") {
        return await this.readProductCatalog();
      } else if (uri === "shopping://categories") {
        return await this.readCategories();
      } else if (uri.startsWith("shopping://cart/")) {
        const userId = uri.split("/").pop();
        return await this.readUserCart(parseInt(userId));
      } else {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Unknown resource URI: ${uri}`
        );
      }
    } catch (error: any) {
      console.error(`❌ RESOURCE: Failed to read ${uri}:`, error.message);
      throw error;
    }
  }

  private async readProductCatalog() {
    console.log("📦 RESOURCE: Reading product catalog");

    const products = productCache.getAllProducts();

    return {
      contents: [
        {
          uri: "shopping://products",
          mimeType: "application/json",
          text: JSON.stringify(products, null, 2),
        },
      ],
    };
  }

  private async readCategories() {
    console.log("📂 RESOURCE: Reading categories");

    const categories = productCache.getAllCategories();

    return {
      contents: [
        {
          uri: "shopping://categories",
          mimeType: "application/json",
          text: JSON.stringify(categories, null, 2),
        },
      ],
    };
  }

  private async readUserCart(userId: number) {
    console.log(`🛒 RESOURCE: Reading cart for user ${userId}`);

    // Get user session to verify access
    const userSession = this.sessionManager.getSessionByUserId(userId);
    if (!userSession) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "User not authenticated or session not found"
      );
    }

    try {
      // Get user's carts from Fake Store API
      const response = await axios.get(
        `${FAKE_STORE_API_BASE}/carts/user/${userId}`
      );
      const carts = response.data;

      if (!carts || carts.length === 0) {
        return {
          contents: [
            {
              uri: `shopping://cart/${userId}`,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  message: "No carts found for user",
                  userId: userId,
                  carts: [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Get the most recent cart
      const latestCart = carts.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      // Enhance cart with product details
      const enhancedCart = {
        ...latestCart,
        products: latestCart.products.map((cartProduct: any) => {
          const product = productCache.findProductById(cartProduct.productId);
          return {
            ...cartProduct,
            id: cartProduct.productId,
            title: product?.title || "Unknown Product",
            price: product?.price || 0,
            category: product?.category || "unknown",
            image: product?.image || "",
            quantity: cartProduct.quantity,
          };
        }),
        totalItems: latestCart.products.reduce(
          (sum: number, p: any) => sum + p.quantity,
          0
        ),
        totalPrice: latestCart.products.reduce((sum: number, p: any) => {
          const product = productCache.findProductById(p.productId);
          return sum + (product ? product.price * p.quantity : 0);
        }, 0),
      };

      return {
        contents: [
          {
            uri: `shopping://cart/${userId}`,
            mimeType: "application/json",
            text: JSON.stringify(enhancedCart, null, 2),
          },
        ],
      };
    } catch (apiError: any) {
      console.error("❌ RESOURCE: API error:", apiError.message);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read user cart: ${apiError.message}`
      );
    }
  }
}
