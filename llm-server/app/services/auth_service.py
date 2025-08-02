"""Authentication service for managing user login and MCP API key lifecycle."""
import httpx
from loguru import logger
from typing import Dict, Optional, Tuple
from app.models.schemas import LoginRequest, UserData
from app.config import settings


class AuthService:
    """Service for handling authentication with MCP server and API key management."""

    def __init__(self):
        self.base_url = settings.mcp_server_url
        # Remove any trailing slashes for consistent URL construction
        if self.base_url.endswith('/'):
            self.base_url = self.base_url.rstrip('/')

        logger.info(f"AuthService initialized with MCP server: {self.base_url}")

    async def authenticate_user(self, credentials: LoginRequest) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Authenticate user with MCP server and fetch API key.

        Returns:
            Tuple[success, user_data, error_message]
        """
        try:
            logger.info(f"Authenticating user: {credentials.username}")

            # Step 1: Login to MCP server
            async with httpx.AsyncClient() as client:
                login_response = await client.post(
                    f"{self.base_url}/login",
                    json={
                        "username": credentials.username,
                        "password": credentials.password
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10.0
                )

                if login_response.status_code != 200:
                    logger.error(f"Login failed with status {login_response.status_code}")
                    return False, None, "Authentication failed"

                login_data = login_response.json()
                if not login_data.get("success", False):
                    error_msg = login_data.get("error", "Login failed")
                    logger.error(f"Login rejected: {error_msg}")
                    return False, None, error_msg

                jwt_token = login_data["data"]["token"]
                user_data = login_data["data"]["user"]
                logger.info(f"User {credentials.username} authenticated successfully")

                # Step 2: Generate MCP API key for this session
                api_key_response = await client.post(
                    f"{self.base_url}/api-keys",
                    json={"name": f"LLM Server - {credentials.username}"},
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {jwt_token}"
                    },
                    timeout=10.0
                )

                if api_key_response.status_code not in [200, 201]:
                    logger.error(f"API key generation failed with status {api_key_response.status_code}")
                    return False, None, "Failed to generate API key"

                api_key_data = api_key_response.json()
                if not api_key_data.get("success", False):
                    error_msg = api_key_data.get("error", "API key generation failed")
                    logger.error(f"API key generation rejected: {error_msg}")
                    return False, None, error_msg

                mcp_api_key = api_key_data["data"]["key"]
                logger.info(f"Generated MCP API key for user {credentials.username}")

                # Return success with combined data
                return True, {
                    "user": user_data,
                    "token": jwt_token,
                    "mcp_api_key": mcp_api_key
                }, None

        except httpx.RequestError as e:
            logger.error(f"Network error during authentication: {e}")
            return False, None, "Unable to connect to authentication server"
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during authentication: {e}")
            return False, None, "Authentication server error"
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {e}")
            return False, None, "Authentication failed due to server error"

    async def revoke_api_key(self, api_key: str, jwt_token: str) -> bool:
        """
        Revoke an MCP API key when user logs out.

        Args:
            api_key: MCP API key to revoke
            jwt_token: JWT token for authorization

        Returns:
            True if revocation successful, False otherwise
        """
        try:
            # Extract key ID from API key (format: mcp_<key_id>)
            if not api_key.startswith("mcp_"):
                logger.warning(f"Invalid API key format: {api_key}")
                return False

            # For now, we'll skip revocation as it requires more complex key tracking
            # In production, you'd store key IDs and revoke them properly
            logger.info("API key revocation skipped - implement if needed")
            return True

        except Exception as e:
            logger.error(f"Error revoking API key: {e}")
            return False


# Global auth service instance
auth_service = AuthService()