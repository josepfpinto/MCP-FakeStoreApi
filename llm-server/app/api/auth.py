"""Authentication API endpoints."""
from fastapi import APIRouter
from loguru import logger
from app.models.schemas import LoginRequest, LoginResponse
from app.services.auth_service import auth_service
from app.services.api_key_manager import api_key_manager

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=LoginResponse)
async def login_endpoint(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user with MCP server and return user data.

    This endpoint:
    1. Validates user credentials with Node.js MCP server
    2. Fetches MCP API key for the session
    3. Stores credentials internally for later use
    4. Returns user information and success status
    """
    try:
        logger.info(f"Login attempt for user: {request.username}")

        # Authenticate with MCP server and get API key
        success, auth_data, error_msg = await auth_service.authenticate_user(request)

        if not success or not auth_data:
            logger.warning(f"Authentication failed for {request.username}: {error_msg}")
            return LoginResponse(
                success=False,
                data={},
                error=error_msg or "Authentication failed"
            )

        # Extract user data
        user_data = auth_data["user"]
        jwt_token = auth_data["token"]
        mcp_api_key = auth_data["mcp_api_key"]

        # Store credentials for this user session
        user_id = str(user_data["id"])  # Convert to string for key storage
        api_key_manager.store_user_credentials(
            user_id=user_id,
            mcp_api_key=mcp_api_key,
            jwt_token=jwt_token
        )

        logger.info(f"User {request.username} logged in successfully")

        # Return response matching the expected format from frontend
        return LoginResponse(
            success=True,
            data={
                "user": user_data,
                "token": jwt_token  # Frontend expects a token for session management
            },
            error=None
        )

    except Exception as e:
        logger.error(f"Error in login endpoint: {e}")
        return LoginResponse(
            success=False,
            data={},
            error="Server error occurred during authentication"
        )


@router.post("/logout")
async def logout_endpoint():
    """
    Logout endpoint (placeholder for future session management).

    Currently, this is a placeholder. In a full implementation, you would:
    1. Validate JWT token from Authorization header
    2. Remove user credentials from APIKeyManager
    3. Optionally revoke MCP API key
    """
    # For now, just return success
    # TODO: Implement proper session management with JWT validation
    return {"success": True, "message": "Logged out successfully"}


@router.get("/status")
async def auth_status():
    """Get authentication service status."""
    active_users = api_key_manager.get_active_users()
    cleaned = api_key_manager.cleanup_expired()

    return {
        "service": "authentication",
        "status": "healthy",
        "active_sessions": active_users,
        "cleaned_expired": cleaned
    }
