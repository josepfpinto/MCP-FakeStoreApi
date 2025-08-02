"""Configuration management using Pydantic Settings."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # OpenAI Configuration
    openai_api_key: str

    # MCP Server Configuration
    mcp_server_url: str = "https://29f37bbbb62f.ngrok-free.app"
    mcp_api_key: Optional[str] = None  # Optional - will be fetched dynamically per user

    # LLM Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = True

    # CORS Configuration
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
