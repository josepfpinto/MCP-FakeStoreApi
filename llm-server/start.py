#!/usr/bin/env python3
"""Simple startup script for LLM Server."""
import os
import sys
from pathlib import Path

def main():
    """Start the LLM server with proper environment setup."""

    # Add current directory to Python path
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))

    # Check for .env file
    env_file = current_dir / ".env"
    if not env_file.exists():
        print("❌ .env file not found!")
        print("📝 Please copy env-template to .env and configure your API keys:")
        print("   cp env-template .env")
        print("   # Edit .env with your OpenAI API key and MCP API key")
        return 1

    # Import and run
    try:
        from app.main import app
        import uvicorn
        from app.config import settings

        print("🚀 Starting LLM Shopping Assistant Server...")
        print(f"📍 Server will run on: http://{settings.host}:{settings.port}")
        print(f"📚 API Documentation: http://{settings.host}:{settings.port}/docs")
        print(f"🏥 Health Check: http://{settings.host}:{settings.port}/health")
        print()

        # Start server
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level="info"
        )

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you've installed dependencies:")
        print("   pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())