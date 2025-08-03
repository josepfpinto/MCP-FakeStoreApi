import axios from "axios";

// Python LLM Server configuration
const CHAT_API_BASE_URL = "http://localhost:8001";

export interface ChatResponse {
  message: string;
  is_error: boolean;
}

export interface ChatRequest {
  message: string;
}

export class ChatService {
  private static instance: ChatService | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(message: string, jwtToken?: string): Promise<ChatResponse> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add JWT token if available for authenticated requests
      if (jwtToken) {
        headers["Authorization"] = `Bearer ${jwtToken}`;
      }

      const response = await axios.post(
        `${CHAT_API_BASE_URL}/api/v1/chat`,
        { message } as ChatRequest,
        {
          headers,
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error("Chat service error:", error);

      // Handle network errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;

          // Handle specific HTTP status codes
          switch (status) {
            case 401:
              return {
                message: "❌ Your session has expired. Please log in again.",
                is_error: true,
              };
            case 403:
              return {
                message: "❌ You don't have permission to access this service.",
                is_error: true,
              };
            case 429:
              return {
                message:
                  "❌ Too many requests. Please wait a moment before trying again.",
                is_error: true,
              };
            case 500:
            case 502:
            case 503:
            case 504:
              return {
                message:
                  "❌ The AI service is temporarily unavailable. Please try again in a few moments.",
                is_error: true,
              };
            default: {
              // Server responded with error status
              const errorMessage =
                errorData?.message ||
                errorData?.error ||
                `Server error (${status}) occurred`;
              return {
                message: `❌ ${errorMessage}`,
                is_error: true,
              };
            }
          }
        } else if (error.request) {
          // Check for timeout
          if (error.code === "ECONNABORTED") {
            return {
              message:
                "❌ Request timed out. The AI service might be busy. Please try again.",
              is_error: true,
            };
          }

          // Request was made but no response received
          return {
            message:
              "❌ Unable to connect to AI assistant. Please check if the Python server is running and your internet connection.",
            is_error: true,
          };
        }
      }

      // Handle specific error types
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          message: "❌ Network error. Please check your internet connection.",
          is_error: true,
        };
      }

      // Generic error fallback
      return {
        message: `❌ An unexpected error occurred: ${
          (error as Error)?.message ?? "Unknown error"
        }. Please try again.`,
        is_error: true,
      };
    }
  }

  /**
   * Check if the chat service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${CHAT_API_BASE_URL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.warn("Chat service health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
