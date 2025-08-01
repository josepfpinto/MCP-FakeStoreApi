import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import productCache from "../services/productCache";
import { SessionManager, UserSession } from "./session";
import { Product } from "../types";

const FAKE_STORE_API_BASE = "https://fakestoreapi.com";

export class ToolHandlers {
  constructor(private sessionManager: SessionManager) {}

  async listTools() {
    return {
      tools: [
        {
          name: "search_products",
          description: "Search for products in the store catalog",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "Search term for product title, description, or category",
              },
              category: {
                type: "string",
                description: "Filter by product category",
              },
              limit: {
                type: "number",
                description: "Maximum number of results (default: 20)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "add_to_cart",
          description: "Add a product to the shopping cart",
          inputSchema: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "Name of the product to add",
              },
              quantity: {
                type: "number",
                description: "Quantity to add (must be positive)",
              },
              cart_id: {
                type: "number",
                description:
                  "Optional cart ID (creates new cart if not provided)",
              },
            },
            required: ["product_name", "quantity"],
          },
        },
        {
          name: "remove_from_cart",
          description: "Remove a product from the shopping cart",
          inputSchema: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "Name of the product to remove",
              },
              cart_id: {
                type: "number",
                description: "Cart ID to remove from",
              },
              quantity: {
                type: "number",
                description:
                  "Quantity to remove (removes all if not specified)",
              },
            },
            required: ["product_name", "cart_id"],
          },
        },
        {
          name: "get_cart",
          description: "Get cart contents with detailed product information",
          inputSchema: {
            type: "object",
            properties: {
              cart_id: {
                type: "number",
                description: "Cart ID to retrieve",
              },
            },
            required: ["cart_id"],
          },
        },
        {
          name: "get_categories",
          description: "Get all available product categories",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  }

  async callTool(request: any) {
    const { name, arguments: args } = request.params;

    console.log(`🔧 TOOL: Calling ${name} with args:`, args);

    try {
      switch (name) {
        case "search_products":
          return await this.handleSearchProducts(args);
        case "add_to_cart":
          return await this.handleAddToCart(args);
        case "remove_from_cart":
          return await this.handleRemoveFromCart(args);
        case "get_cart":
          return await this.handleGetCart(args);
        case "get_categories":
          return await this.handleGetCategories(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error: any) {
      console.error(`❌ TOOL: ${name} failed:`, error.message);

      // Return error as tool result (not exception)
      return {
        content: [
          {
            type: "text",
            text: `❌ Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleSearchProducts(args: any) {
    const { query, category, limit = 20 } = args;

    if (!query) {
      throw new Error("Search query is required");
    }

    console.log(
      `🔍 SEARCH: Looking for '${query}' in category '${category || "all"}'`
    );

    const results = productCache.searchProducts(query, category, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No products found matching '${query}'${
              category ? ` in category '${category}'` : ""
            }`,
          },
        ],
        isError: false,
      };
    }

    const productList = results
      .map(
        (product, index) =>
          `${index + 1}. ${product.title} - $${product.price}\n` +
          `   Category: ${product.category}\n` +
          `   Rating: ${product.rating?.rate}/5 (${product.rating?.count} reviews)\n` +
          `   Description: ${product.description.substring(0, 100)}...`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} product${
            results.length > 1 ? "s" : ""
          } matching '${query}'${
            category ? ` in category '${category}'` : ""
          }:\n\n${productList}`,
        },
      ],
      isError: false,
    };
  }

  private async handleAddToCart(args: any) {
    const { product_name, quantity, cart_id } = args;

    if (!product_name || !quantity || quantity <= 0) {
      throw new Error("Product name and positive quantity are required");
    }

    // Get user session
    const userSession = this.sessionManager.getDefaultSession();
    if (!userSession) {
      throw new Error(
        "No authenticated user found. Please set user context first."
      );
    }

    console.log(
      `🛒 ADD: Adding ${quantity}x '${product_name}' to cart for user ${userSession.user.username}`
    );

    // Find the product
    const product = productCache.findProductByName(product_name);
    if (!product) {
      throw new Error(
        `Product '${product_name}' not found. Try searching for products first.`
      );
    }

    try {
      let cartData;

      if (cart_id) {
        // Update existing cart
        const response = await axios.get(
          `${FAKE_STORE_API_BASE}/carts/${cart_id}`
        );
        const existingCart = response.data;

        // Add or update product in cart
        const existingProductIndex = existingCart.products.findIndex(
          (p: any) => p.productId === product.id
        );

        if (existingProductIndex >= 0) {
          existingCart.products[existingProductIndex].quantity += quantity;
        } else {
          existingCart.products.push({
            productId: product.id,
            quantity: quantity,
          });
        }

        const updateResponse = await axios.put(
          `${FAKE_STORE_API_BASE}/carts/${cart_id}`,
          {
            userId: userSession.user.id,
            date: new Date().toISOString(),
            products: existingCart.products,
          }
        );

        cartData = updateResponse.data;
      } else {
        // Create new cart
        const response = await axios.post(`${FAKE_STORE_API_BASE}/carts`, {
          userId: userSession.user.id,
          date: new Date().toISOString(),
          products: [
            {
              productId: product.id,
              quantity: quantity,
            },
          ],
        });

        cartData = response.data;
      }

      const totalItems =
        cartData.products?.reduce(
          (sum: number, p: any) => sum + p.quantity,
          0
        ) || quantity;
      const totalPrice = (product.price * quantity).toFixed(2);

      return {
        content: [
          {
            type: "text",
            text: `✅ Added ${quantity}x ${product.title} ($${product.price} each) to your cart.\n\nCart ID: ${cartData.id}\nTotal items in cart: ${totalItems}\nSubtotal for this item: $${totalPrice}`,
          },
        ],
        isError: false,
      };
    } catch (apiError: any) {
      console.error("❌ ADD: API error:", apiError.message);
      throw new Error(`Failed to add item to cart: ${apiError.message}`);
    }
  }

  private async handleRemoveFromCart(args: any) {
    const { product_name, cart_id, quantity } = args;

    if (!product_name || !cart_id) {
      throw new Error("Product name and cart ID are required");
    }

    // Get user session
    const userSession = this.sessionManager.getDefaultSession();
    if (!userSession) {
      throw new Error(
        "No authenticated user found. Please set user context first."
      );
    }

    console.log(`🗑️ REMOVE: Removing '${product_name}' from cart ${cart_id}`);

    // Find the product
    const product = productCache.findProductByName(product_name);
    if (!product) {
      throw new Error(`Product '${product_name}' not found`);
    }

    try {
      // Get current cart
      const response = await axios.get(
        `${FAKE_STORE_API_BASE}/carts/${cart_id}`
      );
      const cart = response.data;

      // Find product in cart
      const productIndex = cart.products.findIndex(
        (p: any) => p.productId === product.id
      );

      if (productIndex === -1) {
        throw new Error(`Product '${product_name}' not found in cart`);
      }

      // Remove or update quantity
      if (quantity && quantity > 0) {
        cart.products[productIndex].quantity -= quantity;
        if (cart.products[productIndex].quantity <= 0) {
          cart.products.splice(productIndex, 1);
        }
      } else {
        cart.products.splice(productIndex, 1);
      }

      // Update cart
      const updateResponse = await axios.put(
        `${FAKE_STORE_API_BASE}/carts/${cart_id}`,
        {
          userId: userSession.user.id,
          date: new Date().toISOString(),
          products: cart.products,
        }
      );

      const remainingQuantity =
        cart.products.find((p: any) => p.productId === product.id)?.quantity ||
        0;
      const totalItems = cart.products.reduce(
        (sum: number, p: any) => sum + p.quantity,
        0
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Removed ${quantity || "all"} ${
              product.title
            } from your cart.\n\n${
              remainingQuantity > 0
                ? `Remaining in cart: ${remainingQuantity}x ${product.title}\n`
                : ""
            }Total items in cart: ${totalItems}`,
          },
        ],
        isError: false,
      };
    } catch (apiError: any) {
      console.error("❌ REMOVE: API error:", apiError.message);
      throw new Error(`Failed to remove item from cart: ${apiError.message}`);
    }
  }

  private async handleGetCart(args: any) {
    const { cart_id } = args;

    if (!cart_id) {
      throw new Error("Cart ID is required");
    }

    console.log(`📋 CART: Getting cart ${cart_id}`);

    try {
      const response = await axios.get(
        `${FAKE_STORE_API_BASE}/carts/${cart_id}`
      );
      const cart = response.data;

      if (!cart.products || cart.products.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `🛒 Cart ${cart_id} is empty`,
            },
          ],
          isError: false,
        };
      }

      // Get detailed product info for each item in cart
      const cartItems = cart.products.map((cartProduct: any) => {
        const product = productCache.findProductById(cartProduct.productId);
        if (!product) {
          return `${cartProduct.quantity}x Unknown Product (ID: ${cartProduct.productId})`;
        }

        const subtotal = (product.price * cartProduct.quantity).toFixed(2);
        return `${cartProduct.quantity}x ${product.title}\n   Price: $${product.price} each\n   Subtotal: $${subtotal}`;
      });

      const totalItems = cart.products.reduce(
        (sum: number, p: any) => sum + p.quantity,
        0
      );
      const totalPrice = cart.products
        .reduce((sum: number, p: any) => {
          const product = productCache.findProductById(p.productId);
          return sum + (product ? product.price * p.quantity : 0);
        }, 0)
        .toFixed(2);

      return {
        content: [
          {
            type: "text",
            text: `🛒 Your Cart (ID: ${cart_id})\n\n${cartItems.join(
              "\n\n"
            )}\n\n📊 Cart Summary:\n   Total Items: ${totalItems}\n   Total Price: $${totalPrice}`,
          },
        ],
        isError: false,
      };
    } catch (apiError: any) {
      console.error("❌ CART: API error:", apiError.message);
      throw new Error(`Failed to get cart: ${apiError.message}`);
    }
  }

  private async handleGetCategories(args: any) {
    console.log("📂 CATEGORIES: Getting all categories");

    const categories = productCache.getAllCategories();

    return {
      content: [
        {
          type: "text",
          text: `📂 Available Categories:\n\n${categories
            .map((cat) => `• ${cat}`)
            .join("\n")}`,
        },
      ],
      isError: false,
    };
  }
}
