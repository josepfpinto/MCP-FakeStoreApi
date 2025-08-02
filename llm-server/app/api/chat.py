"""Chat API endpoints."""
from fastapi import APIRouter, Header
from loguru import logger
from typing import Optional
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.api_key_manager import api_key_manager
from app.services.jwt_service import jwt_service

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
) -> ChatResponse:
    """
    Process user chat message using LLM with MCP tools.

    This endpoint receives user messages, processes them through the LLM agent
    which can intelligently use MCP tools for shopping operations.

    Authentication is optional - if provided, uses user-specific MCP API key.
    If not provided, falls back to environment variable (if configured).
    """
    try:
        logger.info(f"Received chat request: {request.message}")

        # Extract user ID from JWT token if provided
        user_id = None
        if authorization:
            user_id = jwt_service.extract_user_id(authorization)
            if user_id:
                logger.info(f"Authenticated request for user ID: {user_id}")
            else:
                logger.warning("Invalid JWT token provided - falling back to unauthenticated mode")

        # Initialize LLM service with user-specific or default credentials
        if not llm_service.is_initialized or user_id:
            # Reinitialize for user-specific API key or first-time init
            try:
                await llm_service.initialize(user_id=user_id)
            except ValueError as e:
                logger.warning(f"Failed to initialize with user credentials: {e}")

                # If user-specific initialization failed, check if we have a valid user session
                if user_id and not api_key_manager.has_valid_credentials(user_id):
                    return ChatResponse(
                        message="❌ Your session has expired or is invalid. Please log in again to continue chatting.",
                        is_error=True
                    )

                # Fallback to system initialization (environment variables)
                try:
                    await llm_service.initialize(user_id=None)
                except ValueError as fallback_error:
                    logger.error(f"System initialization also failed: {fallback_error}")
                    return ChatResponse(
                        message="❌ AI service is temporarily unavailable. Please try again later.",
                        is_error=True
                    )

        # Process message through LLM service
        response_message = await llm_service.chat(request.message)

        return ChatResponse(
            message=response_message,
            is_error=False
        )

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")

        # Return error response instead of raising HTTP exception
        # This maintains consistent response format for frontend
        return ChatResponse(
            message=f"❌ I'm sorry, I encountered an error: {str(e)}",
            is_error=True
        )
