import crypto from "crypto";
import { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from "../types";

// In-memory storage for demo (in production, use database)
const apiKeys: Map<string, ApiKey> = new Map();
const userApiKeys: Map<number, string[]> = new Map();

/**
 * Generate a secure API key
 */
function generateApiKey(): string {
  return `mcp_${crypto.randomBytes(32).toString("hex")}`;
}

/**
 * Hash an API key for storage
 */
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Create a new API key for a user
 */
export function createApiKey(
  userId: number,
  request: CreateApiKeyRequest
): CreateApiKeyResponse {
  const rawKey = generateApiKey();
  const hashedKey = hashApiKey(rawKey);
  const keyId = crypto.randomUUID();

  const apiKey: ApiKey = {
    id: keyId,
    userId,
    name: request.name,
    key: hashedKey,
    createdAt: new Date(),
    isActive: true,
  };

  // Store the API key
  apiKeys.set(keyId, apiKey);

  // Track user's keys
  if (!userApiKeys.has(userId)) {
    userApiKeys.set(userId, []);
  }
  userApiKeys.get(userId)!.push(keyId);

  console.log(`🔑 API: Created API key "${request.name}" for user ${userId}`);

  return {
    id: keyId,
    name: request.name,
    key: rawKey, // Only return raw key once
    createdAt: apiKey.createdAt,
    isActive: apiKey.isActive,
  };
}

/**
 * Validate an API key and return user info
 */
export function validateApiKey(rawKey: string): {
  isValid: boolean;
  userId?: number;
  keyId?: string;
} {
  if (!rawKey.startsWith("mcp_")) {
    return { isValid: false };
  }

  const hashedKey = hashApiKey(rawKey);

  // Find matching API key
  for (const [keyId, apiKey] of apiKeys.entries()) {
    if (apiKey.key === hashedKey && apiKey.isActive) {
      // Update last used
      apiKey.lastUsed = new Date();

      console.log(
        `✅ API: Validated API key "${apiKey.name}" for user ${apiKey.userId}`
      );

      return {
        isValid: true,
        userId: apiKey.userId,
        keyId,
      };
    }
  }

  console.log(`❌ API: Invalid API key attempted`);
  return { isValid: false };
}

/**
 * Get all API keys for a user
 */
export function getUserApiKeys(userId: number): Omit<ApiKey, "key">[] {
  const userKeys = userApiKeys.get(userId) || [];

  return userKeys
    .map((keyId) => apiKeys.get(keyId))
    .filter((key): key is ApiKey => key !== undefined)
    .map(({ key, ...apiKey }) => apiKey); // Remove the hashed key from response
}

/**
 * Revoke an API key
 */
export function revokeApiKey(userId: number, keyId: string): boolean {
  const apiKey = apiKeys.get(keyId);

  if (!apiKey || apiKey.userId !== userId) {
    return false;
  }

  apiKey.isActive = false;
  console.log(`🗑️ API: Revoked API key "${apiKey.name}" for user ${userId}`);

  return true;
}

/**
 * Delete an API key permanently
 */
export function deleteApiKey(userId: number, keyId: string): boolean {
  const apiKey = apiKeys.get(keyId);

  if (!apiKey || apiKey.userId !== userId) {
    return false;
  }

  // Remove from storage
  apiKeys.delete(keyId);

  // Remove from user's key list
  const userKeys = userApiKeys.get(userId);
  if (userKeys) {
    const index = userKeys.indexOf(keyId);
    if (index > -1) {
      userKeys.splice(index, 1);
    }
  }

  console.log(`🗑️ API: Deleted API key "${apiKey.name}" for user ${userId}`);
  return true;
}
