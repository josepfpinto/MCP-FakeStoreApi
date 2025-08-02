"""LLM Service using langchain-mcp-adapters for intelligent tool usage."""
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from loguru import logger
from typing import Dict, Any
from app.config import settings


class LLMService:
    """Service for LLM-powered chat with MCP tool integration."""

    def __init__(self):
        self.llm = None
        self.agent = None
        self.mcp_client = None
        self.is_initialized = False

        logger.info("LLMService instance created")

    async def initialize(self):
        """Initialize LLM and MCP client."""
        try:
            logger.info("Initializing LLM Service...")

            # Initialize OpenAI LLM
            self.llm = ChatOpenAI(
                api_key=settings.openai_api_key,
                model="gpt-4",
                temperature=0.1,
                max_tokens=1000
            )
            logger.info("OpenAI LLM initialized")

            # Initialize MCP Client with streamable HTTP transport
            # Using the configuration format from langchain-mcp-adapters
            self.mcp_client = MultiServerMCPClient({
                "shopping": {
                    "transport": "streamable_http",
                    "url": f"{settings.mcp_server_url}/mcp",  # Remove trailing slash
                    "headers": {
                        "X-MCP-API-Key": settings.mcp_api_key
                    }
                }
            })

            # Get tools from MCP server
            logger.info("Loading MCP tools...")
            tools = await self.mcp_client.get_tools()
            logger.info(f"Loaded {len(tools)} MCP tools")

            # Create ReAct agent with default settings
            self.agent = create_react_agent(self.llm, tools)
            logger.info("ReAct agent created successfully")

            self.is_initialized = True
            logger.success("LLM Service initialization completed")

        except Exception as e:
            logger.error(f"Failed to initialize LLM Service: {e}")
            self.is_initialized = False
            raise

    async def chat(self, message: str) -> str:
        """Process user message and return response."""
        try:
            if not self.is_initialized:
                logger.info("LLM Service not initialized, initializing now...")
                await self.initialize()

            if not self.agent:
                raise Exception("Agent not initialized")

            logger.info(f"Processing message: {message}")

            # Enhance message with shopping context
            enhanced_message = f"""You are an intelligent shopping assistant with access to a fake store catalog.

IMPORTANT - Available product categories (use these exact names):
- "electronics" - phones, laptops, computers, accessories
- "jewelery" - rings, necklaces, bracelets, earrings
- "men's clothing" - shirts, pants, jackets, shoes for men
- "women's clothing" - dresses, tops, jackets, shoes for women

When users search for clothing items like jackets, shirts, or pants:
- For men's items: use category "men's clothing"
- For women's items: use category "women's clothing"
- For general clothing searches: search both categories or omit category

Use your tools to:
1. search_products - Find products by name/description
2. add_to_cart - Add items to shopping cart
3. get_cart - View cart contents
4. remove_from_cart - Remove items from cart
5. get_categories - Get all available categories

Always be helpful and provide specific product details including prices and ratings.

User request: {message}"""

            # Use the agent to process the enhanced message
            response = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": enhanced_message}]
            })

            # Extract the final message from the response
            if "messages" in response and response["messages"]:
                # Get the last message (AI response)
                last_message = response["messages"][-1]
                if hasattr(last_message, 'content'):
                    result = last_message.content
                else:
                    result = str(last_message)
            else:
                result = str(response)

            logger.success(f"Generated response: {result[:100]}...")
            return result

        except Exception as e:
            logger.error(f"Error in chat processing: {e}")
            return f"❌ I'm sorry, I encountered an error: {str(e)}"

    async def close(self):
        """Cleanup resources."""
        if self.mcp_client:
            # Note: Check if mcp_client has a close method
            if hasattr(self.mcp_client, 'close'):
                await self.mcp_client.close()

        logger.info("LLM Service resources cleaned up")


# Global service instance (singleton pattern)
llm_service = LLMService()