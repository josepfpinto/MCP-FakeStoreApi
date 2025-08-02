"""Request and Response schemas for the LLM Server API."""
from pydantic import BaseModel
from typing import Optional


# Chat Schemas
class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str
    is_error: bool = False


# Authentication Schemas
class LoginRequest(BaseModel):
    """Request schema for user login."""
    username: str
    password: str


class UserData(BaseModel):
    """User information schema."""
    id: int
    firstName: str
    username: str


class LoginResponse(BaseModel):
    """Response schema for successful login."""
    success: bool = True
    data: dict
    error: Optional[str] = None

    class Config:
        # Allow arbitrary dict structure for data field
        extra = "allow"


# Health Check Schema
class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    version: str