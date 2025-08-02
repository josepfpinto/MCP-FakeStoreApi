"""Chat API endpoints."""
from fastapi import APIRouter, HTTPException
from loguru import logger
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Process user chat message using LLM with MCP tools.

    This endpoint receives user messages, processes them through the LLM agent
    which can intelligently use MCP tools for shopping operations.
    """
    try:
        logger.info(f"Received chat request: {request.message}")

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