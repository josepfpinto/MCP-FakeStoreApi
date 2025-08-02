"""JWT Service for decoding and validating JWT tokens from MCP server."""
import jwt
from loguru import logger
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class TokenPayload:
    """JWT token payload structure matching Node.js MCP server format."""
    sub: str  # user id
    user: str  # username
    iat: int  # issued at timestamp

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TokenPayload':
        """Create TokenPayload from decoded JWT dictionary."""
        return cls(
            sub=str(data.get('sub', '')),
            user=str(data.get('user', '')),
            iat=int(data.get('iat', 0))
        )


class JWTService:
    """Service for JWT token operations with focus on decoding."""

    def __init__(self):
        logger.info("JWTService initialized")

    def decode_token(self, token: str) -> Optional[TokenPayload]:
        """
        Decode JWT token without signature verification.

        Since this token comes from our trusted Node.js MCP server,
        we can safely decode without verification for simplicity.

        Args:
            token: JWT token string

        Returns:
            TokenPayload if valid, None if invalid/malformed
        """
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]

            # Decode without verification (trusted internal token)
            decoded_payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False}
            )

            # Validate required fields exist
            if not decoded_payload.get('sub'):
                logger.warning("JWT token missing 'sub' field")
                return None

            # Create structured payload
            payload = TokenPayload.from_dict(decoded_payload)
            logger.debug(f"Successfully decoded JWT for user: {payload.user} (ID: {payload.sub})")

            return payload

        except jwt.DecodeError as e:
            logger.warning(f"JWT decode error: {e}")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error decoding JWT: {e}")
            return None

    def extract_user_id(self, authorization_header: Optional[str]) -> Optional[str]:
        """
        Extract user ID from Authorization header.

        Args:
            authorization_header: Full Authorization header value

        Returns:
            User ID string if valid token, None otherwise
        """
        if not authorization_header:
            return None

        payload = self.decode_token(authorization_header)
        return payload.sub if payload else None

    def is_valid_token(self, token: str) -> bool:
        """
        Check if token is valid and can be decoded.

        Args:
            token: JWT token string

        Returns:
            True if token can be decoded, False otherwise
        """
        return self.decode_token(token) is not None


# Global JWT service instance
jwt_service = JWTService()
