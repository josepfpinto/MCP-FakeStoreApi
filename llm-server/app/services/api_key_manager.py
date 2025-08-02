"""API Key Manager for storing and managing user MCP API keys."""
from typing import Dict, Optional
from loguru import logger
import threading
from datetime import datetime, timedelta


class APIKeyManager:
    """Thread-safe manager for storing and retrieving user MCP API keys."""

    def __init__(self):
        self._api_keys: Dict[str, Dict] = {}  # user_id -> {api_key, jwt_token, expires_at}
        self._lock = threading.RLock()
        logger.info("APIKeyManager initialized")

    def store_user_credentials(self, user_id: str, mcp_api_key: str, jwt_token: str, expires_hours: int = 24) -> None:
        """
        Store MCP API key and JWT token for a user.

        Args:
            user_id: Unique user identifier
            mcp_api_key: MCP API key from Node.js server
            jwt_token: JWT token for MCP server authentication
            expires_hours: Hours until credentials expire (default 24)
        """
        with self._lock:
            expires_at = datetime.now() + timedelta(hours=expires_hours)
            self._api_keys[user_id] = {
                "mcp_api_key": mcp_api_key,
                "jwt_token": jwt_token,
                "expires_at": expires_at,
                "created_at": datetime.now()
            }
            logger.info(f"Stored credentials for user {user_id}, expires at {expires_at}")

    def get_mcp_api_key(self, user_id: str) -> Optional[str]:
        """
        Get MCP API key for a user.

        Args:
            user_id: User identifier

        Returns:
            MCP API key if valid and not expired, None otherwise
        """
        with self._lock:
            user_data = self._api_keys.get(user_id)
            if not user_data:
                logger.debug(f"No credentials found for user {user_id}")
                return None

            # Check if credentials are expired
            if datetime.now() > user_data["expires_at"]:
                logger.warning(f"Credentials expired for user {user_id}")
                self._cleanup_user(user_id)
                return None

            return user_data["mcp_api_key"]

    def get_jwt_token(self, user_id: str) -> Optional[str]:
        """
        Get JWT token for a user.

        Args:
            user_id: User identifier

        Returns:
            JWT token if valid and not expired, None otherwise
        """
        with self._lock:
            user_data = self._api_keys.get(user_id)
            if not user_data:
                return None

            if datetime.now() > user_data["expires_at"]:
                self._cleanup_user(user_id)
                return None

            return user_data["jwt_token"]

    def remove_user(self, user_id: str) -> bool:
        """
        Remove user credentials (for logout).

        Args:
            user_id: User identifier

        Returns:
            True if user was removed, False if not found
        """
        with self._lock:
            if user_id in self._api_keys:
                del self._api_keys[user_id]
                logger.info(f"Removed credentials for user {user_id}")
                return True
            return False

    def _cleanup_user(self, user_id: str) -> None:
        """Internal method to remove expired user credentials."""
        if user_id in self._api_keys:
            del self._api_keys[user_id]
            logger.info(f"Cleaned up expired credentials for user {user_id}")

    def cleanup_expired(self) -> int:
        """
        Remove all expired credentials.

        Returns:
            Number of expired entries removed
        """
        with self._lock:
            now = datetime.now()
            expired_users = [
                user_id for user_id, data in self._api_keys.items()
                if now > data["expires_at"]
            ]

            for user_id in expired_users:
                del self._api_keys[user_id]

            if expired_users:
                logger.info(f"Cleaned up {len(expired_users)} expired credential entries")

            return len(expired_users)

    def get_active_users(self) -> int:
        """Get number of active users with valid credentials."""
        with self._lock:
            now = datetime.now()
            active = sum(1 for data in self._api_keys.values() if now <= data["expires_at"])
            return active

    def has_valid_credentials(self, user_id: str) -> bool:
        """Check if user has valid, non-expired credentials."""
        return self.get_mcp_api_key(user_id) is not None


# Global API key manager instance
api_key_manager = APIKeyManager()
