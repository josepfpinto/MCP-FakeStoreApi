"""Request and Response schemas for the LLM Server API."""
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str
    is_error: bool = False


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    version: str