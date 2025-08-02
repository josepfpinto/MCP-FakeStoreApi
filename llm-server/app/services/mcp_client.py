"""MCP Client Service for communicating with Node.js MCP Server."""
import httpx
from typing import Dict, Any, Optional
from loguru import logger
from app.config import settings


class MCPClient:
    """HTTP client for MCP protocol communication with Node.js server."""

    def __init__(self):
        self.base_url = settings.mcp_server_url
        self.api_key = settings.mcp_api_key
        self.mcp_endpoint = f"{self.base_url}/mcp"

        # HTTP client with timeout configuration
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={
                "Content-Type": "application/json",
                "X-MCP-API-Key": self.api_key
            }
        )

        logger.info(f"MCPClient initialized with base_url: {self.base_url}")

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.client.aclose()

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def _make_request(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make MCP JSON-RPC request to Node.js server."""
        request_data = {
            "jsonrpc": "2.0",
            "id": 1,  # Simple ID for now
            "method": method
        }

        if params:
            request_data["params"] = params

        logger.debug(f"MCP Request: {request_data}")

        try:
            response = await self.client.post(self.mcp_endpoint, json=request_data)
            response.raise_for_status()

            result = response.json()
            logger.debug(f"MCP Response: {result}")

            if "error" in result:
                logger.error(f"MCP Error: {result['error']}")
                raise Exception(f"MCP Error: {result['error']['message']}")

            return result

        except httpx.HTTPError as e:
            logger.error(f"HTTP Error in MCP request: {e}")
            raise Exception(f"MCP Server communication failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in MCP request: {e}")
            raise

    async def list_tools(self) -> Dict[str, Any]:
        """Get available tools from MCP server."""
        logger.info("Fetching available tools from MCP server")
        return await self._make_request("tools/list")

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Call a specific tool with arguments."""
        logger.info(f"Calling MCP tool: {tool_name} with args: {arguments}")

        params = {
            "name": tool_name,
            "arguments": arguments
        }

        response = await self._make_request("tools/call", params)

        # Extract text content from MCP response
        if "result" in response and "content" in response["result"]:
            content = response["result"]["content"]
            if content and len(content) > 0:
                return content[0].get("text", "No content returned")

        return "No response from MCP server"

    async def search_products(self, query: str, limit: int = 10) -> str:
        """Search for products."""
        return await self.call_tool("search_products", {"query": query, "limit": limit})

    async def add_to_cart(self, product_name: str, quantity: int = 1) -> str:
        """Add product to cart."""
        return await self.call_tool("add_to_cart", {"product_name": product_name, "quantity": quantity})

    async def get_cart(self, cart_id: int = 1) -> str:
        """Get cart contents."""
        return await self.call_tool("get_cart", {"cart_id": cart_id})

    async def get_categories(self) -> str:
        """Get product categories."""
        return await self.call_tool("get_categories", {})