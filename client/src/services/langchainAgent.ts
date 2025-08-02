import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MCPShoppingTool } from "./mcpTool";
import type { RootState } from "../store";

export interface AgentResponse {
  message: string;
  isError: boolean;
}

export class LangChainAgentService {
  private agent: AgentExecutor | null = null;
  private getState: () => RootState;
  private isInitialized = false;

  constructor(getState: () => RootState) {
    this.getState = getState;
  }

  async initialize(): Promise<void> {
    try {
      console.log("🚀 Agent initialization starting...");
      const state = this.getState();
      const openaiApiKey = state.auth.openaiApiKey;

      if (!openaiApiKey) {
        console.log("❌ No OpenAI API key found");
        throw new Error("OpenAI API key not found. Please log in again.");
      }

      // Initialize OpenAI LLM
      const llm = new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: "gpt-4",
        temperature: 0.1, // Low temperature for more consistent responses
        maxTokens: 1000,
      });

      // Create tools
      const tools = [new MCPShoppingTool(this.getState)];

      // Create prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are a helpful shopping assistant. You can help users:
          - Search for products by name, category, or description
          - Add items to their shopping cart
          - Remove items from their cart
          - View their current cart contents
          - Browse product categories

          Always be friendly and helpful. When users ask about products, use the mcp_shopping tool to search for them.
          When they want to add something to cart, use the tool to add it.
          When they ask about their cart, use the tool to show the contents.

          If a user's request is unclear, ask for clarification politely.
          Always provide specific, actionable responses based on the tool results.`,
        ],
        ["human", "{input}"],
        ["assistant", "{agent_scratchpad}"],
      ]);

      // Create agent
      const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
      });

      // Create agent executor
      this.agent = new AgentExecutor({
        agent,
        tools,
        verbose: true, // Set to true for debugging
        maxIterations: 3,
        returnIntermediateSteps: false,
      });

      this.isInitialized = true;
      console.log("✅ Agent initialization completed successfully");
      console.log("🎯 Agent is now ready to process messages");
    } catch (error) {
      console.error("Failed to initialize LangChain agent:", error);
      this.isInitialized = false;
      throw error;
    }
  }

  async sendMessage(message: string): Promise<AgentResponse> {
    try {
      console.log("📨 Sending message:", message);

      if (!this.isReady()) {
        if (this.canInitialize()) {
          console.log("🔄 Agent not ready, initializing...");
          await this.initialize();
        } else {
          throw new Error("Agent cannot be initialized - missing API keys");
        }
      }

      if (!this.agent) {
        throw new Error("Agent failed to initialize");
      }

      // Execute the agent
      const result = await this.agent.invoke({
        input: message,
      });

      return {
        message: result.output || "I'm sorry, I couldn't process your request.",
        isError: false,
      };
    } catch (error) {
      console.error("Agent execution error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return {
            message:
              "❌ There's an issue with the API configuration. Please check your API keys in settings.",
            isError: true,
          };
        }

        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          return {
            message:
              "❌ Network error. Please check your connection and try again.",
            isError: true,
          };
        }

        return {
          message: `❌ Error: ${error.message}`,
          isError: true,
        };
      }

      return {
        message: "❌ An unexpected error occurred. Please try again.",
        isError: true,
      };
    }
  }

  canInitialize(): boolean {
    const state = this.getState();
    return (
      !!state.auth.openaiApiKey &&
      state.auth.mcpApiKeys.some((key) => key.isActive)
    );
  }

  isReady(): boolean {
    return this.isInitialized && this.canInitialize();
  }

  reset(): void {
    this.agent = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let agentServiceInstance: LangChainAgentService | null = null;

export const createAgentService = (
  getState: () => RootState
): LangChainAgentService => {
  if (!agentServiceInstance) {
    agentServiceInstance = new LangChainAgentService(getState);
  }
  return agentServiceInstance;
};

export const getAgentService = (): LangChainAgentService | null => {
  return agentServiceInstance;
};
