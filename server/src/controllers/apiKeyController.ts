import { Request, Response } from "express";
import {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiResponse,
  ErrorCodes,
} from "../types";
import {
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  deleteApiKey,
} from "../services/apiKeyService";

/**
 * Create a new API key for the authenticated user
 */
export const createUserApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("🔑 API_KEY: Creating new API key");

  try {
    const { name }: CreateApiKeyRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.MISSING_AUTH,
          message: "User authentication required",
        },
      };
      res.status(401).json(response);
      return;
    }

    if (!name || name.trim().length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_PARAMETERS,
          message: "API key name is required",
          details: {
            field: "name",
            requirement: "non-empty string",
          },
        },
      };
      res.status(400).json(response);
      return;
    }

    // Create the API key
    const apiKeyResponse = createApiKey(userId, { name: name.trim() });

    const successResponse: ApiResponse<CreateApiKeyResponse> = {
      success: true,
      data: apiKeyResponse,
    };

    console.log(`✅ API_KEY: Created "${name}" for user ${userId}`);
    res.status(201).json(successResponse);
  } catch (error: any) {
    console.error("❌ API_KEY: Creation failed:", error.message);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to create API key",
      },
    };
    res.status(500).json(response);
  }
};

/**
 * Get all API keys for the authenticated user
 */
export const listUserApiKeys = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("📋 API_KEY: Listing user API keys");

  try {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.MISSING_AUTH,
          message: "User authentication required",
        },
      };
      res.status(401).json(response);
      return;
    }

    const apiKeys = getUserApiKeys(userId);

    const successResponse: ApiResponse<typeof apiKeys> = {
      success: true,
      data: apiKeys,
    };

    console.log(`📋 API_KEY: Listed ${apiKeys.length} keys for user ${userId}`);
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error("❌ API_KEY: List failed:", error.message);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to list API keys",
      },
    };
    res.status(500).json(response);
  }
};

/**
 * Revoke an API key (disable but keep record)
 */
export const revokeUserApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("🚫 API_KEY: Revoking API key");

  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.MISSING_AUTH,
          message: "User authentication required",
        },
      };
      res.status(401).json(response);
      return;
    }

    if (!keyId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_PARAMETERS,
          message: "API key ID is required",
        },
      };
      res.status(400).json(response);
      return;
    }

    const success = revokeApiKey(userId, keyId);

    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_PARAMETERS,
          message: "API key not found or access denied",
        },
      };
      res.status(404).json(response);
      return;
    }

    const successResponse: ApiResponse<{ revoked: boolean }> = {
      success: true,
      data: { revoked: true },
    };

    console.log(`🚫 API_KEY: Revoked key ${keyId} for user ${userId}`);
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error("❌ API_KEY: Revoke failed:", error.message);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to revoke API key",
      },
    };
    res.status(500).json(response);
  }
};

/**
 * Delete an API key permanently
 */
export const deleteUserApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("🗑️ API_KEY: Deleting API key");

  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.MISSING_AUTH,
          message: "User authentication required",
        },
      };
      res.status(401).json(response);
      return;
    }

    if (!keyId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_PARAMETERS,
          message: "API key ID is required",
        },
      };
      res.status(400).json(response);
      return;
    }

    const success = deleteApiKey(userId, keyId);

    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_PARAMETERS,
          message: "API key not found or access denied",
        },
      };
      res.status(404).json(response);
      return;
    }

    const successResponse: ApiResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };

    console.log(`🗑️ API_KEY: Deleted key ${keyId} for user ${userId}`);
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error("❌ API_KEY: Delete failed:", error.message);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to delete API key",
      },
    };
    res.status(500).json(response);
  }
};
