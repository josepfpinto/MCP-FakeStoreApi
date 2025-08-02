import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  User,
  TokenPayload,
  ErrorCodes,
} from "../types";

const FAKE_STORE_API_BASE = "https://fakestoreapi.com";

// Helper function for internal authentication (used by MCP server)
export const authenticateUser = async (
  credentials: LoginRequest
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { username, password } = credentials;

    if (!username || !password) {
      return { success: false, error: "Username and password are required" };
    }

    // Authenticate with Fake Store API
    const loginResponse = await axios.post(
      `${FAKE_STORE_API_BASE}/auth/login`,
      {
        username,
        password,
      }
    );

    const token = loginResponse.data.token;
    if (!token) {
      return { success: false, error: "No token received from authentication" };
    }

    // Decode token to get user ID
    const decodedToken = jwt.decode(token) as TokenPayload;
    if (!decodedToken?.sub) {
      return { success: false, error: "Invalid token format" };
    }

    // Get user details
    const userResponse = await axios.get(
      `${FAKE_STORE_API_BASE}/users/${decodedToken.sub}`
    );
    const userData = userResponse.data;

    const user: User = {
      id: userData.id,
      firstName: userData.name.firstname,
      username: userData.username,
    };

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  console.log("🔐 LOGIN: Starting authentication process");
  console.log("🔐 LOGIN: Request body:", {
    username: req.body.username,
    password: "[REDACTED]",
  });

  try {
    const { username, password }: LoginRequest = req.body;

    // Validate required parameters
    if (!username || !password) {
      console.log(
        "❌ LOGIN: Missing credentials - username:",
        !!username,
        "password:",
        !!password
      );
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.MISSING_PARAMETERS,
          message: "Username and password are required",
          details: {
            requiredParameters: ["username", "password"],
            providedParameters: Object.keys(req.body),
          },
        },
      };
      res.status(400).json(response);
      return;
    }

    // Step 1: Authenticate with Fake Store API
    console.log("🌐 LOGIN: Calling Fake Store API for authentication");
    const loginResponse = await axios.post(
      `${FAKE_STORE_API_BASE}/auth/login`,
      {
        username,
        password,
      }
    );
    console.log("✅ LOGIN: Received response from Fake Store API");

    const { token } = loginResponse.data;

    if (!token) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.EXTERNAL_API_ERROR,
          message: "Authentication failed - no token received",
        },
      };
      res.status(401).json(response);
      return;
    }

    // Step 2: Decode token to get user ID
    console.log("🔓 LOGIN: Decoding JWT token");
    const decodedToken = jwt.decode(token) as TokenPayload;
    console.log("🔓 LOGIN: Token decoded, user ID:", decodedToken?.sub);

    if (!decodedToken || !decodedToken.sub) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: "Invalid token received from authentication service",
        },
      };
      res.status(401).json(response);
      return;
    }

    const userId = parseInt(decodedToken.sub);

    // Step 3: Fetch user details to get first name
    console.log("👤 LOGIN: Fetching user details for ID:", userId);
    const userResponse = await axios.get(
      `${FAKE_STORE_API_BASE}/users/${userId}`
    );
    const userData: User = userResponse.data;
    console.log("👤 LOGIN: User details received:", {
      id: userData.id,
      username: userData.username,
      firstName: userData.name?.firstname,
    });

    if (!userData) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.EXTERNAL_API_ERROR,
          message: "Failed to fetch user details",
        },
      };
      res.status(500).json(response);
      return;
    }

    // Step 4: Return success response with token and user info
    const responseData: LoginResponse = {
      token,
      user: {
        id: userData.id,
        firstName: userData.name?.firstname || "",
        username: userData.username || username,
      },
    };

    const successResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: responseData,
    };

    console.log(
      "✅ LOGIN: Authentication successful for user:",
      responseData.user.username
    );
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error("❌ LOGIN: Authentication failed:", error.message);

    // Handle Axios errors (e.g., 401 from Fake Store API)
    if (error.response) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.EXTERNAL_API_ERROR,
          message: "Authentication failed - invalid credentials",
          details: {
            statusCode: error.response.status,
            statusText: error.response.statusText,
          },
        },
      };
      res.status(401).json(response);
      return;
    }

    // Handle other errors
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Internal server error during authentication",
      },
    };
    res.status(500).json(response);
  }
};
