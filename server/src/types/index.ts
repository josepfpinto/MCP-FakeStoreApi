// Product interface based on Fake Store API response
export interface Product {
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

// Cart product as returned by Fake Store API
export interface CartProduct {
  productId: number;
  quantity: number;
}

// Enhanced cart product with full product details for responses
export interface CartProductWithDetails {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
}

// Cart interface based on Fake Store API response
export interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
}

// Enhanced cart with product details and totals
export interface CartWithDetails {
  id: number;
  userId: number;
  date: string;
  products: CartProductWithDetails[];
  totalItems: number;
  totalPrice: number;
}

// User interface
export interface User {
  id: number;
  firstName: string;
  username: string;
  email?: string;
  name?: {
    firstname: string;
    lastname: string;
  };
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Login request/response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    firstName: string;
    username: string;
  };
}

// Error codes from PROTOCOL.md
export enum ErrorCodes {
  INVALID_TOKEN = "INVALID_TOKEN",
  MISSING_AUTH = "MISSING_AUTH",
  INVALID_ACTION = "INVALID_ACTION",
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
  INVALID_PARAMETERS = "INVALID_PARAMETERS",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  CART_NOT_FOUND = "CART_NOT_FOUND",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// JWT token payload interface
export interface TokenPayload {
  sub: string; // user id
  user: string; // username
  iat: number; // issued at
}

// API Key interfaces
export interface ApiKey {
  id: string;
  userId: number;
  name: string;
  key: string; // hashed
  lastUsed?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // raw key (only returned once)
  createdAt: Date;
  isActive: boolean;
}
