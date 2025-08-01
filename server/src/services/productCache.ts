import axios from "axios";
import { Product } from "../types";
import logger from "../utils/logger";

class ProductCache {
  private products: Product[] = [];
  private categories: string[] = [];
  private isInitialized = false;
  private readonly FAKE_STORE_API_BASE = "https://fakestoreapi.com";

  async initialize(): Promise<void> {
    try {
      logger.info("🏪 CACHE: Initializing product cache...");

      // Fetch all products
      logger.info("📦 CACHE: Fetching all products from Fake Store API...");
      const productsResponse = await axios.get<Product[]>(
        `${this.FAKE_STORE_API_BASE}/products`
      );
      this.products = productsResponse.data;
      logger.info(`📦 CACHE: Loaded ${this.products.length} products`);

      // Fetch all categories
      logger.info("📂 CACHE: Fetching categories from Fake Store API...");
      const categoriesResponse = await axios.get<string[]>(
        `${this.FAKE_STORE_API_BASE}/products/categories`
      );
      this.categories = categoriesResponse.data;
      logger.info(
        `📂 CACHE: Loaded ${this.categories.length} categories:`,
        this.categories
      );

      this.isInitialized = true;
      logger.info(
        `✅ CACHE: Product cache initialized successfully with ${this.products.length} products and ${this.categories.length} categories`
      );
    } catch (error) {
      logger.error("Failed to initialize product cache:", error);
      throw new Error("Failed to initialize product cache");
    }
  }

  getAllProducts(): Product[] {
    this.ensureInitialized();
    return this.products;
  }

  getAllCategories(): string[] {
    this.ensureInitialized();
    return this.categories;
  }

  searchProducts(query: string, category?: string, limit?: number): Product[] {
    this.ensureInitialized();

    const searchTerm = query.toLowerCase();
    let filteredProducts = this.products.filter((product) => {
      const matchesQuery =
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);

      const matchesCategory =
        !category || product.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCategory;
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      filteredProducts = filteredProducts.slice(0, limit);
    }

    return filteredProducts;
  }

  findProductByName(productName: string): Product | undefined {
    this.ensureInitialized();

    const searchTerm = productName.toLowerCase();
    return this.products.find(
      (product) =>
        product.title.toLowerCase() === searchTerm ||
        product.title.toLowerCase().includes(searchTerm)
    );
  }

  getProductById(productId: number): Product | undefined {
    this.ensureInitialized();
    return this.products.find((product) => product.id === productId);
  }

  // Alias for consistency with findProductByName
  findProductById(productId: number): Product | undefined {
    return this.getProductById(productId);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "Product cache not initialized. Call initialize() first."
      );
    }
  }
}

// Create singleton instance
export const productCache = new ProductCache();
export default productCache;
