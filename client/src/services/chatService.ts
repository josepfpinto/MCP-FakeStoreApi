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
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Chat service error:", error);

      // Handle network errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Server error occurred";
          return {
            message: `❌ ${errorMessage}`,
            is_error: true,
          };
        } else if (error.request) {
          // Request was made but no response received
          return {
            message:
              "❌ Unable to connect to AI assistant. Please check if the Python server is running.",
            is_error: true,
          };
        }
      }

      // Generic error fallback
      return {
        message: "❌ An unexpected error occurred. Please try again.",
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
