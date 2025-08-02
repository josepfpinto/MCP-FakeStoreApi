import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse, TokenPayload, ErrorCodes } from "../types";

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("🔒 AUTH: Starting token authentication");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer TOKEN"
  console.log("🔒 AUTH: Token present:", !!token);

  if (!token) {
    console.log("❌ AUTH: No token provided");
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.MISSING_AUTH,
        message: "Authorization header missing",
      },
    };
    res.status(401).json(response);
    return;
  }

  try {
    // Note: In a real application, you would use a proper JWT secret
    // For this demo, we'll decode without verification since the Fake Store API
    // tokens are not using a standard format we can easily verify
    const decoded = jwt.decode(token) as TokenPayload;

    if (!decoded || !decoded.sub) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: "Authentication token is invalid or expired",
        },
      };
      res.status(401).json(response);
      return;
    }

    // Add user info to request
    req.user = {
      id: parseInt(decoded.sub),
      username: decoded.user,
    };

    console.log("✅ AUTH: Token validated for user:", {
      id: req.user.id,
      username: req.user.username,
    });
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INVALID_TOKEN,
        message: "Authentication token is invalid or expired",
      },
    };
    res.status(401).json(response);
  }
};
