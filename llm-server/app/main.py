"""FastAPI application entry point for LLM Server."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.config import settings
from app.api.chat import router as chat_router
from app.services.llm_service import llm_service
from app.models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting LLM Server...")

    # Configure logging
    logger.remove()  # Remove default handler
    logger.add(
        sys.stdout,
        level="INFO" if not settings.debug else "DEBUG",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )

    # Initialize LLM service (lazy initialization)
    logger.info("LLM Service will be initialized on first request")

    yield

    # Shutdown
    logger.info("Shutting down LLM Server...")
    await llm_service.close()


# Create FastAPI application
app = FastAPI(
    title="LLM Shopping Assistant Server",
    description="Python LLM server with MCP integration for intelligent shopping assistance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],  # Add any additional origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(chat_router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0"
    )


@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "LLM Shopping Assistant Server",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )